import { constantVelocity, predict, update, type Belief, type Sensor } from './filter';
import { column, diagonal } from './matrix';
import { noise, seeded } from './random';

export interface VerticalTruth {
  t: number;
  altitude: number;
  verticalSpeed: number;
}

// #region events
export type AltitudeSensor = 'baro' | 'gps';

export type AltitudeEvent =
  | { kind: AltitudeSensor; t: number; altitude: number }
  | { kind: 'clock'; t: number };
// #endregion

export interface SensorSpec {
  rate: number;
  sigma: number;
  enabled: boolean;
}

export interface VerticalScenario {
  seed: number;
  sensors: Record<AltitudeSensor, SensorSpec>;
  outage?: [number, number];
}

export const verticalProfile: [t: number, verticalSpeed: number][] = [
  [0, 0],
  [10, 0],
  [15, 6],
  [40, 6],
  [45, 0],
  [58, 0],
  [62, -4],
  [80, -4],
  [84, 0],
  [90, 0]
];

export const verticalSeconds = 90;
export const clockRate = 10;

function verticalSpeedAt(t: number): number {
  for (let i = 1; i < verticalProfile.length; i++) {
    const [t1, v1] = verticalProfile[i];
    if (t <= t1) {
      const [t0, v0] = verticalProfile[i - 1];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return verticalProfile[verticalProfile.length - 1][1];
}

export function simulateVertical({ seed, sensors, outage }: VerticalScenario) {
  const random = seeded(seed);
  const truth: VerticalTruth[] = [];
  const events: AltitudeEvent[] = [];
  const fine = 0.01;
  const ticksPerClock = Math.round(1 / (clockRate * fine));
  const ticksPer = (rate: number) => Math.round(1 / (rate * fine));
  let altitude = 1000;
  for (let tick = 0; tick <= verticalSeconds / fine; tick++) {
    const t = tick * fine;
    const verticalSpeed = verticalSpeedAt(t);
    altitude += verticalSpeed * fine;
    if (tick % ticksPerClock === 0) {
      truth.push({ t, altitude, verticalSpeed });
      events.push({ kind: 'clock', t });
    }
    const lost = outage && t >= outage[0] && t < outage[1];
    for (const kind of ['baro', 'gps'] as const) {
      const spec = sensors[kind];
      if (tick % ticksPer(spec.rate) !== 0) continue;
      const reading = altitude + noise(random, spec.sigma);
      if (spec.enabled && !lost) events.push({ kind, t, altitude: reading });
    }
  }
  return { truth, events };
}

export interface VerticalStep {
  t: number;
  predicted: Belief;
  estimate: Belief;
  event: AltitudeEvent;
}

// #region track
export function trackAltitude(
  events: AltitudeEvent[],
  sensors: Record<AltitudeSensor, Sensor>,
  acceleration: number
): VerticalStep[] {
  const steps: VerticalStep[] = [];
  let belief: Belief = { x: column(1000, 0), P: diagonal(100, 25) };
  let t = events[0].t;
  for (const event of events) {
    const predicted = predict(belief, constantVelocity(event.t - t, acceleration));
    belief = event.kind === 'clock' ? predicted : update(predicted, sensors[event.kind], [[event.altitude]]);
    t = event.t;
    steps.push({ t, predicted, estimate: belief, event });
  }
  return steps;
}
// #endregion

export const altitudeSensor = (sigma: number): Sensor => ({ H: [[1, 0]], R: [[sigma ** 2]] });
