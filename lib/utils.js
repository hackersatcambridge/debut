/**
 * Accepts two functions that need to be executed one after the other
 * If one returns a promise, waiting for resolution will be respected
 * @param a - first function
 * @param b - second function
 * @param reverse - whether to perform a or b first
 * @return a Promise or null
 */
export function sequenceFunctions(a, b, reverse) {
  const [first, second] = reverse ? [b, a] : [a, b];

  return Promise.resolve(first()).then(() => second());
}
