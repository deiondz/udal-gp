import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

/**
 * Formats a date string into DD/MM/YYYY HH:mm format, explicitly in UTC.
 * This prevents conversion to the user's local timezone and displays the time
 * exactly as it appears in the UTC timestamp from the database.
 *
 * @example
 * // Input: "2025-08-05T15:34:46.248Z"
 * // Output: "05/08/2025 15:34" (no timezone conversion)
 *
 * @param dateString The date string from the API (assumed to be UTC).
 * @returns A formatted date string or 'N/A' if the input is invalid.
 */
export function formatDateTime(dateString?: string): string {
  if (!dateString || !dayjs(dateString).isValid()) {
    return 'N/A'
  }
  return dayjs.utc(dateString).format('HH:mm DD/MM/YYYY')
}

/**
 * Formats a date string into a relative time format (e.g., "HH:mm today", "HH:mm yesterday", "HH:mm X days ago").
 * The time part (HH:mm) is displayed in UTC.
 *
 * @example
 * // Assuming current UTC date is 2025-08-06
 * // Input: "2025-08-06T10:00:00.000Z"
 * // Output: "10:00 today"
 * // Input: "2025-08-05T15:30:00.000Z"
 * // Output: "15:30 yesterday"
 * // Input: "2025-08-03T09:15:00.000Z"
 * // Output: "09:15 3 days ago"
 *
 * @param dateString The date string from the API (assumed to be UTC).
 * @returns A formatted relative date string or 'N/A' if the input is invalid.
 */
export function formatRelativeDateTime(dateString?: string): string {
  if (!dateString || !dayjs(dateString).isValid()) {
    return 'N/A'
  }

  const date = dayjs.utc(dateString)
  const now = dayjs().utc()

  // Get start of day for comparison
  const startOfToday = now.startOf('day')
  const startOfDate = date.startOf('day')

  const diffDays = startOfToday.diff(startOfDate, 'days')
  const time = date.format('HH:mm')

  if (diffDays === 0) {
    return `${time} today`
  } if (diffDays === 1) {
    return `${time} yesterday`
  }
  return `${time} ${diffDays} days ago`
}

export function formatBaselineRelativeDateTime(dateString?: string): string {
  if (!dateString || !dayjs(dateString).isValid()) {
    return 'N/A'
  }

  const date = dayjs.utc(dateString)
  const time = date.format('HH:mm')
  const formattedDate = date.format('MMM D, YYYY')

  return `${time} ${formattedDate}`
}
