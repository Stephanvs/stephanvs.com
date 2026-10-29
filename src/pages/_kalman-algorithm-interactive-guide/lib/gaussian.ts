// #region gaussian
export interface Gaussian {
  mean: number;
  variance: number;
}
// #endregion

// #region smooth
export function smooth(previous: number, reading: number, alpha: number): number {
  return previous + alpha * (reading - previous);
}
// #endregion

// #region update
export function update(prior: Gaussian, measurement: Gaussian): Gaussian {
  const gain = prior.variance / (prior.variance + measurement.variance);
  return {
    mean: prior.mean + gain * (measurement.mean - prior.mean),
    variance: (1 - gain) * prior.variance
  };
}
// #endregion

// #region predict
export function predict(belief: Gaussian, motion: Gaussian): Gaussian {
  return {
    mean: belief.mean + motion.mean,
    variance: belief.variance + motion.variance
  };
}
// #endregion

export interface Step {
  predicted: Gaussian;
  estimate: Gaussian;
}

// #region filter
export function filterAltitude(
  readings: number[],
  climbRates: number[],
  dt: number,
  turbulence: number,
  altimeter: number,
  start: Gaussian
): Step[] {
  const steps: Step[] = [];
  let belief = start;
  for (let k = 0; k < readings.length; k++) {
    const predicted = predict(belief, { mean: climbRates[k] * dt, variance: turbulence ** 2 });
    belief = update(predicted, { mean: readings[k], variance: altimeter ** 2 });
    steps.push({ predicted, estimate: belief });
  }
  return steps;
}
// #endregion

export function density({ mean, variance }: Gaussian, x: number): number {
  return Math.exp(-((x - mean) ** 2) / (2 * variance)) / Math.sqrt(2 * Math.PI * variance);
}
