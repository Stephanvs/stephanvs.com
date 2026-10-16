export type QueueMode = 'unbounded' | 'bounded';
export type FullMode = 'Wait' | 'DropOldest' | 'DropNewest' | 'DropWrite';

export interface QueueSettings {
  arrivalRate: number;
  drainRate: number;
  mode: QueueMode;
  capacity: number;
  fullMode: FullMode;
}

export interface Sample {
  time: number;
  depth: number;
  upstream: number;
  latency: number;
}

export const TICK_SECONDS = 0.1;
export const ITEM_BYTES = 2_000;
export const MEMORY_LIMIT_BYTES = 64_000_000;
export const MEMORY_LIMIT_ITEMS = MEMORY_LIMIT_BYTES / ITEM_BYTES;
export const WINDOW_SECONDS = 180;

const TICKS_PER_SAMPLE = 5;
const LATENCY_WINDOW_TICKS = 10;

// FIFO of items grouped by arrival time, so a queue of 30,000 items costs a few hundred entries.
class BatchQueue {
  private times: number[] = [];
  private counts: number[] = [];
  private head = 0;
  size = 0;

  push(time: number, count: number) {
    if (count <= 0) return;
    const last = this.counts.length - 1;
    if (last >= this.head && this.times[last] === time) {
      this.counts[last] += count;
    } else {
      this.times.push(time);
      this.counts.push(count);
    }
    this.size += count;
  }

  takeFront(count: number, onTake?: (time: number, taken: number) => void) {
    let remaining = count;
    while (remaining > 0 && this.head < this.counts.length) {
      const taken = Math.min(remaining, this.counts[this.head]);
      onTake?.(this.times[this.head], taken);
      this.counts[this.head] -= taken;
      this.size -= taken;
      remaining -= taken;
      if (this.counts[this.head] === 0) this.head += 1;
    }
    if (this.head > 512 && this.head * 2 > this.counts.length) {
      this.times = this.times.slice(this.head);
      this.counts = this.counts.slice(this.head);
      this.head = 0;
    }
    return count - remaining;
  }

  takeBack(count: number) {
    let remaining = count;
    while (remaining > 0 && this.counts.length > this.head) {
      const last = this.counts.length - 1;
      const taken = Math.min(remaining, this.counts[last]);
      this.counts[last] -= taken;
      this.size -= taken;
      remaining -= taken;
      if (this.counts[last] === 0) {
        this.counts.pop();
        this.times.pop();
      }
    }
    return count - remaining;
  }

  clear() {
    this.times = [];
    this.counts = [];
    this.head = 0;
    this.size = 0;
  }
}

function poisson(mean: number, random: () => number) {
  if (mean <= 0) return 0;
  if (mean > 30) {
    const z = Math.sqrt(-2 * Math.log(random() || 1e-12)) * Math.cos(2 * Math.PI * random());
    return Math.max(0, Math.round(mean + Math.sqrt(mean) * z));
  }
  const limit = Math.exp(-mean);
  let count = 0;
  let product = random();
  while (product > limit) {
    count += 1;
    product *= random();
  }
  return count;
}

export class QueueSimulation {
  ticks = 0;
  dropped = 0;
  lost = 0;
  restarts = 0;
  overflowing = false;
  crashes: number[] = [];
  lastCrashLost = 0;
  samples: Sample[] = [];

  private queue = new BatchQueue();
  private upstream = new BatchQueue();
  private drainCarry = 0;
  private latencyCounts = new Array<number>(LATENCY_WINDOW_TICKS).fill(0);
  private latencySums = new Array<number>(LATENCY_WINDOW_TICKS).fill(0);

  constructor(private readonly random: () => number = Math.random) {
    this.record();
  }

  get time() {
    return this.ticks * TICK_SECONDS;
  }

  get depth() {
    return this.queue.size;
  }

  get waitingUpstream() {
    return this.upstream.size;
  }

  // Average time from arrival to processing for items consumed in the last simulated second.
  get latency() {
    const count = this.latencyCounts.reduce((sum, value) => sum + value, 0);
    return count === 0 ? NaN : this.latencySums.reduce((sum, value) => sum + value, 0) / count;
  }

  step(settings: QueueSettings) {
    const now = this.time;
    const droppedBefore = this.dropped;
    const arrivals = poisson(settings.arrivalRate * TICK_SECONDS, this.random);
    let crashed = false;

    if (settings.mode === 'unbounded') {
      this.queue.push(now, arrivals);
      if (this.queue.size > MEMORY_LIMIT_ITEMS) {
        this.lastCrashLost = this.queue.size;
        this.lost += this.queue.size;
        this.restarts += 1;
        this.crashes.push(now);
        this.queue.clear();
        crashed = true;
      }
    } else {
      this.admit(settings, now, arrivals);
    }

    this.drain(settings.drainRate, now);

    if (settings.mode === 'bounded' && settings.fullMode === 'Wait') this.refillFromUpstream(settings.capacity);
    this.overflowing = this.dropped > droppedBefore || this.upstream.size > 0;

    this.ticks += 1;
    if (this.ticks % TICKS_PER_SAMPLE === 0) this.record();
    return crashed;
  }

  private drain(drainRate: number, now: number) {
    const slot = this.ticks % LATENCY_WINDOW_TICKS;
    this.latencyCounts[slot] = 0;
    this.latencySums[slot] = 0;

    const budget = drainRate * TICK_SECONDS + this.drainCarry;
    const drainable = Math.floor(budget);
    this.drainCarry = budget - drainable;
    this.queue.takeFront(drainable, (arrived, taken) => {
      this.latencyCounts[slot] += taken;
      this.latencySums[slot] += (now - arrived) * taken;
    });
  }

  private refillFromUpstream(capacity: number) {
    const free = Math.max(0, capacity - this.queue.size);
    this.upstream.takeFront(free, (arrived, taken) => this.queue.push(arrived, taken));
  }

  private admit({ capacity, fullMode }: QueueSettings, now: number, arrivals: number) {
    const space = Math.max(0, capacity - this.queue.size);

    switch (fullMode) {
      case 'Wait': {
        this.upstream.push(now, arrivals);
        this.refillFromUpstream(capacity);
        break;
      }
      case 'DropWrite': {
        const admitted = Math.min(space, arrivals);
        this.queue.push(now, admitted);
        this.dropped += arrivals - admitted;
        break;
      }
      case 'DropNewest': {
        if (arrivals === 0) break;
        if (space > 0) {
          const admitted = Math.min(space, arrivals);
          this.queue.push(now, admitted);
          this.dropped += arrivals - admitted;
        } else {
          // Each write evicts the newest item already queued, so only the last arrival survives.
          this.queue.takeBack(1);
          this.queue.push(now, 1);
          this.dropped += arrivals;
        }
        break;
      }
      case 'DropOldest': {
        this.queue.push(now, arrivals);
        const excess = this.queue.size - capacity;
        if (excess > 0) this.dropped += this.queue.takeFront(excess);
        break;
      }
    }
  }

  private record() {
    const time = this.time;
    this.samples.push({ time, depth: this.queue.size, upstream: this.upstream.size, latency: this.latency });
    const cutoff = time - WINDOW_SECONDS - 1;
    let stale = 0;
    while (stale < this.samples.length && this.samples[stale].time < cutoff) stale += 1;
    if (stale > 0) this.samples.splice(0, stale);
    while (this.crashes.length > 0 && this.crashes[0] < cutoff) this.crashes.shift();
  }
}
