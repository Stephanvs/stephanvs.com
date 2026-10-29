import { density, update, type Gaussian } from '../lib/gaussian';
import { bindSlider, metres, mountPlot, type Point } from './plot';

const range: [number, number] = [950, 1050];

export const curve = (g: Gaussian, [from, to]: [number, number] = range, samples = 240): Point[] =>
  Array.from({ length: samples + 1 }, (_, i) => {
    const x = from + ((to - from) * i) / samples;
    return [x, density(g, x)];
  });

export function mountFuse(root: HTMLElement) {
  const state = { priorMean: 992, priorSigma: 8, zMean: 1010, zSigma: 5 };
  const beliefs = () => {
    const prior = { mean: state.priorMean, variance: state.priorSigma ** 2 };
    const measurement = { mean: state.zMean, variance: state.zSigma ** 2 };
    return { prior, measurement, fused: update(prior, measurement) };
  };

  const plot = mountPlot(root.querySelector('[data-plot]')!, () => {
    const { prior, measurement, fused } = beliefs();
    const peak = density(fused, fused.mean);
    const zero = (points: Point[]): Point[] => points.map(([x]) => [x, 0]);
    const fusedCurve = curve(fused);
    return {
      x: range,
      y: [0, peak * 1.1],
      height: 240,
      xTitle: 'altitude, metres',
      yFormat: () => '',
      layers: [
        { kind: 'band', upper: fusedCurve, lower: zero(fusedCurve), tone: 'estimate' },
        { kind: 'line', points: curve(prior), tone: 'truth', dashed: true, thin: true },
        { kind: 'line', points: curve(measurement), tone: 'second' },
        { kind: 'line', points: fusedCurve, tone: 'estimate' }
      ],
      readout: (x) => ({
        title: `${x.toFixed(1)} m`,
        rows: [
          { label: 'combined', value: density(fused, x).toFixed(4), tone: 'estimate' },
          { label: 'sensor', value: density(measurement, x).toFixed(4), tone: 'second' },
          { label: 'belief', value: density(prior, x).toFixed(4), tone: 'truth' }
        ]
      })
    };
  });

  const stat = (name: string) => root.querySelector(`[data-stat="${name}"]`)!;
  const refresh = () => {
    const { prior, measurement, fused } = beliefs();
    plot.render();
    stat('gain').textContent = (prior.variance / (prior.variance + measurement.variance)).toFixed(2);
    stat('mean').textContent = metres(fused.mean);
    stat('sigma').textContent = metres(Math.sqrt(fused.variance));
  };

  for (const name of Object.keys(state) as (keyof typeof state)[]) {
    bindSlider(root, name, (v) => metres(v), (v) => {
      state[name] = v;
      refresh();
    });
  }
}
