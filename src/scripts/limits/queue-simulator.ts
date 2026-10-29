import { formatBytes, formatCount, formatSeconds, query, queryAll, setPressed } from './dom';
import {
  ITEM_BYTES,
  MEMORY_LIMIT_BYTES,
  MEMORY_LIMIT_ITEMS,
  QueueSimulation,
  TICK_SECONDS,
  WINDOW_SECONDS,
  type FullMode,
  type QueueMode,
  type QueueSettings,
  type Sample
} from './queue-model';

const SVG_NS = 'http://www.w3.org/2000/svg';
const HEIGHT = 260;
const MARGIN = { top: 18, right: 16, bottom: 28, left: 48 };
const STEPS_PER_FRAME_MAX = 2_000;
const CRASH_MESSAGE_SECONDS = 8;

const presets: Record<string, QueueSettings> = {
  friday: { arrivalRate: 500, drainRate: 300, mode: 'unbounded', capacity: 1_000, fullMode: 'DropOldest' },
  'drop-oldest': { arrivalRate: 500, drainRate: 300, mode: 'bounded', capacity: 1_000, fullMode: 'DropOldest' },
  wait: { arrivalRate: 500, drainRate: 300, mode: 'bounded', capacity: 1_000, fullMode: 'Wait' },
  healthy: { arrivalRate: 300, drainRate: 400, mode: 'unbounded', capacity: 1_000, fullMode: 'DropOldest' }
};

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

function svg<K extends keyof SVGElementTagNameMap>(name: K, attributes: Record<string, string | number> = {}, parent?: Element) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  parent?.append(element);
  return element;
}

function niceScale(needed: number, ticks = 4) {
  const raw = needed / ticks;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= raw)!;
  return { max: step * Math.ceil(needed / step), step };
}

function formatClock(seconds: number) {
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function nearestSample(samples: Sample[], time: number) {
  let low = 0;
  let high = samples.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (samples[mid].time < time) low = mid + 1;
    else high = mid;
  }
  const previous = samples[low - 1];
  return previous && time - previous.time < samples[low].time - time ? previous : samples[low];
}

class QueueChart {
  private readonly root: SVGSVGElement;
  private readonly grid: SVGGElement;
  private readonly xAxis: SVGGElement;
  private readonly crashes: SVGGElement;
  private readonly reference: SVGLineElement;
  private readonly referenceLabel: SVGTextElement;
  private readonly area: SVGPathElement;
  private readonly channel: SVGPathElement;
  private readonly upstream: SVGPathElement;
  private readonly crosshair: SVGLineElement;
  private readonly channelDot: SVGCircleElement;
  private readonly upstreamDot: SVGCircleElement;
  private width = 0;
  private hoverX: number | null = null;
  private last?: { simulation: QueueSimulation; settings: QueueSettings };

