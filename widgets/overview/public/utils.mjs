export function getCurrentHourKey() {
  const time = new Date();
  const hour = time.getHours();
  return getHourKey(hour);
}

export function getHourKey(hour) {
  return `${hour.toString().padStart(2, '0')}:00`;
}
