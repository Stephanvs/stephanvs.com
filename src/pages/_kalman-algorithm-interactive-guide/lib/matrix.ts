// #region matrix
export type Matrix = number[][];

export function multiply(a: Matrix, b: Matrix): Matrix {
  return a.map((row) => b[0].map((_, j) => row.reduce((sum, value, k) => sum + value * b[k][j], 0)));
}

export function add(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((value, j) => value + b[i][j]));
}

export function subtract(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((value, j) => value - b[i][j]));
}

export function transpose(a: Matrix): Matrix {
  return a[0].map((_, j) => a.map((row) => row[j]));
}

export function identity(size: number): Matrix {
  return Array.from({ length: size }, (_, i) => Array.from({ length: size }, (_, j) => (i === j ? 1 : 0)));
}
// #endregion

// #region invert
export function invert(a: Matrix): Matrix {
  const n = a.length;
  const m = a.map((row, i) => [...row, ...identity(n)[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(m[row][col]) > Math.abs(m[pivot][col])) pivot = row;
    }
    [m[col], m[pivot]] = [m[pivot], m[col]];
    const scale = m[col][col];
    m[col] = m[col].map((value) => value / scale);
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = m[row][col];
      m[row] = m[row].map((value, j) => value - factor * m[col][j]);
    }
  }
  return m.map((row) => row.slice(n));
}
// #endregion

export const column = (...values: number[]): Matrix => values.map((value) => [value]);

export const diagonal = (...values: number[]): Matrix =>
  values.map((value, i) => values.map((_, j) => (i === j ? value : 0)));
