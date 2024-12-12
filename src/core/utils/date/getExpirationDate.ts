/**
 * Sets the expiration date by adding a specified number of minutes to the current date.
 *
 * @param {number} minutes - The number of minutes to add to the current date.
 * @returns {string} The expiration date in ISO format.
 */
export function getExpirationDate(minutes: number): string {
  const currentDate = new Date();
  const expirationDate = new Date(currentDate.getTime() + minutes * 60000);
  return expirationDate.toISOString();
}
