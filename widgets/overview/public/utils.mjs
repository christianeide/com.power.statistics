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
