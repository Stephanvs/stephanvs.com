import { add, identity, invert, multiply, subtract, transpose, type Matrix } from './matrix';

// #region types
export interface Belief {
  x: Matrix;
  P: Matrix;
}

export interface Model {
  F: Matrix;
  Q: Matrix;
  G?: Matrix;
}

export interface Sensor {
  H: Matrix;
  R: Matrix;
}
// #endregion

// #region predict
export function predict({ x, P }: Belief, { F, Q, G }: Model, u?: Matrix): Belief {
  const moved = multiply(F, x);
  return {
    x: G && u ? add(moved, multiply(G, u)) : moved,
    P: add(multiply(multiply(F, P), transpose(F)), Q)
  };
}
// #endregion

// #region update
export function update({ x, P }: Belief, { H, R }: Sensor, z: Matrix): Belief {
  const innovation = subtract(z, multiply(H, x));
  const S = add(multiply(multiply(H, P), transpose(H)), R);
  const K = multiply(multiply(P, transpose(H)), invert(S));
  return {
    x: add(x, multiply(K, innovation)),
    P: multiply(subtract(identity(x.length), multiply(K, H)), P)
  };
}
// #endregion

// #region constant-velocity
export function constantVelocity(dt: number, acceleration: number): Model {
  const q = acceleration ** 2;
  return {
    F: [
      [1, dt],
      [0, 1]
    ],
    Q: [
      [(q * dt ** 3) / 3, (q * dt ** 2) / 2],
      [(q * dt ** 2) / 2, q * dt]
    ]
  };
}
// #endregion
