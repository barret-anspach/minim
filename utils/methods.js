export function approxEqual(a, b, epsilon = 5) {
  return Math.abs(a - b) <= epsilon;
}
