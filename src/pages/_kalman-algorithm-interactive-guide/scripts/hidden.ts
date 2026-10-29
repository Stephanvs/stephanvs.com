import type { Matrix } from '../lib/matrix';
import { altitudeSensor, simulateVertical, trackAltitude, verticalSeconds, type VerticalStep } from '../lib/vertical';
import { bindSlider, mountPlot, nearestIndex, type Point } from './plot';

const svgNs = 'http://www.w3.org/2000/svg';
const speed = (value: number) => `${value.toFixed(2)} m/s`;

function ellipsePath(P: Matrix, scaleX: number, scaleY: number, size: number) {
  const a = Math.sqrt(P[0][0]);
  const b = P[1][0] / a;
  const c = Math.sqrt(Math.max(0, P[1][1] - b * b));
  const points: string[] = [];
  for (let i = 0; i <= 72; i++) {
    const t = (i / 72) * 2 * Math.PI;
    const x = 2 * a * Math.cos(t);
    const y = 2 * (b * Math.cos(t) + c * Math.sin(t));
    points.push(`${i ? 'L' : 'M'}${(size / 2 + x * scaleX).toFixed(1)},${(size / 2 - y * scaleY).toFixed(1)}`);
  }
  return points.join('') + 'Z';
}

export function mountHidden(root: HTMLElement) {
  const scenario = {
    seed: 2,
    sensors: { baro: { rate: 10, sigma: 4, enabled: true }, gps: { rate: 1, sigma: 8, enabled: false } }
  };
  const { truth, events } = simulateVertical(scenario);
  const state = { time: 12, q: 0.5 };
  const compute = () =>
    trackAltitude(events, { baro: altitudeSensor(4), gps: altitudeSensor(8) }, state.q).filter((s) => s.event.kind === 'baro');
  let steps: VerticalStep[] = compute();
  const times = () => steps.map((s) => s.t);
  const truthSpeed = (t: number) => truth[Math.min(truth.length - 1, Math.round(t * 10))].verticalSpeed;
  const v = (s: VerticalStep) => s.estimate.x[1][0];
  const vSigma = (s: VerticalStep) => Math.sqrt(s.estimate.P[1][1]);

  const plot = mountPlot(root.querySelector('[data-plot]')!, () => {
    const at = (fn: (s: VerticalStep) => number): Point[] => steps.map((s) => [s.t, fn(s)]);
    return {
      x: [0, verticalSeconds],
      y: [-8, 10],
      xTitle: 'seconds',
      yTitle: 'm/s',
      layers: [
        { kind: 'band', upper: at((s) => v(s) + 2 * vSigma(s)), lower: at((s) => v(s) - 2 * vSigma(s)), tone: 'estimate' },
        { kind: 'line', points: truth.map((s) => [s.t, s.verticalSpeed]), tone: 'truth' },
        { kind: 'line', points: at(v), tone: 'estimate' },
        { kind: 'rule', x: state.time }
      ],
      readout: (x) => {
        const s = steps[nearestIndex(times(), x)];
        return {
          title: `${s.t.toFixed(1)} s`,
          rows: [
            { label: 'estimate', value: speed(v(s)), tone: 'estimate' },
            { label: 'truth', value: speed(truthSpeed(s.t)), tone: 'truth' },
            { label: '2σ', value: `±${speed(2 * vSigma(s))}`, tone: 'estimate' }
          ]
        };
      }
    };
  });

  const svg = root.querySelector<SVGSVGElement>('[data-ellipse]')!;
  const timeEl = root.querySelector('[data-time]')!;
  const stat = (name: string) => root.querySelector(`[data-stat="${name}"]`)!;
  const size = 240;
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  const drawEllipse = () => {
    const s = steps[nearestIndex(times(), state.time)];
    const before = s.predicted.P;
    const after = s.estimate.P;
    const reachX = 2 * Math.sqrt(Math.max(before[0][0], after[0][0]));
    const reachY = 2 * Math.sqrt(Math.max(before[1][1], after[1][1]));
    const scaleX = (size * 0.42) / reachX;
    const scaleY = (size * 0.42) / reachY;
    const node = (name: string, attributes: Record<string, string | number>) => {
      const el = document.createElementNS(svgNs, name);
      for (const [k, val] of Object.entries(attributes)) el.setAttribute(k, String(val));
      return el;
    };
    const label = (text: string, x: number, y: number, anchor = 'start') => {
      const el = node('text', { x, y, 'text-anchor': anchor, class: 'kf-axis-title' });
      el.textContent = text;
      return el;
    };
    svg.replaceChildren(
      node('line', { x1: 0, x2: size, y1: size / 2, y2: size / 2, class: 'kf-rule', 'stroke-opacity': 0.25 }),
      node('line', { x1: size / 2, x2: size / 2, y1: 0, y2: size, class: 'kf-rule', 'stroke-opacity': 0.25 }),
      node('path', { d: ellipsePath(after, scaleX, scaleY, size), class: 'kf-ellipse__fill' }),
      node('path', { d: ellipsePath(before, scaleX, scaleY, size), class: 'kf-ellipse__predicted' }),
      label(`altitude ±${reachX.toFixed(1)} m`, size - 2, size - 4, 'end'),
      label(`speed ±${reachY.toFixed(2)} m/s`, 2, 11)
    );
    timeEl.textContent = `${s.t.toFixed(1)} s`;
    stat('error').textContent = speed(v(s) - truthSpeed(s.t));
    stat('rho').textContent = (after[1][0] / Math.sqrt(after[0][0] * after[1][1])).toFixed(2);
  };

  const timeInput = bindSlider(root, 'time', (value) => `${value.toFixed(1)} s`, (value) => {
    state.time = value;
    plot.render();
    drawEllipse();
  });
  bindSlider(root, 'q', (value) => `${value.toFixed(2)} m/s²`, (value) => {
    state.q = value;
    steps = compute();
    plot.render();
    drawEllipse();
  });

  plot.svg.addEventListener('click', (event) => {
    timeInput.value = String(Math.max(0.1, Math.min(verticalSeconds, plot.toData(event.clientX))));
    timeInput.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