  constructor(
    private readonly container: HTMLElement,
    private readonly tooltip: HTMLElement
  ) {
    this.root = svg('svg', {
      height: HEIGHT,
      tabindex: 0,
      role: 'img',
      'aria-label': 'Line chart of items queued over the last three simulated minutes. Use the arrow keys to inspect values.'
    });
    this.grid = svg('g', {}, this.root);
    this.xAxis = svg('g', {}, this.root);
    this.reference = svg('line', { stroke: '#78716c', 'stroke-width': 1, 'stroke-dasharray': '4 4' }, this.root);
    this.referenceLabel = svg('text', { fill: '#57534e', 'font-size': 11, 'text-anchor': 'end' }, this.root);
    this.crashes = svg('g', {}, this.root);
    this.area = svg('path', { fill: 'var(--lx-series-1)', 'fill-opacity': 0.1 }, this.root);
    const line = { fill: 'none', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
    this.upstream = svg('path', { ...line, stroke: 'var(--lx-series-2)' }, this.root);
    this.channel = svg('path', { ...line, stroke: 'var(--lx-series-1)' }, this.root);
    this.crosshair = svg('line', { stroke: '#1c1917', 'stroke-width': 1, visibility: 'hidden' }, this.root);
    const dot = { r: 4, stroke: '#fff', 'stroke-width': 2, visibility: 'hidden' };
    this.upstreamDot = svg('circle', { ...dot, fill: 'var(--lx-series-2)' }, this.root);
    this.channelDot = svg('circle', { ...dot, fill: 'var(--lx-series-1)' }, this.root);
    container.prepend(this.root);

    new ResizeObserver(() => this.redraw()).observe(container);
    const pointerX = (event: PointerEvent) => event.clientX - this.root.getBoundingClientRect().left;
    this.root.addEventListener('pointermove', (event) => this.hover(pointerX(event)));
    this.root.addEventListener('pointerdown', (event) => this.hover(pointerX(event)));
    this.root.addEventListener('pointerleave', () => this.hover(null));
    this.root.addEventListener('focus', () => this.hover(this.hoverX ?? this.width - MARGIN.right));
    this.root.addEventListener('blur', () => this.hover(null));
    this.root.addEventListener('keydown', (event) => this.key(event));
  }

  render(simulation: QueueSimulation, settings: QueueSettings) {
    this.last = { simulation, settings };
    this.width = this.container.clientWidth;
    const width = this.width;
    const plotWidth = width - MARGIN.left - MARGIN.right;
    const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
    const bottom = MARGIN.top + plotHeight;
    this.root.setAttribute('viewBox', `0 0 ${width} ${HEIGHT}`);

    const start = Math.max(0, simulation.time - WINDOW_SECONDS);
    const samples = simulation.samples.filter((sample) => sample.time >= start);
    const showUpstream = settings.mode === 'bounded' && settings.fullMode === 'Wait';
    const referenceValue = settings.mode === 'bounded' ? settings.capacity : MEMORY_LIMIT_ITEMS;
    const dataMax = samples.reduce((max, sample) => Math.max(max, sample.depth, showUpstream ? sample.upstream : 0), 0);
    const { max, step } = niceScale(Math.max(referenceValue * 1.08, dataMax * 1.05, 10));
    const x = (time: number) => MARGIN.left + ((time - start) / WINDOW_SECONDS) * plotWidth;
    const y = (value: number) => bottom - (value / max) * plotHeight;

    const grid: SVGElement[] = [];
    for (let value = 0; value <= max + step / 2; value += step) {
      grid.push(
        svg('line', { x1: MARGIN.left, x2: width - MARGIN.right, y1: y(value), y2: y(value), stroke: value === 0 ? '#a8a29e' : '#e7e5e4' }),
        svg('text', { x: MARGIN.left - 8, y: y(value) + 4, 'text-anchor': 'end', fill: '#57534e', 'font-size': 11 })
      );
      grid[grid.length - 1].textContent = compact.format(value);
    }
    this.grid.replaceChildren(...grid);

    const ticks: SVGElement[] = [];
    for (let time = Math.ceil(start / 30) * 30; time <= start + WINDOW_SECONDS; time += 30) {
      const label = svg('text', { x: x(time), y: HEIGHT - 8, 'text-anchor': 'middle', fill: '#57534e', 'font-size': 11 });
      label.textContent = formatClock(time);
      ticks.push(label);
    }
    this.xAxis.replaceChildren(...ticks);

    const referenceY = y(referenceValue);
    Object.entries({ x1: MARGIN.left, x2: width - MARGIN.right, y1: referenceY, y2: referenceY }).forEach(([key, value]) =>
      this.reference.setAttribute(key, String(value))
    );
    this.referenceLabel.setAttribute('x', String(width - MARGIN.right - 4));
    this.referenceLabel.setAttribute('y', String(referenceY - 6));
    this.referenceLabel.textContent =
      settings.mode === 'bounded' ? `Capacity ${formatCount(referenceValue)}` : `Pod memory limit (${formatBytes(MEMORY_LIMIT_BYTES)})`;

    this.crashes.replaceChildren(
      ...simulation.crashes
        .filter((time) => time >= start)
        .flatMap((time) => {
          const marker = svg('line', { x1: x(time), x2: x(time), y1: MARGIN.top, y2: bottom, stroke: 'var(--lx-critical)', 'stroke-width': 1.5 });
          const label = svg('text', { x: x(time) + 4, y: MARGIN.top + 10, fill: '#1c1917', 'font-size': 11 });
          label.textContent = 'OOM kill';
          return [marker, label];
        })
    );

    const path = (value: (sample: Sample) => number) =>
      samples.map((sample, index) => `${index === 0 ? 'M' : 'L'}${x(sample.time).toFixed(1)},${y(value(sample)).toFixed(1)}`).join('');
    const channelPath = path((sample) => sample.depth);
    this.channel.setAttribute('d', channelPath);
    this.area.setAttribute(
      'd',
      samples.length > 1 ? `${channelPath}L${x(samples[samples.length - 1].time).toFixed(1)},${bottom}L${x(samples[0].time).toFixed(1)},${bottom}Z` : ''
    );
    this.upstream.setAttribute('d', showUpstream ? path((sample) => sample.upstream) : '');

    this.renderHover(samples, x, y, start, plotWidth, showUpstream);
  }

  private renderHover(
    samples: Sample[],
    x: (time: number) => number,
    y: (value: number) => number,
    start: number,
    plotWidth: number,
    showUpstream: boolean
  ) {
    const visible = this.hoverX !== null && samples.length > 0;
    [this.crosshair, this.channelDot].forEach((element) => element.setAttribute('visibility', visible ? 'visible' : 'hidden'));
    this.upstreamDot.setAttribute('visibility', visible && showUpstream ? 'visible' : 'hidden');
    this.tooltip.hidden = !visible;
    if (!visible) return;

    const clamped = Math.min(Math.max(this.hoverX!, MARGIN.left), MARGIN.left + plotWidth);
    const sample = nearestSample(samples, start + ((clamped - MARGIN.left) / plotWidth) * WINDOW_SECONDS);
    const sampleX = x(sample.time);
    Object.entries({ x1: sampleX, x2: sampleX, y1: MARGIN.top, y2: HEIGHT - MARGIN.bottom }).forEach(([key, value]) =>
      this.crosshair.setAttribute(key, String(value))
    );
    this.channelDot.setAttribute('cx', String(sampleX));
    this.channelDot.setAttribute('cy', String(y(sample.depth)));
    this.upstreamDot.setAttribute('cx', String(sampleX));
    this.upstreamDot.setAttribute('cy', String(y(sample.upstream)));

    const rows: [string | null, string, string][] = [[ 'var(--lx-series-1)', formatCount(sample.depth), 'in the channel' ]];
    if (showUpstream) rows.push(['var(--lx-series-2)', formatCount(sample.upstream), 'waiting upstream']);
    rows.push([null, formatSeconds(sample.latency), 'latency']);

    const time = document.createElement('span');
    time.className = 'sim-tip-time';
    time.textContent = `${formatClock(sample.time)} simulated`;
    this.tooltip.replaceChildren(
      time,
      ...rows.map(([color, value, label]) => {
        const row = document.createElement('span');
        row.className = 'sim-tip-row';
        if (color) {
          const key = document.createElement('i');
          key.className = 'sim-tip-key';
          key.style.background = color;
          row.append(key);
        }
        const strong = document.createElement('strong');
        strong.textContent = value;
        row.append(strong, ` ${label}`);
        return row;
      })
    );

    const tooltipWidth = this.tooltip.offsetWidth;
    const left = sampleX + 12 + tooltipWidth > this.width ? sampleX - 12 - tooltipWidth : sampleX + 12;
    this.tooltip.style.left = `${Math.max(0, left)}px`;
  }

  private hover(x: number | null) {
    this.hoverX = x;
    this.redraw();
  }

  private key(event: KeyboardEvent) {
    const plotWidth = this.width - MARGIN.left - MARGIN.right;
    const stepWidth = plotWidth / (WINDOW_SECONDS / 5);
    const current = this.hoverX ?? this.width - MARGIN.right;
    const next: Record<string, number> = {
      ArrowLeft: current - stepWidth,
      ArrowRight: current + stepWidth,
      Home: MARGIN.left,
      End: this.width - MARGIN.right
    };
    if (event.key === 'Escape') return this.hover(null);
    if (!(event.key in next)) return;
    event.preventDefault();
    this.hover(Math.min(Math.max(next[event.key], MARGIN.left), this.width - MARGIN.right));
  }

  private redraw() {
    if (this.last) this.render(this.last.simulation, this.last.settings);
  }
}

function describe(simulation: QueueSimulation, settings: QueueSettings): [string, string] {
  const growing = settings.arrivalRate > settings.drainRate;
  const lastCrash = simulation.crashes[simulation.crashes.length - 1];

  if (settings.mode === 'unbounded') {
    if (lastCrash !== undefined && simulation.time - lastCrash < CRASH_MESSAGE_SECONDS) {
      return [
        `crash-${simulation.restarts}`,
        `The pod ran out of memory and restarted. ${formatCount(simulation.lastCrashLost)} queued items were lost at once.`
      ];
    }
    if (!growing) return ['healthy', 'The consumer keeps up, so the queue stays close to empty.'];
    return simulation.restarts > 0
      ? ['growing-again', 'The pod came back empty, and the queue is growing again. Nothing changed, so it will crash again.']
      : ['growing', 'The queue keeps growing. Nothing has failed yet, and every health check is still green.'];
  }

  if (!simulation.overflowing) {
    if (growing) return ['filling', `The channel is filling up. Watch what ${settings.fullMode} does when it reaches ${formatCount(settings.capacity)}.`];
    return ['healthy', 'The consumer keeps up. The limit only matters during bursts.'];
  }

  switch (settings.fullMode) {
    case 'Wait':
      return ['wait', "The channel is full, so producers wait. The queue hasn't gone away. It moved upstream, and latency keeps climbing."];
    case 'DropOldest':
      return ['drop-oldest', 'The channel is full. The oldest items are dropped to make room, so the freshest data gets through.'];
    case 'DropNewest':
      return ['drop-newest', 'The channel is full. Each new write replaces the newest queued item, so old data gets through and latency stays at its maximum.'];
    case 'DropWrite':
      return ['drop-write', 'The channel is full. Incoming writes are dropped, so the oldest data gets through and latency stays at its maximum.'];
  }
}

function initSimulator(root: HTMLElement) {
  const form = query<HTMLFormElement>(root, '[data-form]');
  const presetButtons = queryAll<HTMLButtonElement>(root, '[data-preset]');
  const modeButtons = queryAll<HTMLButtonElement>(root, '[data-mode]');
  const fullModeButtons = queryAll<HTMLButtonElement>(root, '[data-full-mode]');
  const speedButtons = queryAll<HTMLButtonElement>(root, '[data-speed]');
  const boundedOnly = queryAll<HTMLElement>(root, '[data-bounded-only]');
  const playButton = query<HTMLButtonElement>(root, '[data-play]');
  const legend = query<HTMLElement>(root, '[data-legend]');
  const status = query<HTMLElement>(root, '[data-status]');
  const clock = query<HTMLElement>(root, '[data-clock]');
  const out = (name: string) => query<HTMLElement>(root, `[data-out="${name}"]`);
  const value = (name: string) => query<HTMLOutputElement>(root, `[data-value="${name}"]`);
  const chart = new QueueChart(query(root, '[data-chart]'), query(root, '[data-tooltip]'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let settings: QueueSettings = { ...presets.friday };
  let simulation = new QueueSimulation();
  let speed = 10;
  let running = false;
  let userPaused = reducedMotion;
  let frame = 0;
  let lastFrame = 0;
  let pending = 0;
  let statusKey = '';

  function syncControls() {
    const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
    field('arrivalRate').value = String(settings.arrivalRate);
    field('drainRate').value = String(settings.drainRate);
    field('capacity').value = String(settings.capacity);
    setPressed(modeButtons, settings.mode);
    setPressed(fullModeButtons, settings.fullMode);

    const bounded = settings.mode === 'bounded';
    boundedOnly.forEach((element) => {
      element.toggleAttribute('data-disabled', !bounded);
      element.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, button').forEach((control) => (control.disabled = !bounded));
    });
    legend.hidden = !(bounded && settings.fullMode === 'Wait');
    syncOutputs();
  }

  function syncOutputs() {
    value('arrivalRate').textContent = `${formatCount(settings.arrivalRate)}/s`;
    value('drainRate').textContent = `${formatCount(settings.drainRate)}/s`;
    value('capacity').textContent = formatCount(settings.capacity);
  }

  function draw() {
    const bounded = settings.mode === 'bounded';
    out('depth').textContent = formatCount(simulation.depth);
    out('depth-note').textContent = bounded ? `of ${formatCount(settings.capacity)}` : 'items';
    out('memory').textContent = formatBytes(simulation.depth * ITEM_BYTES);
    out('memory-note').textContent = bounded
      ? `ceiling ${formatBytes(settings.capacity * ITEM_BYTES)}`
      : `limit ${formatBytes(MEMORY_LIMIT_BYTES)}`;
    out('latency').textContent = formatSeconds(simulation.latency);

    if (!bounded) {
      out('loss-label').textContent = 'Lost in crashes';
      out('loss').textContent = formatCount(simulation.lost);
      out('loss-note').textContent = `${simulation.restarts} ${simulation.restarts === 1 ? 'restart' : 'restarts'}`;
    } else if (settings.fullMode === 'Wait') {
      out('loss-label').textContent = 'Waiting upstream';
      out('loss').textContent = formatCount(simulation.waitingUpstream);
      out('loss-note').textContent = 'callers blocked on WriteAsync';
    } else {
      out('loss-label').textContent = 'Dropped';
      out('loss').textContent = formatCount(simulation.dropped);
      out('loss-note').textContent = 'counted by itemDropped';
    }

    clock.textContent = `${formatClock(simulation.time)} simulated`;
    chart.render(simulation, settings);

    const [key, text] = describe(simulation, settings);
    if (key !== statusKey) {
      statusKey = key;
      status.textContent = text;
    }
  }

  function tick(now: number) {
    pending += (Math.min(250, now - lastFrame) / 1000) * speed;
    lastFrame = now;
    const steps = Math.min(STEPS_PER_FRAME_MAX, Math.floor(pending / TICK_SECONDS));
    pending = steps === STEPS_PER_FRAME_MAX ? 0 : pending - steps * TICK_SECONDS;
    for (let index = 0; index < steps; index++) simulation.step(settings);
    draw();
    frame = requestAnimationFrame(tick);
  }

  function play() {
    if (running) return;
    running = true;
    lastFrame = performance.now();
    frame = requestAnimationFrame(tick);
    playButton.textContent = 'Pause';
  }

  function pause() {
    running = false;
    cancelAnimationFrame(frame);
    playButton.textContent = 'Run';
  }

  function reset() {
    simulation = new QueueSimulation();
    pending = 0;
    statusKey = '';
    draw();
  }

  function clearPreset() {
    presetButtons.forEach((button) => button.setAttribute('aria-pressed', 'false'));
  }

  presetButtons.forEach((button) => {
    button.addEventListener('click', () => {
      settings = { ...presets[button.value] };
      setPressed(presetButtons, button.value);
      syncControls();
      reset();
      userPaused = false;
      play();
    });
  });

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      settings.mode = button.value as QueueMode;
      clearPreset();
      syncControls();
      reset();
    });
  });

  fullModeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      settings.fullMode = button.value as FullMode;
      clearPreset();
      syncControls();
      reset();
    });
  });

  speedButtons.forEach((button) => {
    button.addEventListener('click', () => {
      speed = Number(button.value);
      setPressed(speedButtons, button.value);
    });
  });

  form.addEventListener('input', () => {
    const data = new FormData(form);
    settings.arrivalRate = Number(data.get('arrivalRate'));
    settings.drainRate = Number(data.get('drainRate'));
    if (settings.mode === 'bounded') settings.capacity = Number(data.get('capacity'));
    clearPreset();
    syncOutputs();
    if (!running) draw();
  });
  form.addEventListener('submit', (event) => event.preventDefault());

  playButton.addEventListener('click', () => {
    if (running) {
      userPaused = true;
      pause();
    } else {
      userPaused = false;
      play();
    }
  });
  query(root, '[data-reset]').addEventListener('click', reset);

  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !userPaused) play();
      else if (!entry.isIntersecting && running) pause();
    },
    { threshold: 0.25 }
  ).observe(root);

  syncControls();
  draw();
}

document.querySelectorAll<HTMLElement>('[data-queue-sim]').forEach(initSimulator);
