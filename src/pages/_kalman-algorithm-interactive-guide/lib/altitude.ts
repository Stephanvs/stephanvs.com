import { noise, seeded } from './random';

export interface AltitudeRun {
  dt: number;
  t: number[];
  truth: number[];
  readings: number[];
  climbRates: number[];
}

export interface AltitudeScenario {
  seed: number;
  seconds: number;
  dt: number;
  start: number;
  climbRate: (t: number) => number;
  turbulence: number;
  altimeter: number;
}

export function simulateAltitude(scenario: AltitudeScenario): AltitudeRun {
  const { seed, seconds, dt, start, climbRate, turbulence, altimeter } = scenario;
  const random = seeded(seed);
  const run: AltitudeRun = { dt, t: [], truth: [], readings: [], climbRates: [] };
  let altitude = start;
  for (let k = 1; k <= Math.round(seconds / dt); k++) {
    const t = k * dt;
    const rate = climbRate(t);
    altitude += rate * dt + noise(random, turbulence);
    run.t.push(t);
    run.truth.push(altitude);
    run.readings.push(altitude + noise(random, altimeter));
    run.climbRates.push(rate);
  }
  return run;
}

export const levelThenClimb = (levelFor: number, rate: number) => (t: number) => (t > levelFor ? rate : 0);
