import { fly, frameRate, type Frame } from '../lib/aircraft';
import { degrees, flightPlan, simulateFlight } from '../lib/flight';
import { toEnu, type Enu, type Geodetic } from '../lib/geo';
import { gyroBias, sampleSensors, type SensorEvent } from '../lib/sensors';
import type { CameraMode } from './flight-scene';
import { bindSlider, metres, mountPlot, nearestIndex, type Layer, type Point } from './plot';

const outageWindow: [number, number] = [128, 160];
const strideForPlots = 2;

interface Fix {
  t: number;
  point: Enu;
  fix: Geodetic;
}

const clock = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const angle = (radians: number) => `${(radians / degrees).toFixed(1)}°`;
const bank = (radians: number) => {
  const value = radians / degrees;
  return Math.abs(value) < 0.5 ? 'level' : `${Math.abs(value).toFixed(1)}° ${value < 0 ? 'left' : 'right'}`;
};
const heading = (radians: number) => `${String(Math.round((((radians / degrees) % 360) + 360) % 360)).padStart(3, '0')}°`;
const horizontalError = (f: Frame) => Math.hypot(f.estimate.east - f.truth.east, f.estimate.north - f.truth.north);
const horizontalSigma = (f: Frame) => Math.hypot(f.sigma.east, f.sigma.north);

export function mountFlight(root: HTMLElement) {
  let started = false;
  new IntersectionObserver(
    ([entry]) => {
      if (started || !entry.isIntersecting) return;
      started = true;
      start(root);
    },
    { rootMargin: '600px 0px' }
  ).observe(root);
}

