import { noise, seeded } from '../lib/random';
import { bindSlider, metres, mountPlot, type Point } from './plot';

const span = 30;
const rate = 4;
const truth = 1000;

export function mountAltimeter(root: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const random = seeded(11);
  const unit = Array.from({ length: 4000 }, () => noise(random, 1));
  let sigma = 6;
  let head = span * rate;
  let playing = !reduced;
  let inView = false;

  const readingEl = root.querySelector<HTMLElement>('[data-reading]')!;
  const truthEl = root.querySelector<HTMLElement>('[data-truth]')!;
  const pause = root.querySelector<HTMLButtonElement>('[data-pause]')!;

  const visible = (): Point[] => {
    const points: Point[] = [];
    for (let k = head - span * rate; k < head; k++) points.push([k / rate, truth + sigma * unit[k % unit.length]]);
    return points;
  };

  const plot = mountPlot(root.querySelector('[data-plot]')!, () => {
    const points = visible();
    const start = points[0][0];
    return {
      x: [start, start + span],
      y: [truth - 50, truth + 50],
      height: 240,
      xTitle: 'seconds',
      yTitle: 'metres',
      xFormat: (v) => `${Math.round(v)}`,
      layers: [
        { kind: 'line', points: [[start, truth], [start + span, truth]], tone: 'truth' },
        { kind: 'dots', points, tone: 'reading' }
      ],
      readout: (x) => {
        const point = points.reduce((best, p) => (Math.abs(p[0] - x) < Math.abs(best[0] - x) ? p : best));
        return {
          title: `${point[0].toFixed(2)} s`,
          rows: [
            { label: 'reading', value: metres(point[1]), tone: 'reading' },
            { label: 'truth', value: metres(truth), tone: 'truth' }
          ]
        };
      }
    };
  });

  const showLatest = () => {
    const latest = truth + sigma * unit[(head - 1) % unit.length];
    readingEl.firstChild!.textContent = latest.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    truthEl.textContent = `Truth 1,000.0 m · off by ${metres(Math.abs(latest - truth))}`;
  };

  bindSlider(root, 'noise', (v) => `${v.toFixed(1)} m`, (v) => {
    sigma = v;
    plot.render();
    showLatest();
  });

  const syncButton = () => {
    pause.textContent = playing ? 'Pause' : 'Play';
  };
  pause.addEventListener('click', () => {
    playing = !playing;
    syncButton();
  });
  syncButton();

  new IntersectionObserver(([entry]) => (inView = entry.isIntersecting)).observe(root);
  setInterval(() => {
    if (!playing || !inView || document.hidden) return;
    head++;
    plot.render();
    showLatest();
  }, 1000 / rate);
}
