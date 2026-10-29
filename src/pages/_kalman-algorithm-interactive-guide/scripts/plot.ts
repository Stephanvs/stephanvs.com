export type Point = [x: number, y: number];
export type Tone = 'truth' | 'reading' | 'estimate' | 'second';

export type Layer =
  | { kind: 'line'; points: Point[]; tone: Tone; dashed?: boolean; thin?: boolean }
  | { kind: 'dots'; points: Point[]; tone: Tone; radius?: number }
  | { kind: 'band'; upper: Point[]; lower: Point[]; tone: Tone }
  | { kind: 'span'; from: number; to: number; label?: string }
  | { kind: 'rule'; x: number };

export interface ReadoutRow {
  label: string;
  value: string;
  tone: Tone;
}

export interface PlotSpec {
  x: [number, number];
  y: [number, number];
  layers: Layer[];
  height?: number;
  xTitle?: string;
  yTitle?: string;
  xFormat?: (value: number) => string;
  yFormat?: (value: number) => string;
  readout?: (x: number) => { title: string; rows: ReadoutRow[] } | null;
}

const svgNs = 'http://www.w3.org/2000/svg';
const baseMargin = { top: 10, right: 12, bottom: 34, left: 52 };

export function niceTicks(min: number, max: number, count = 5): number[] {
  const span = max - min || 1;
  const raw = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => span / s <= count) ?? 10 * magnitude;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) ticks.push(Number(v.toFixed(10)));
  return ticks;
}

const element = <K extends keyof SVGElementTagNameMap>(name: K, attributes: Record<string, string | number> = {}) => {
  const node = document.createElementNS(svgNs, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  return node;
};

const defaultFormat = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 2 });

