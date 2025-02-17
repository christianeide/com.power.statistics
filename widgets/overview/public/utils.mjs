export function getCurrentHourKey() {
  const time = new Date();
  const hour = time.getHours();
  return getHourKey(hour);
}

export function getHourKey(hour) {
  return `${hour.toString().padStart(2, '0')}:00`;
}

export function dateIsToday(date) {
  return date.toDateString() === new Date().toDateString();
}

/**
 * Check if a given date is tomorrow compared to the current date.
 * @param {Date} date - The date to check.
 * @returns {boolean} True if the given date is tomorrow, false otherwise.
 */
export function dateIsTomorrow(date) {
  const today = new Date();
  // Create a date for tomorrow using only year, month, and day (ignoring time)
  const tomorrow = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
  );
  return (
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()
  );
}

/**
 * Calculate the effective electricity price after applying state support.
 *
 * For hours when the electricity price exceeds 93.75 øre per kWh (incl. VAT),
 * the state covers 90% of the excess amount. Thus, the effective price is computed as:
 *
 *     effectivePrice = 93.75 + 0.1 * (originalPrice - 93.75)
 *
 * If the original price is at or below 93.75, no state support is applied.
 *
 * @param {number} originalPrice - The original electricity price in øre per kWh (including VAT)
 * @returns {number} The effective electricity price after applying state support.
 */
export function calculateEffectivePrice(originalPrice) {
  const PRICE_THRESHOLD = 93.75;

  if (originalPrice > PRICE_THRESHOLD) {
    // Calculate the consumer's effective price after state support.
    return PRICE_THRESHOLD + 0.1 * (originalPrice - PRICE_THRESHOLD);
  }

  // If the price is at or below the threshold, return the original price.
  return originalPrice;
}

export function calculateTotalPrice(price) {
  // Assume usage is always 1 kWh
  const usage = 1;

  // Determine grid fee rate based on the current time period
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hour = now.getHours();

  // Check if it's a weekday (Monday to Friday) and if the time is between 06:00 and 22:00 (day period)
  const isWeekday = day >= 1 && day <= 5;
  const isDaytime = hour >= 6 && hour < 22;

  // Set grid fee rate:
  // Day: 42.50 øre/kWh, Night/Weekend: 32.50 øre/kWh
  const gridFeeRate = isWeekday && isDaytime ? 42.5 : 32.5;

  // Calculate electricity and grid fee costs based on 1 kWh consumption.
  // NB! This do not take into account fastledd.
  const gridFeeCost = usage * gridFeeRate;

  // Calculate effective electricity price after applying state support.
  // Note: The state support only applies to the electricity price (not the grid fee).
  const effectiveElectricityPrice = calculateEffectivePrice(price);
  const effectiveTotalCost = effectiveElectricityPrice + gridFeeCost;

  // Return both the original total cost and the effective total cost after state support.
  return effectiveTotalCost;
}
