/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import { fly } from './aircraft';
import { simulateAltitude } from './altitude';
import { predict as predictMatrix, update as updateMatrix } from './filter';
import { degrees, simulateFlight, type Pose } from './flight';
import { origin, toEnu, toGeodetic } from './geo';
import { filterAltitude, predict, update } from './gaussian';
import { invert, multiply } from './matrix';
import { seeded } from './random';
import { sampleSensors, gyroBias } from './sensors';
import { altitudeSensor, simulateVertical, trackAltitude } from './vertical';

const wrap = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));
const rms = (values: number[]) => Math.sqrt(values.reduce((sum, v) => sum + v * v, 0) / values.length);

describe('one dimension', () => {
  test('fusing two equally certain readings lands halfway with half the variance', () => {
    expect(update({ mean: 10, variance: 4 }, { mean: 14, variance: 4 })).toEqual({ mean: 12, variance: 2 });
  });

  test('predict adds the motion and its uncertainty', () => {
    expect(predict({ mean: 1000, variance: 4 }, { mean: 5, variance: 1 })).toEqual({ mean: 1005, variance: 5 });
  });

  test('variance settles at the analytic steady state for a random walk', () => {
    const steps = filterAltitude(new Array(200).fill(0), new Array(200).fill(0), 1, 1, 2, { mean: 0, variance: 100 });
    expect(steps.at(-1)!.estimate.variance).toBeCloseTo((-1 + Math.sqrt(17)) / 2, 6);
  });

  test('the filter beats the raw readings on a climbing aircraft', () => {
    const run = simulateAltitude({
      seed: 4,
      seconds: 60,
      dt: 0.5,
      start: 1000,
      climbRate: (t) => (t > 20 ? 5 : 0),
      turbulence: 0.5,
      altimeter: 8
    });
    const steps = filterAltitude(run.readings, run.climbRates, run.dt, 0.5, 8, { mean: 1000, variance: 64 });
    const raw = rms(run.readings.map((z, k) => z - run.truth[k]));
    const filtered = rms(steps.map((s, k) => s.estimate.mean - run.truth[k]));
    expect(filtered).toBeLessThan(raw / 2);
  });
});

describe('matrices', () => {
  test('invert undoes a 2x2 matrix', () => {
    const inverse = invert([
      [4, 7],
      [2, 6]
    ]);
    expect(inverse[0][0]).toBeCloseTo(0.6);
    expect(inverse[0][1]).toBeCloseTo(-0.7);
    expect(inverse[1][0]).toBeCloseTo(-0.2);
    expect(inverse[1][1]).toBeCloseTo(0.4);
    expect(multiply([[1, 2]], [[3], [4]])).toEqual([[11]]);
  });

  test('a one-state matrix filter gives the same answer as the scalar filter', () => {
    const scalar = update(predict({ mean: 1000, variance: 4 }, { mean: 5, variance: 1 }), { mean: 1010, variance: 9 });
    const belief = predictMatrix({ x: [[1000]], P: [[4]] }, { F: [[1]], Q: [[1]], G: [[1]] }, [[5]]);
    const matrix = updateMatrix(belief, { H: [[1]], R: [[9]] }, [[1010]]);
    expect(matrix.x[0][0]).toBeCloseTo(scalar.mean, 10);
    expect(matrix.P[0][0]).toBeCloseTo(scalar.variance, 10);
  });
});

describe('hidden vertical speed', () => {
  const sensors = { baro: altitudeSensor(3), gps: altitudeSensor(8) };
  const scenario = {
    seed: 2,
    sensors: { baro: { rate: 10, sigma: 3, enabled: true }, gps: { rate: 1, sigma: 8, enabled: true } }
  };

  test('estimates the climb rate that no sensor measures', () => {
    const { truth, events } = simulateVertical(scenario);
    const steps = trackAltitude(events, sensors, 0.5);
    const at35 = steps.findLast((s) => s.t <= 35)!;
    const climb = truth.find((s) => s.t >= 35)!.verticalSpeed;
    expect(climb).toBe(6);
    expect(Math.abs(at35.estimate.x[1][0] - climb)).toBeLessThan(1);
  });

  test('uncertainty grows while every sensor is lost and shrinks when they return', () => {
    const { events } = simulateVertical({ ...scenario, outage: [40, 60] });
    const steps = trackAltitude(events, sensors, 0.5);
    const sigmaAt = (t: number) => Math.sqrt(steps.findLast((s) => s.t <= t)!.estimate.P[0][0]);
    expect(sigmaAt(59.9)).toBeGreaterThan(5 * sigmaAt(39.9));
    expect(sigmaAt(65)).toBeLessThan(sigmaAt(59.9) / 3);
  });
});

describe('the aircraft', () => {
  const truth = simulateFlight(7);
  const run = (outage?: [number, number], estimateBias = true) =>
    fly(truth, sampleSensors(truth, { seed: 3, noiseScale: 1, outage }), { noiseScale: 1, estimateBias });
  const horizontal = (f: { estimate: Pose; truth: Pose }) =>
    Math.hypot(f.estimate.east - f.truth.east, f.estimate.north - f.truth.north);

  test('converts GPS fixes to local metres and back', () => {
    const point = toEnu({ lat: origin.lat + 0.01, lon: origin.lon + 0.01, alt: 120 });
    expect(point.north).toBeCloseTo(1111.95, 1);
    expect(point.east).toBeCloseTo(679.5, 0);
    const back = toGeodetic(point);
    expect(back.lat).toBeCloseTo(origin.lat + 0.01, 9);
    expect(back.alt).toBe(120);
  });

  const nominal = run();
  const settled = nominal.filter((f) => f.t > 20);

  test('tracks position within a few metres while GPS is available', () => {
    expect(rms(settled.map(horizontal))).toBeLessThan(3);
    expect(rms(settled.map((f) => f.estimate.up - f.truth.up))).toBeLessThan(1);
  });

  test('tracks bank through both turns within three degrees', () => {
    const turns = settled.filter((f) => f.leg === 1 || f.leg === 4);
    expect(Math.max(...turns.map((f) => Math.abs(wrap(f.estimate.roll - f.truth.roll))))).toBeLessThan(3 * degrees);
  });

  test('learns the gyro bias that no sensor reports', () => {
    const last = nominal.at(-1)!;
    expect(Math.abs(last.bias.roll - gyroBias.roll)).toBeLessThan(0.15 * degrees);
    expect(Math.abs(last.bias.pitch - gyroBias.pitch)).toBeLessThan(0.15 * degrees);
    expect(Math.abs(last.bias.yaw - gyroBias.yaw)).toBeLessThan(0.15 * degrees);
  });

  test('a GPS outage grows the position uncertainty and the error stays inside it', () => {
    const frames = run([128, 160]);
    const end = frames.findLast((f) => f.t < 160)!;
    const before = frames.findLast((f) => f.t < 128)!;
    expect(end.sigma.east).toBeGreaterThan(50 * before.sigma.east);
    expect(horizontal(end)).toBeLessThan(2 * Math.hypot(end.sigma.east, end.sigma.north));
  });

  test('ignoring gyro bias lets the attitude drift away', () => {
    const frames = run(undefined, false).filter((f) => f.t > 20);
    expect(rms(frames.map((f) => wrap(f.estimate.roll - f.truth.roll)))).toBeGreaterThan(10 * degrees);
  });

  test('the same seed always produces the same flight', () => {
    expect(seeded(42)()).toBe(seeded(42)());
    expect(run().at(-1)!.estimate).toEqual(nominal.at(-1)!.estimate);
  });
});
