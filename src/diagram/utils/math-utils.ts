/**
 * Rounds a number in an intuitive way.
 * The digits parameter is used as a number of significant digits to maintain for small numbers.
 * However, rounding never carries beyond the integer part of a number, even if it contains more than
 * that number of significant digits.
 * @param x number to round
 * @param digits number of digits of precision to maintain in decimals
 * @returns a rounded number
 */
export function roundForDisplay(x: number, digits: number): number {
  const intRange = Math.pow(10, digits);
  if (x<-intRange || x>intRange) {
    return Math.round(x);
  }
  return +x.toPrecision(digits);
}
