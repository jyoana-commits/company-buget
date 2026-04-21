/**
 * Deterministic date/time formatting for display.
 * Uses fixed locale and options so server and client produce the same string,
 * avoiding React hydration mismatches from toLocaleDateString()/toLocaleTimeString().
 */
const LOCALE = "en-US";
const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
};
const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
};

/** Format a Date as "M/D/YYYY H:MM:SS AM/PM" (en-US) so SSR and client match. */
export function formatDateTimeForDisplay(date: Date): string {
  const datePart = date.toLocaleDateString(LOCALE, DATE_OPTIONS);
  const timePart = date.toLocaleTimeString(LOCALE, TIME_OPTIONS);
  return `${datePart} ${timePart}`;
}
