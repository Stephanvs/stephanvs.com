import { levelThenClimb, simulateAltitude } from '../lib/altitude';
import { smooth } from '../lib/gaussian';
import { bindSlider, extent, metres, mountPlot, nearestIndex, type Point } from './plot';

export function mountAverage(root: HTMLElement) {
  const run = simulateAltitude({
    seed: 5,
    seconds: 90,
    dt: 0.5,
    start: 1000,
    climbRate: levelThenClimb(30, 5),
    turbulence: 0,
    altimeter: 6
  });
  let averaged: number[] = [];
  const at = (values: number[]): Point[] => values.map((v, k) => [run.t[k], v]);

  const plot = mountPlot(root.querySelector('[data-plot]')!, () => ({
    x: [0, 90],
    y: extent([...run.readings, ...run.truth]),
    xTitle: 'seconds',
    yTitle: 'metres',
    layers: [
      { kind: 'dots', points: at(run.readings), tone: 'reading', radius: 2 },
      { kind: 'line', points: at(run.truth), tone: 'truth' },
      { kind: 'line', points: at(averaged), tone: 'estimate' }
    ],
    readout: (x) => {
      const k = nearestIndex(run.t, x);
      return {
        title: `${run.t[k].toFixed(1)} s`,
        rows: [
          { label: 'average', value: metres(averaged[k]), tone: 'estimate' },
          { label: 'truth', value: metres(run.truth[k]), tone: 'truth' },
          { label: 'reading', value: metres(run.readings[k]), tone: 'reading' }
        ]
      };
    }
  }));

  const noiseEl = root.querySelector('[data-stat="noise"]')!;
  const lagEl = root.querySelector('[data-stat="lag"]')!;
  const indices = (keep: (t: number) => boolean) => run.t.flatMap((t, k) => (keep(t) ? [k] : []));
  const level = indices((t) => t > 10 && t <= 30);
  const climbing = indices((t) => t > 60);

  bindSlider(root, 'alpha', (v) => v.toFixed(2), (alpha) => {
    let value = run.readings[0];
    averaged = run.readings.map((z) => (value = smooth(value, z, alpha)));
    plot.render();
    const spread = Math.sqrt(level.reduce((s, k) => s + (averaged[k] - run.truth[k]) ** 2, 0) / level.length);
    const lag = climbing.reduce((s, k) => s + (run.truth[k] - averaged[k]), 0) / climbing.length;
    noiseEl.textContent = `±${metres(spread)}`;
    lagEl.textContent = metres(lag);
  });
}
