import { levelThenClimb, simulateAltitude } from '../lib/altitude';
import { filterAltitude, type Step } from '../lib/gaussian';
import { bindSlider, metres, mountPlot, nearestIndex, type Point } from './plot';

const presets = {
  confident: { q: 0.05, r: 8 },
  balanced: { q: 0.8, r: 8 },
  nervous: { q: 6, r: 8 }
};

export function mountTune(root: HTMLElement) {
  const run = simulateAltitude({
    seed: 21,
    seconds: 120,
    dt: 0.5,
    start: 1000,
    climbRate: levelThenClimb(30, 5),
    turbulence: 0.8,
    altimeter: 8
  });
  const state = { q: 0.8, r: 8 };
  const compute = () => filterAltitude(run.readings, run.climbRates, run.dt, state.q, state.r, { mean: 1000, variance: 100 });
  let steps: Step[] = compute();
  const at = (fn: (k: number) => number): Point[] => run.t.map((t, k) => [t, fn(k)]);
  const error = (k: number) => steps[k].estimate.mean - run.truth[k];
  const sigma = (k: number) => Math.sqrt(steps[k].estimate.variance);
  const gain = (k: number) => steps[k].predicted.variance / (steps[k].predicted.variance + state.r ** 2);

  const errorPlot = mountPlot(root.querySelector('[data-plot="error"]')!, () => ({
    x: [0, 120],
    y: [-30, 30],
    xTitle: 'seconds',
    yTitle: 'error, m',
    layers: [
      { kind: 'dots', points: at((k) => run.readings[k] - run.truth[k]), tone: 'reading', radius: 2 },
      { kind: 'band', upper: at((k) => 2 * sigma(k)), lower: at((k) => -2 * sigma(k)), tone: 'estimate' },
      { kind: 'line', points: at(error), tone: 'estimate' }
    ],
    readout: (x) => {
      const k = nearestIndex(run.t, x);
      return {
        title: `${run.t[k].toFixed(1)} s`,
        rows: [
          { label: 'filter error', value: metres(error(k)), tone: 'estimate' },
          { label: 'filter 2σ', value: `±${metres(2 * sigma(k))}`, tone: 'estimate' },
          { label: 'reading error', value: metres(run.readings[k] - run.truth[k]), tone: 'reading' }
        ]
      };
    }
  }));

  const gainPlot = mountPlot(root.querySelector('[data-plot="gain"]')!, () => ({
    x: [0, 120],
    y: [0, 1],
    height: 150,
    xTitle: 'seconds',
    layers: [{ kind: 'line', points: at(gain), tone: 'estimate' }],
    readout: (x) => {
      const k = nearestIndex(run.t, x);
      return { title: `${run.t[k].toFixed(1)} s`, rows: [{ label: 'gain', value: gain(k).toFixed(3), tone: 'estimate' }] };
    }
  }));

  const stat = (name: string) => root.querySelector(`[data-stat="${name}"]`)!;
  const rms = (fn: (k: number) => number) => Math.sqrt(run.t.reduce((s, _, k) => s + fn(k) ** 2, 0) / run.t.length);
  const refresh = () => {
    steps = compute();
    errorPlot.render();
    gainPlot.render();
    const inside = run.t.filter((_, k) => Math.abs(error(k)) <= 2 * sigma(k)).length / run.t.length;
    stat('raw').textContent = `±${metres(rms((k) => run.readings[k] - run.truth[k]))}`;
    stat('filtered').textContent = `±${metres(rms(error))}`;
    stat('inside').textContent = `${Math.round(inside * 100)}%`;
  };

  const inputs = {
    q: bindSlider(root, 'q', (v) => `${v.toFixed(2)} m`, (v) => ((state.q = v), refresh())),
    r: bindSlider(root, 'r', (v) => `${v.toFixed(1)} m`, (v) => ((state.r = v), refresh()))
  };
  const buttons = root.querySelectorAll<HTMLButtonElement>('[data-preset]');
  const markPreset = () =>
    buttons.forEach((button) => {
      const preset = presets[button.dataset.preset as keyof typeof presets];
      button.setAttribute('aria-pressed', String(preset.q === state.q && preset.r === state.r));
    });
  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      const preset = presets[button.dataset.preset as keyof typeof presets];
      for (const key of ['q', 'r'] as const) {
        inputs[key].value = String(preset[key]);
        inputs[key].dispatchEvent(new Event('input', { bubbles: true }));
      }
    })
  );
  root.addEventListener('input', markPreset);
  markPreset();
}
