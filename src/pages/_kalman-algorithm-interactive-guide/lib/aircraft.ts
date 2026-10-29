import { constantVelocity, predict, update, type Belief, type Model, type Sensor } from './filter';
import { angleOfAttack, degrees, gravity, truthRate, type Pose, type TruthSample } from './flight';
import { toEnu, type Enu } from './geo';
import { column, diagonal } from './matrix';
import { sensorSpecs, type Rates, type SensorEvent } from './sensors';

export type Axis = 'east' | 'north' | 'up';
export type Angle = 'roll' | 'pitch' | 'yaw';
const axes: Axis[] = ['east', 'north', 'up'];
const angles: Angle[] = ['roll', 'pitch', 'yaw'];

// #region aircraft-belief
export interface AircraftBelief {
  t: number;
  position: Record<Axis, Belief>;
  attitude: Record<Angle, Belief>;
  gyro: Rates;
  lastImu: number;
}
// #endregion

export interface Tuning {
  noiseScale: number;
  estimateBias: boolean;
}

const acceleration: Record<Axis, number> = { east: 2, north: 2, up: 0.5 };
const biasDrift = 0.01 * degrees;
const nominalAngleOfAttack = angleOfAttack(80);
const attitudeSigma: Rates = { roll: 3 * degrees, pitch: 1.5 * degrees, yaw: 1 * degrees };

// #region gyro-model
export function gyroModel(dt: number, gyroNoise: number, estimateBias: boolean): Model {
  return {
    F: [
      [1, -dt],
      [0, 1]
    ],
    G: [[dt], [0]],
    Q: [
      [(gyroNoise * dt) ** 2, 0],
      [0, estimateBias ? biasDrift ** 2 * dt : 0]
    ]
  };
}
// #endregion

// #region attitude-from-motion
export function attitudeFromMotion(velocity: Enu, yawRate: number): Rates {
  const groundSpeed = Math.hypot(velocity.east, velocity.north);
  const airspeed = Math.hypot(groundSpeed, velocity.up);
  return {
    roll: Math.atan((airspeed * yawRate) / gravity),
    pitch: Math.atan2(velocity.up, groundSpeed) + nominalAngleOfAttack,
    yaw: Math.atan2(velocity.east, velocity.north)
  };
}
// #endregion

const wrap = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));
const value = (belief: Belief) => belief.x[0][0];
const rate = (belief: Belief) => belief.x[1][0];
const sigma = (belief: Belief) => Math.sqrt(belief.P[0][0]);
const map = <K extends string, T, U>(record: Record<K, T>, keys: K[], fn: (value: T, key: K) => U) =>
  Object.fromEntries(keys.map((key) => [key, fn(record[key], key)])) as Record<K, U>;

const sensorCache = new Map<number, ReturnType<typeof buildSensors>>();

function sensors(noiseScale: number) {
  if (!sensorCache.has(noiseScale)) sensorCache.set(noiseScale, buildSensors(noiseScale));
  return sensorCache.get(noiseScale)!;
}

function buildSensors(noiseScale: number) {
  const { baro, gps } = sensorSpecs;
  const gpsSensor = (position: number): Sensor => ({
    H: diagonal(1, 1),
    R: diagonal((position * noiseScale) ** 2, (gps.velocity * noiseScale) ** 2)
  });
  return {
    baro: { H: [[1, 0]], R: [[(baro.altitude * noiseScale) ** 2]] } as Sensor,
    gps: { east: gpsSensor(gps.horizontal), north: gpsSensor(gps.horizontal), up: gpsSensor(gps.vertical) },
    attitude: map(attitudeSigma, angles, (s): Sensor => ({ H: [[1, 0]], R: [[s ** 2]] }))
  };
}

export function initialBelief(estimateBias: boolean): AircraftBelief {
  const biasVariance = estimateBias ? (1 * degrees) ** 2 : 0;
  return {
    t: 0,
    position: map(acceleration, axes, () => ({ x: column(0, 0), P: diagonal(100 ** 2, 50 ** 2) })),
    attitude: {
      roll: { x: column(0, 0), P: diagonal((10 * degrees) ** 2, biasVariance) },
      pitch: { x: column(0, 0), P: diagonal((10 * degrees) ** 2, biasVariance) },
      yaw: { x: column(0, 0), P: diagonal((180 * degrees) ** 2, biasVariance) }
    },
    gyro: { roll: 0, pitch: 0, yaw: 0 },
    lastImu: 0
  };
}

// #region step
export function step(belief: AircraftBelief, event: SensorEvent, tuning: Tuning): AircraftBelief {
  const dt = event.t - belief.t;
  const position = map(belief.position, axes, (axis, key) => predict(axis, constantVelocity(dt, acceleration[key])));
  const moved = { ...belief, t: event.t, position };
  const { baro, gps, attitude } = sensors(tuning.noiseScale);

  switch (event.kind) {
    case 'imu': {
      const dtImu = event.t - belief.lastImu;
      const model = gyroModel(dtImu, sensorSpecs.imu.gyro * tuning.noiseScale, tuning.estimateBias);
      return {
        ...moved,
        attitude: map(belief.attitude, angles, (angle, key) => predict(angle, model, [[event.gyro[key]]])),
        gyro: event.gyro,
        lastImu: event.t
      };
    }
    case 'baro':
      return { ...moved, position: { ...position, up: update(position.up, baro, [[event.altitude]]) } };
    case 'gps': {
      const point = toEnu(event.fix);
      const fixed = map(position, axes, (axis, key) =>
        update(axis, gps[key], column(point[key], event.velocity[key]))
      );
      const velocity = map(fixed, axes, rate);
      const yawRate = belief.gyro.yaw - rate(belief.attitude.yaw);
      const measured = attitudeFromMotion(velocity, yawRate);
      return {
        ...moved,
        position: fixed,
        attitude: map(belief.attitude, angles, (angle, key) => {
          const z = value(angle) + wrap(measured[key] - value(angle));
          return update(angle, attitude[key], [[z]]);
        })
      };
    }
  }
}
// #endregion

export interface Frame {
  t: number;
  leg: number;
  truth: Pose;
  estimate: Pose;
  sigma: Pose;
  bias: Rates;
}

export const frameRate = 20;

function poseOf(belief: AircraftBelief, read: (belief: Belief) => number): Pose {
  return {
    ...map(belief.position, axes, read),
    ...map(belief.attitude, angles, read)
  };
}

// #region fly
export function fly(truth: TruthSample[], events: SensorEvent[], tuning: Tuning): Frame[] {
  const frames: Frame[] = [];
  let belief = initialBelief(tuning.estimateBias);
  let next = 0;
  for (const event of events) {
    belief = step(belief, event, tuning);
    if (event.kind !== 'imu' || event.t < next - 1e-9) continue;
    const sample = truth[Math.round(event.t * truthRate)];
    frames.push({
      t: event.t,
      leg: sample.leg,
      truth: sample,
      estimate: poseOf(belief, value),
      sigma: poseOf(belief, sigma),
      bias: map(belief.attitude, angles, rate)
    });
    next += 1 / frameRate;
  }
  return frames;
}
// #endregion
