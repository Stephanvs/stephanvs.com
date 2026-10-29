import { noise, seeded } from './random';

export const gravity = 9.81;
export const degrees = Math.PI / 180;

export interface Pose {
  east: number;
  north: number;
  up: number;
  roll: number;
  pitch: number;
  yaw: number;
}

export interface TruthSample extends Pose {
  t: number;
  vEast: number;
  vNorth: number;
  vUp: number;
  rollRate: number;
  pitchRate: number;
  yawRate: number;
  leg: number;
}

// #region flight-plan
export interface Leg {
  name: string;
  until: number;
  bank: number;
  verticalSpeed: number;
  airspeed: number;
}

export const flightPlan: Leg[] = [
  { name: 'Climb out', until: 35, bank: 0, verticalSpeed: 6, airspeed: 75 },
  { name: 'Climbing left turn', until: 95, bank: -25, verticalSpeed: 5, airspeed: 80 },
  { name: 'Climb', until: 125, bank: 0, verticalSpeed: 5, airspeed: 85 },
  { name: 'Cruise', until: 165, bank: 0, verticalSpeed: 0, airspeed: 90 },
  { name: 'Descending right turn', until: 225, bank: 25, verticalSpeed: -4, airspeed: 85 },
  { name: 'Approach', until: 270, bank: 0, verticalSpeed: -3.5, airspeed: 75 }
];
// #endregion

export const flightSeconds = flightPlan[flightPlan.length - 1].until;
export const truthRate = 50;

const approach = (value: number, target: number, maxStep: number) =>
  value + Math.max(-maxStep, Math.min(maxStep, target - value));

export const angleOfAttack = (airspeed: number) => 2.5 * degrees * (85 / airspeed) ** 2;

export function simulateFlight(seed: number): TruthSample[] {
  const random = seeded(seed);
  const dt = 1 / truthRate;
  const samples: TruthSample[] = [];
  let east = 0;
  let north = 0;
  let up = 15;
  let yaw = 270 * degrees;
  let bank = 0;
  let verticalSpeed = 6;
  let airspeed = 75;
  let gust = 0;
  let roll = 0;
  let pitch = Math.asin(verticalSpeed / airspeed) + angleOfAttack(airspeed);
  let leg = 0;

  for (let tick = 0; tick <= flightSeconds * truthRate; tick++) {
    const t = tick * dt;
    while (leg < flightPlan.length - 1 && t >= flightPlan[leg].until) leg++;
    const target = flightPlan[leg];

    gust += -0.5 * gust * dt + noise(random, 0.6 * degrees * Math.sqrt(dt));
    const previousRoll = roll;
    bank = approach(bank, target.bank * degrees, 8 * degrees * dt);
    roll = bank + gust;
    verticalSpeed = approach(verticalSpeed, target.verticalSpeed, 1 * dt);
    airspeed = approach(airspeed, target.airspeed, 1 * dt);

    const climbAngle = Math.asin(verticalSpeed / airspeed);
    const previousPitch = pitch;
    pitch = climbAngle + angleOfAttack(airspeed);
    const yawRate = (gravity * Math.tan(bank)) / airspeed;
    const groundSpeed = airspeed * Math.cos(climbAngle);
    const vEast = groundSpeed * Math.sin(yaw);
    const vNorth = groundSpeed * Math.cos(yaw);

    samples.push({
      t,
      east,
      north,
      up,
      roll,
      pitch,
      yaw,
      vEast,
      vNorth,
      vUp: verticalSpeed,
      rollRate: tick === 0 ? 0 : (roll - previousRoll) / dt,
      pitchRate: tick === 0 ? 0 : (pitch - previousPitch) / dt,
      yawRate,
      leg
    });

    east += vEast * dt;
    north += vNorth * dt;
    up += verticalSpeed * dt;
    yaw += yawRate * dt;
  }
  return samples;
}
