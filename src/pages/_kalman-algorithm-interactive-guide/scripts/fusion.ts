import {
  altitudeSensor,
  simulateVertical,
  trackAltitude,
  verticalSeconds,
  type AltitudeEvent,
  type AltitudeSensor,
  type VerticalStep
} from '../lib/vertical';
import { metres, mountPlot, nearestIndex, type Layer, type Point } from './plot';

const sensors = { baro: altitudeSensor(3), gps: altitudeSensor(8) };
const outageWindow: [number, number] = [20, 35];

export function mountFusion(root: HTMLElement) {
  const state = { baro: true, gps: true, outage: false };
  let run = compute();

  function compute() {
    const { truth, events } = simulateVertical({
      seed: 8,
      sensors: { baro: { rate: 10, sigma: 3, enabled: state.baro }, gps: { rate: 1, sigma: 8, enabled: state.gps } },
      outage: state.outage ? outageWindow : undefined
    });
    const steps = trackAltitude(events, sensors, 0.5).filter((s) => s.event.kind === 'clock');
    const truthAt = (t: number) => truth[Math.min(truth.length - 1, Math.round(t * 10))].altitude;
    return { truth, events, steps, truthAt, times: steps.map((s) => s.t) };
  }

  const error = (s: VerticalStep) => s.estimate.x[0][0] - run.truthAt(s.t);
  const sigma = (s: VerticalStep) => Math.sqrt(s.estimate.P[0][0]);

  const plot = mountPlot(root.querySelector('[data-plot]')!, () => {
    const readings = (kind: AltitudeSensor): Point[] =>
      run.events
        .filter((e): e is Extract<AltitudeEvent, { kind: AltitudeSensor }> => e.kind === kind)
        .map((e) => [e.t, e.altitude - run.truthAt(e.t)]);
    const at = (fn: (s: VerticalStep) => number): Point[] => run.steps.map((s) => [s.t, fn(s)]);
    const layers: Layer[] = [];
    const span = Math.max(25, 1.1 * Math.max(...run.steps.filter((s) => s.t > 5).map((s) => Math.max(Math.abs(error(s)), 2 * sigma(s)))));
    if (state.outage) layers.push({ kind: 'span', from: outageWindow[0], to: outageWindow[1], label: 'No sensors' });
    layers.push(
      { kind: 'dots', points: readings('baro'), tone: 'second', radius: 1.6 },
      { kind: 'dots', points: readings('gps'), tone: 'reading', radius: 3 },
      { kind: 'band', upper: at((s) => 2 * sigma(s)), lower: at((s) => -2 * sigma(s)), tone: 'estimate' },
      { kind: 'line', points: at(error), tone: 'estimate' }
    );
    return {
      x: [0, verticalSeconds],
      y: [-span, span],
      xTitle: 'seconds',
      yTitle: 'error, m',
      layers,
      readout: (x) => {
        const s = run.steps[nearestIndex(run.times, x)];
        return {
          title: `${s.t.toFixed(1)} s`,
          rows: [
            { label: 'filter error', value: metres(error(s)), tone: 'estimate' },
            { label: 'filter 2σ', value: `±${metres(2 * sigma(s))}`, tone: 'estimate' }
          ]
        };
      }
    };
  });

  const stat = (name: string) => root.querySelector(`[data-stat="${name}"]`)!;
  const refresh = () => {
    run = compute();
    plot.render();
    const settled = run.steps.filter((s) => s.t > 5);
    const rms = Math.sqrt(settled.reduce((sum, s) => sum + error(s) ** 2, 0) / settled.length);
    stat('error').textContent = `±${metres(rms)}`;
    stat('widest').textContent = `±${metres(Math.max(...settled.map((s) => 2 * sigma(s))))}`;
  };

  root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((input) =>
    input.addEventListener('change', () => {
      state[input.name as keyof typeof state] = input.checked;
      refresh();
    })
  );
  refresh();
}