export function mountPlot(container: HTMLElement, spec: () => PlotSpec) {
  const svg = element('svg');
  svg.setAttribute('role', 'img');
  const tooltip = document.createElement('div');
  tooltip.className = 'kf-tooltip';
  tooltip.hidden = true;
  container.append(svg, tooltip);
  let current: PlotSpec | null = null;
  let toX = (v: number) => v;
  let fromX = (v: number) => v;
  let width = 0;
  let pointerX: number | null = null;
  let cursorX: number | null = null;
  let margin = baseMargin;
  const cursor = element('line', { class: 'kf-rule' });

  function render() {
    current = spec();
    const s = current;
    width = Math.max(280, container.clientWidth);
    const height = s.height ?? 260;
    margin = { ...baseMargin, top: s.yTitle ? 26 : baseMargin.top };
    const inner = { w: width - margin.left - margin.right, h: height - margin.top - margin.bottom };
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('height', String(height));
    if (container.dataset.label) svg.setAttribute('aria-label', container.dataset.label);
    toX = (v) => margin.left + ((v - s.x[0]) / (s.x[1] - s.x[0])) * inner.w;
    fromX = (px) => s.x[0] + ((px - margin.left) / inner.w) * (s.x[1] - s.x[0]);
    const toY = (v: number) => margin.top + (1 - (v - s.y[0]) / (s.y[1] - s.y[0])) * inner.h;
    const path = (points: Point[]) =>
      points.map(([x, y], i) => `${i ? 'L' : 'M'}${toX(x).toFixed(1)},${toY(y).toFixed(1)}`).join('');

    const clipId = `${container.id || 'plot'}-clip`;
    const nodes: SVGElement[] = [];
    const defs = element('defs');
    const clip = element('clipPath', { id: clipId });
    clip.append(element('rect', { x: margin.left, y: margin.top, width: inner.w, height: inner.h }));
    defs.append(clip);
    nodes.push(defs);

    const grid = element('g', { class: 'kf-grid' });
    const axis = element('g', { class: 'kf-axis' });
    const xFormat = s.xFormat ?? defaultFormat;
    const yFormat = s.yFormat ?? defaultFormat;
    for (const tick of niceTicks(s.y[0], s.y[1], 4)) {
      grid.append(element('line', { x1: margin.left, x2: margin.left + inner.w, y1: toY(tick), y2: toY(tick) }));
      const label = element('text', { x: margin.left - 8, y: toY(tick) + 3, 'text-anchor': 'end' });
      label.textContent = yFormat(tick);
      axis.append(label);
    }
    for (const tick of niceTicks(s.x[0], s.x[1], Math.max(3, Math.floor(inner.w / 90)))) {
      const label = element('text', { x: toX(tick), y: margin.top + inner.h + 16, 'text-anchor': 'middle' });
      label.textContent = xFormat(tick);
      axis.append(label);
    }
    axis.append(element('line', {
      x1: margin.left,
      x2: margin.left + inner.w,
      y1: margin.top + inner.h,
      y2: margin.top + inner.h,
      stroke: 'currentColor',
      'stroke-opacity': 0.5
    }));
    if (s.xTitle) {
      const title = element('text', { class: 'kf-axis-title', x: margin.left + inner.w, y: height - 4, 'text-anchor': 'end' });
      title.textContent = s.xTitle;
      axis.append(title);
    }
    if (s.yTitle) {
      const title = element('text', { class: 'kf-axis-title', x: margin.left - 44, y: margin.top - 14 });
      title.textContent = s.yTitle;
      axis.append(title);
    }
    nodes.push(grid);

    const marks = element('g', { 'clip-path': `url(#${clipId})` });
    for (const layer of s.layers) {
      switch (layer.kind) {
        case 'span': {
          const g = element('g', { class: 'kf-span' });
          const x0 = toX(Math.max(layer.from, s.x[0]));
          const x1 = toX(Math.min(layer.to, s.x[1]));
          g.append(element('rect', { x: x0, y: margin.top, width: Math.max(0, x1 - x0), height: inner.h }));
          if (layer.label) {
            const text = element('text', { x: x0 + 6, y: margin.top + 14 });
            text.textContent = layer.label;
            g.append(text);
          }
          marks.append(g);
          break;
        }
        case 'band': {
          const d = path(layer.upper) + path([...layer.lower].reverse()).replace(/^M/, 'L') + 'Z';
          marks.append(element('path', { class: `kf-band kf-band--${layer.tone}`, d }));
          break;
        }
        case 'line':
          marks.append(element('path', {
            class: `kf-mark kf-mark--${layer.tone}${layer.dashed ? ' kf-mark--dashed' : ''}${layer.thin ? ' kf-mark--thin' : ''}`,
            d: path(layer.points)
          }));
          break;
        case 'dots': {
          const g = element('g', { class: `kf-dots kf-dots--${layer.tone}` });
          const r = layer.radius ?? 2.5;
          for (const [x, y] of layer.points) g.append(element('circle', { cx: toX(x).toFixed(1), cy: toY(y).toFixed(1), r }));
          marks.append(g);
          break;
        }
        case 'rule':
          marks.append(element('line', { class: 'kf-rule', x1: toX(layer.x), x2: toX(layer.x), y1: margin.top, y2: margin.top + inner.h }));
          break;
      }
    }
    nodes.push(marks, axis);

    const crosshair = element('line', { class: 'kf-crosshair', y1: margin.top, y2: margin.top + inner.h, visibility: 'hidden' });
    nodes.push(crosshair, cursor);
    cursor.setAttribute('y1', String(margin.top));
    cursor.setAttribute('y2', String(margin.top + inner.h));
    placeCursor();
    svg.replaceChildren(...nodes);
    if (pointerX !== null) showReadout(pointerX, crosshair);
  }

  function showReadout(px: number, crosshair = svg.querySelector<SVGLineElement>('.kf-crosshair')) {
    const readout = current?.readout?.(fromX(px));
    if (!readout || !crosshair) return hideReadout();
    const x = toX(fromX(px));
    crosshair.setAttribute('x1', String(x));
    crosshair.setAttribute('x2', String(x));
    crosshair.setAttribute('visibility', 'visible');
    const title = document.createElement('p');
    title.textContent = readout.title;
    const list = document.createElement('ul');
    for (const row of readout.rows) {
      const item = document.createElement('li');
      const key = document.createElement('span');
      key.className = 'kf-key';
      key.dataset.tone = row.tone;
      const value = document.createElement('strong');
      value.textContent = row.value;
      const label = document.createElement('span');
      label.textContent = row.label;
      item.append(key, value, label);
      list.append(item);
    }
    tooltip.replaceChildren(title, list);
    tooltip.hidden = false;
    const left = x + 14 + tooltip.offsetWidth > width ? x - 14 - tooltip.offsetWidth : x + 14;
    tooltip.style.left = `${Math.max(0, left)}px`;
    tooltip.style.top = `${margin.top + 16}px`;
  }

  function placeCursor() {
    cursor.setAttribute('visibility', cursorX === null ? 'hidden' : 'visible');
    if (cursorX === null) return;
    cursor.setAttribute('x1', toX(cursorX).toFixed(1));
    cursor.setAttribute('x2', toX(cursorX).toFixed(1));
  }

  function hideReadout() {
    tooltip.hidden = true;
    svg.querySelector('.kf-crosshair')?.setAttribute('visibility', 'hidden');
  }

  svg.addEventListener('pointermove', (event) => {
    const box = svg.getBoundingClientRect();
    pointerX = ((event.clientX - box.left) / box.width) * width;
    if (pointerX < margin.left || pointerX > width - margin.right) {
      pointerX = null;
      return hideReadout();
    }
    showReadout(pointerX);
  });
  svg.addEventListener('pointerleave', () => {
    pointerX = null;
    hideReadout();
  });

  new ResizeObserver(() => {
    if (Math.abs(container.clientWidth - width) > 1) render();
  }).observe(container);
  render();

  const setCursor = (x: number | null) => {
    cursorX = x;
    placeCursor();
  };

  return { render, svg, setCursor, toData: (clientX: number) => {
    const box = svg.getBoundingClientRect();
    return fromX(((clientX - box.left) / box.width) * width);
  } };
}

export function nearestIndex(values: number[], target: number): number {
  let lo = 0;
  let hi = values.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (values[mid] < target) lo = mid;
    else hi = mid;
  }
  return Math.abs(values[lo] - target) <= Math.abs(values[hi] - target) ? lo : hi;
}

export function extent(values: number[], pad = 0.08): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const margin = (max - min || 1) * pad;
  return [min - margin, max + margin];
}

export const metres = (value: number, digits = 1) =>
  `${value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })} m`;

export function bindSlider(root: ParentNode, name: string, format: (value: number) => string, onInput: (value: number) => void) {
  const input = root.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
  const output = root.querySelector<HTMLOutputElement>(`output[for="${input.id}"]`);
  const sync = () => {
    const value = Number(input.value);
    if (output) output.value = format(value);
    onInput(value);
  };
  input.addEventListener('input', sync);
  sync();
  return input;
}
