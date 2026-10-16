import { bindCopyButtons, formatBytes, formatCount, formatDecimal, formatSeconds, query } from './dom';

type FullMode = 'Wait' | 'DropOldest' | 'DropNewest' | 'DropWrite';

interface Inputs {
  drainRate: number;
  waitBudget: number;
  itemSizeKb: number;
  arrivalRate: number;
  fullMode: FullMode;
}

export function queueDepthMax(drainRate: number, waitBudget: number) {
  return Math.max(1, Math.floor(drainRate * waitBudget));
}

// Seconds until a queue that starts empty is full, or Infinity when the consumer keeps up.
export function secondsUntilFull(depthMax: number, arrivalRate: number, drainRate: number) {
  const growth = arrivalRate - drainRate;
  return growth > 0 ? depthMax / growth : Infinity;
}

function snippet({ drainRate, waitBudget, itemSizeKb, fullMode }: Inputs, depth: number) {
  const memory = formatBytes(depth * itemSizeKb * 1000);
  const callback = fullMode === 'Wait' ? '' : `,\n    itemDropped: _ => itemsDropped.Add(1)`;
  return `// ${formatCount(drainRate)} items/s × ${formatDecimal(waitBudget)} s wait budget = ${formatCount(depth)} items (~${memory})
const int QueueDepthMax = ${depth};

var channel = Channel.CreateBounded<WorkItem>(
    new BoundedChannelOptions(QueueDepthMax)
    {
        FullMode = BoundedChannelFullMode.${fullMode},
    }${callback});`;
}

function advice({ fullMode, arrivalRate, drainRate }: Inputs, memoryBytes: number) {
  const notes: string[] = [];
  if (memoryBytes > 512e6) {
    notes.push('That is a lot of memory for one queue. Consider queueing references and keeping payloads elsewhere.');
  }
  if (arrivalRate > drainRate) {
    notes.push(
      fullMode === 'Wait'
        ? 'Once full, producers wait. Make sure something at the edge rejects work, or the queue just moves upstream.'
        : `Once full, about ${formatCount(arrivalRate - drainRate)} items per second are dropped. Count them.`
    );
  } else {
    notes.push('The consumer keeps up with this arrival rate, so the queue only absorbs bursts.');
  }
  return notes.join(' ');
}

function initCalculator(root: HTMLElement) {
  const form = query<HTMLFormElement>(root, '[data-form]');
  const out = (name: string) => query<HTMLElement>(root, `[data-out="${name}"]`);

  function read(): Inputs {
    const data = new FormData(form);
    const number = (name: string, min: number) => Math.max(min, Number(data.get(name)) || 0);
    return {
      drainRate: number('drainRate', 1),
      waitBudget: number('waitBudget', 0.01),
      itemSizeKb: number('itemSize', 0.01),
      arrivalRate: number('arrivalRate', 0),
      fullMode: data.get('fullMode') as FullMode
    };
  }

  function render() {
    const inputs = read();
    const depth = queueDepthMax(inputs.drainRate, inputs.waitBudget);
    const memoryBytes = depth * inputs.itemSizeKb * 1000;
    const fill = secondsUntilFull(depth, inputs.arrivalRate, inputs.drainRate);

    out('depth').textContent = formatCount(depth);
    out('memory').textContent = formatBytes(memoryBytes);
    out('fill').textContent = Number.isFinite(fill) ? formatSeconds(fill) : 'Never';
    out('fill-note').textContent = `at ${formatCount(inputs.arrivalRate)} items/s`;
    out('advice').textContent = advice(inputs, memoryBytes);
    out('snippet').textContent = snippet(inputs, depth);
  }

  form.addEventListener('input', render);
  form.addEventListener('submit', (event) => event.preventDefault());
  bindCopyButtons(root);
  render();
}

document.querySelectorAll<HTMLElement>('[data-depth-calculator]').forEach(initCalculator);
