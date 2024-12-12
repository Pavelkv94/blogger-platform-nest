/**
 * Checks if the given date has expired compared to the current date.
 *
 * @param {string} expirationDateISO - The expiration date in ISO format.
 * @returns {boolean} True if the date has expired, otherwise false.
 */
export function hasDateExpired(expirationDateISO: string): boolean {
  const currentDate = new Date();
  const expirationDate = new Date(expirationDateISO);
  return expirationDate < currentDate;
}
