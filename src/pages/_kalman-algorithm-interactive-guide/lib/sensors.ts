import { degrees, type TruthSample } from './flight';
import { toGeodetic, type Enu, type Geodetic } from './geo';
import { noise, seeded } from './random';

export interface Rates {
  roll: number;
  pitch: number;
  yaw: number;
}

// #region sensor-event
export type SensorEvent =
  | { kind: 'imu'; t: number; gyro: Rates }
  | { kind: 'baro'; t: number; altitude: number }
  | { kind: 'gps'; t: number; fix: Geodetic; velocity: Enu };
// #endregion

export const sensorSpecs = {
  imu: { rate: 50, gyro: 0.3 * degrees },
  baro: { rate: 10, altitude: 1.5 },
  gps: { rate: 1, horizontal: 3, vertical: 6, velocity: 0.2 }
};

export const gyroBias: Rates = { roll: 0.6 * degrees, pitch: -0.4 * degrees, yaw: 0.5 * degrees };

export interface SensorOptions {
  seed: number;
  noiseScale: number;
  outage?: [number, number];
}

export function sampleSensors(truth: TruthSample[], { seed, noiseScale, outage }: SensorOptions): SensorEvent[] {
  const random = seeded(seed);
  const n = (sigma: number) => noise(random, sigma * noiseScale);
  const every = (rate: number) => Math.round(sensorSpecs.imu.rate / rate);
  const { imu, baro, gps } = sensorSpecs;
  const events: SensorEvent[] = [];
  const bias = { ...gyroBias };

  truth.forEach((sample, index) => {
    const { t } = sample;
    bias.roll += noise(random, 0.0005 * degrees);
    bias.pitch += noise(random, 0.0005 * degrees);
    bias.yaw += noise(random, 0.0005 * degrees);
    if (index % every(baro.rate) === 0) {
      events.push({ kind: 'baro', t, altitude: sample.up + n(baro.altitude) });
    }
    if (index % every(gps.rate) === 0) {
      const fix = toGeodetic({
        east: sample.east + n(gps.horizontal),
        north: sample.north + n(gps.horizontal),
        up: sample.up + n(gps.vertical)
      });
      const velocity = {
        east: sample.vEast + n(gps.velocity),
        north: sample.vNorth + n(gps.velocity),
        up: sample.vUp + n(gps.velocity)
      };
      const lost = outage && t >= outage[0] && t < outage[1];
      if (!lost) events.push({ kind: 'gps', t, fix, velocity });
    }
    events.push({
      kind: 'imu',
      t,
      gyro: {
        roll: sample.rollRate + bias.roll + n(imu.gyro),
        pitch: sample.pitchRate + bias.pitch + n(imu.gyro),
        yaw: sample.yawRate + bias.yaw + n(imu.gyro)
      }
    });
  });
  return events;
}