async function start(root: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const truth = simulateFlight(7);
  const options = { seed: 3, noiseScale: 1, outage: false, estimateBias: true };
  const playback = { playing: false, speed: 4, t: 0, index: 0, inView: false, autoplayed: false };

  const compute = () => {
    const events = sampleSensors(truth, {
      seed: options.seed,
      noiseScale: options.noiseScale,
      outage: options.outage ? outageWindow : undefined
    });
    const frames = fly(truth, events, { noiseScale: options.noiseScale, estimateBias: options.estimateBias });
    const fixes = events
      .filter((e): e is Extract<SensorEvent, { kind: 'gps' }> => e.kind === 'gps')
      .map((e): Fix => ({ t: e.t, point: toEnu(e.fix), fix: e.fix }));
    return { frames, fixes, fixTimes: fixes.map((f) => f.t) };
  };
  let run = compute();
  const frame = () => run.frames[playback.index];

  const q = <T extends Element = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const status = q('[data-status]');
  const badge = q('[data-badge]');
  const scrub = q<HTMLInputElement>('[data-scrub]');
  const clockEl = q<HTMLOutputElement>('[data-clock]');
  const play = q<HTMLButtonElement>('[data-play]');
  const est = (key: string) => q(`[data-est="${key}"]`);
  const tru = (key: string) => q(`[data-truth="${key}"]`);

  const spans = (): Layer[] =>
    options.outage ? [{ kind: 'span', from: outageWindow[0], to: outageWindow[1], label: 'GPS lost' }] : [];
  const sampled = () => run.frames.filter((_, i) => i % strideForPlots === 0);
  const seriesOf = (fn: (f: Frame) => number): Point[] => sampled().map((f) => [f.t, fn(f)]);
  const frameAt = (t: number) => run.frames[Math.max(0, Math.min(run.frames.length - 1, Math.round(t * frameRate)))];

  const errorPlot = mountPlot(q('[data-plot="error"]'), () => {
    const top = Math.max(...run.frames.filter((f) => f.t > 5).map((f) => Math.max(2 * horizontalSigma(f), horizontalError(f))));
    return {
      x: [0, run.frames.at(-1)!.t],
      y: [0, top * 1.1],
      height: 170,
      xFormat: clock,
      yTitle: 'metres',
      layers: [
        ...spans(),
        { kind: 'band', upper: seriesOf((f) => 2 * horizontalSigma(f)), lower: seriesOf(() => 0), tone: 'estimate' },
        { kind: 'line', points: seriesOf(horizontalError), tone: 'estimate' }
      ],
      readout: (x) => {
        const f = frameAt(x);
        return {
          title: clock(f.t),
          rows: [
            { label: 'error', value: metres(horizontalError(f)), tone: 'estimate' },
            { label: 'filter 2σ', value: `±${metres(2 * horizontalSigma(f))}`, tone: 'estimate' }
          ]
        };
      }
    };
  });

  const bankPlot = mountPlot(q('[data-plot="bank"]'), () => ({
    x: [0, run.frames.at(-1)!.t],
    y: [-35, 35],
    height: 170,
    xFormat: clock,
    yTitle: 'degrees',
    yFormat: (v) => `${v}°`,
    layers: [
      ...spans(),
      { kind: 'line', points: seriesOf((f) => f.truth.roll / degrees), tone: 'truth' },
      { kind: 'line', points: seriesOf((f) => f.estimate.roll / degrees), tone: 'estimate' }
    ],
    readout: (x) => {
      const f = frameAt(x);
      return {
        title: clock(f.t),
        rows: [
          { label: 'estimate', value: bank(f.estimate.roll), tone: 'estimate' },
          { label: 'truth', value: bank(f.truth.roll), tone: 'truth' }
        ]
      };
    }
  }));

  let lastReadout = -1;
  const updateReadouts = () => {
    const f = frame();
    if (!f || f.t === lastReadout) return;
    lastReadout = f.t;
    const fixIndex = nearestIndex(run.fixTimes, f.t);
    const lastFix = run.fixes[run.fixTimes[fixIndex] > f.t ? fixIndex - 1 : fixIndex];
    const lost = options.outage && f.t >= outageWindow[0] && f.t < outageWindow[1];
    est('clock').textContent = clock(f.t);
    tru('clock').textContent = flightPlan[f.leg].name;
    est('gps').textContent = lastFix ? `${lastFix.fix.lat.toFixed(5)}° N ${lastFix.fix.lon.toFixed(5)}° E` : '–';
    tru('gps').textContent = lastFix ? (lost ? `no fix for ${Math.round(f.t - lastFix.t)} s` : `${Math.round(lastFix.fix.alt)} m`) : '';
    est('altitude').textContent = metres(f.estimate.up);
    tru('altitude').textContent = `truth ${metres(f.truth.up)}`;
    est('roll').textContent = bank(f.estimate.roll);
    tru('roll').textContent = `truth ${bank(f.truth.roll)}`;
    est('pitch').textContent = angle(f.estimate.pitch);
    tru('pitch').textContent = `truth ${angle(f.truth.pitch)}`;
    est('yaw').textContent = heading(f.estimate.yaw);
    tru('yaw').textContent = `truth ${heading(f.truth.yaw)}`;
    est('error').textContent = metres(horizontalError(f));
    tru('error').textContent = `2σ ±${metres(2 * horizontalSigma(f), 0)}`;
    const perSecond = (r: number) => (r / degrees).toFixed(2);
    est('bias').textContent = `${perSecond(f.bias.roll)} · ${perSecond(f.bias.pitch)} · ${perSecond(f.bias.yaw)} °/s`;
    tru('bias').textContent = `injected ${perSecond(gyroBias.roll)} · ${perSecond(gyroBias.pitch)} · ${perSecond(gyroBias.yaw)}`;
    scrub.value = String(playback.index);
    clockEl.value = clock(f.t);
    badge.hidden = false;
    badge.textContent = lost ? `${flightPlan[f.leg].name} · GPS lost` : flightPlan[f.leg].name;
    badge.dataset.alert = String(lost);
    errorPlot.setCursor(f.t);
    bankPlot.setCursor(f.t);
  };

  scrub.max = String(run.frames.length - 1);
  updateReadouts();

  status.textContent = 'Loading the 3D view';
  let scene: Awaited<ReturnType<typeof import('./flight-scene')['createFlightScene']>> | null = null;
  try {
    const { createFlightScene } = await import('./flight-scene');
    scene = createFlightScene(q('[data-stage]'), truth);
    scene.setRun(run.frames, run.fixes);
    status.hidden = true;
  } catch {
    status.textContent = 'The 3D view needs WebGL, which this browser does not offer. The readouts and charts still work.';
  }

  const seek = (index: number, snap = true) => {
    playback.index = Math.max(0, Math.min(run.frames.length - 1, index));
    playback.t = run.frames[playback.index].t;
    scene?.show(playback.index, snap);
    scene?.render();
    updateReadouts();
  };

  const setPlaying = (playing: boolean) => {
    const wasPlaying = playback.playing;
    playback.playing = playing;
    play.textContent = playing ? 'Pause' : 'Play';
    if (playing && playback.index >= run.frames.length - 1) seek(0);
    if (playing && !wasPlaying) startLoop();
  };

  let last = 0;
  let running = false;
  const startLoop = () => {
    if (running) return;
    running = true;
    requestAnimationFrame(tick);
  };
  function tick(now: number) {
    if (!playback.playing || !playback.inView) {
      last = 0;
      running = false;
      return;
    }
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    playback.t += dt * playback.speed;
    const index = Math.min(run.frames.length - 1, Math.floor(playback.t * frameRate));
    if (index !== playback.index) {
      playback.index = index;
      scene?.show(index);
      updateReadouts();
    }
    scene?.render();
    if (index >= run.frames.length - 1) {
      running = false;
      last = 0;
      return setPlaying(false);
    }
    requestAnimationFrame(tick);
  }

  const recompute = () => {
    run = compute();
    scrub.max = String(run.frames.length - 1);
    scene?.setRun(run.frames, run.fixes);
    errorPlot.render();
    bankPlot.render();
    lastReadout = -1;
    seek(playback.index, false);
  };

  play.addEventListener('click', () => setPlaying(!playback.playing));
  scrub.addEventListener('input', () => seek(Number(scrub.value)));
  for (const plot of [errorPlot, bankPlot]) {
    plot.svg.addEventListener('click', (event) => seek(Math.round(plot.toData(event.clientX) * frameRate)));
  }

  const pressGroup = (selector: string, active: HTMLButtonElement) =>
    root.querySelectorAll<HTMLButtonElement>(selector).forEach((b) => b.setAttribute('aria-pressed', String(b === active)));
  root.querySelectorAll<HTMLButtonElement>('[data-speed]').forEach((button) =>
    button.addEventListener('click', () => {
      playback.speed = Number(button.dataset.speed);
      pressGroup('[data-speed]', button);
    })
  );
  root.querySelectorAll<HTMLButtonElement>('[data-camera]').forEach((button) =>
    button.addEventListener('click', () => {
      scene?.setCamera(button.dataset.camera as CameraMode);
      pressGroup('[data-camera]', button);
    })
  );
  root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((input) =>
    input.addEventListener('change', () => {
      if (input.name === 'outage') options.outage = input.checked;
      if (input.name === 'estimateBias') options.estimateBias = input.checked;
      recompute();
    })
  );
  let pending = 0;
  bindSlider(root, 'noise', (v) => `×${v.toFixed(2)}`, (v) => {
    if (v === options.noiseScale) return;
    options.noiseScale = v;
    clearTimeout(pending);
    pending = window.setTimeout(recompute, 150);
  });
  q('[data-reseed]').addEventListener('click', () => {
    options.seed = (options.seed * 16807) % 2147483647;
    recompute();
  });

  new IntersectionObserver(
    ([entry]) => {
      playback.inView = entry.isIntersecting;
      if (playback.inView && !playback.autoplayed && !reduced) {
        playback.autoplayed = true;
        setPlaying(true);
      } else if (playback.inView && playback.playing) {
        startLoop();
      }
    },
    { threshold: 0.35 }
  ).observe(q('[data-stage]'));
}
