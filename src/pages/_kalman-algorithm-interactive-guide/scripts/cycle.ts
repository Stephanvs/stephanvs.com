import { simulateAltitude } from '../lib/altitude';
import { density, filterAltitude, type Gaussian } from '../lib/gaussian';
import { curve } from './fuse';
import { metres, mountPlot, type Layer } from './plot';

const climb = 5;
const turbulence = 1.5;
const altimeter = 8;
const start: Gaussian = { mean: 1000, variance: 15 ** 2 };

type Phase =
  | { kind: 'start' }
  | { kind: 'predicted'; k: number }
  | { kind: 'updated'; k: number };

export function mountCycle(root: HTMLElement) {
  const run = simulateAltitude({ seed: 9, seconds: 20, dt: 1, start: 1000, climbRate: () => climb, turbulence, altimeter });
  const steps = filterAltitude(run.readings, run.climbRates, 1, turbulence, altimeter, start);
  const last = steps.length * 2;
  let position = 0;
  const tallest = Math.max(...steps.map(({ estimate }) => density(estimate, estimate.mean)));

  const phaseAt = (p: number): Phase =>
    p === 0 ? { kind: 'start' } : p % 2 === 1 ? { kind: 'predicted', k: (p - 1) / 2 } : { kind: 'updated', k: p / 2 - 1 };
  const estimateBefore = (k: number) => (k === 0 ? start : steps[k - 1].estimate);
  const truthAt = (phase: Phase) => (phase.kind === 'start' ? 1000 : run.truth[phase.k]);
  const sigma = (g: Gaussian) => Math.sqrt(g.variance);

  const plot = mountPlot(root.querySelector('[data-plot]')!, () => {
    const phase = phaseAt(position);
    const centre = phase.kind === 'start' ? 1000 : steps[phase.k].predicted.mean;
    const range: [number, number] = [centre - 50, centre + 50];
    const layers: Layer[] = [];
    let belief = start;
    if (phase.kind === 'predicted') {
      layers.push({ kind: 'line', points: curve(estimateBefore(phase.k), range), tone: 'truth', dashed: true, thin: true });
      belief = steps[phase.k].predicted;
    }
    if (phase.kind === 'updated') {
      const reading: Gaussian = { mean: run.readings[phase.k], variance: altimeter ** 2 };
      layers.push({ kind: 'line', points: curve(steps[phase.k].predicted, range), tone: 'truth', dashed: true, thin: true });
      layers.push({ kind: 'line', points: curve(reading, range), tone: 'second' });
      belief = steps[phase.k].estimate;
    }
    const shape = curve(belief, range);
    layers.unshift({ kind: 'band', upper: shape, lower: shape.map(([x]) => [x, 0]), tone: 'estimate' });
    layers.push({ kind: 'line', points: shape, tone: 'estimate' }, { kind: 'line', points: [[truthAt(phase), 0], [truthAt(phase), tallest * 1.1]], tone: 'truth' });
    return {
      x: range,
      y: [0, tallest * 1.1],
      height: 240,
      xTitle: 'altitude, metres',
      yFormat: () => '',
      layers
    };
  });

  const phaseEl = root.querySelector('[data-phase]')!;
  const narration = root.querySelector('[data-narration]')!;
  const next = root.querySelector<HTMLButtonElement>('[data-next]')!;
  const back = root.querySelector<HTMLButtonElement>('[data-back]')!;

  const describe = (phase: Phase) => {
    if (phase.kind === 'start') {
      return `Before the first reading the filter guesses 1,000 m, give or take ${metres(sigma(start), 0)}. Press predict to let one second pass.`;
    }
    const { predicted, estimate } = steps[phase.k];
    if (phase.kind === 'predicted') {
      return `The autopilot climbs at ${climb} m/s, so the belief moves up ${climb} m. Turbulence could have pushed the aircraft anywhere nearby, so the bell widens to ±${metres(sigma(predicted))}.`;
    }
    return `The altimeter reads ${metres(run.readings[phase.k])} (±${altimeter} m). Combining it with the prediction gives ${metres(estimate.mean)}, ±${metres(sigma(estimate))}. The truth is ${metres(run.truth[phase.k])}.`;
  };

  const refresh = () => {
    const phase = phaseAt(position);
    plot.render();
    phaseEl.textContent = phase.kind === 'start' ? 'Start' : `Second ${phase.k + 1} · ${phase.kind === 'predicted' ? 'after predict' : 'after update'}`;
    narration.textContent = describe(phase);
    next.textContent = position % 2 === 0 ? 'Predict' : 'Update';
    next.disabled = position >= last;
    back.disabled = position === 0;
  };

  next.addEventListener('click', () => {
    position = Math.min(last, position + 1);
    refresh();
  });
  back.addEventListener('click', () => {
    position = Math.max(0, position - 1);
    refresh();
  });
  root.querySelector('[data-reset]')!.addEventListener('click', () => {
    position = 0;
    refresh();
  });
  refresh();
}
