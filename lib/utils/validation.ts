/**
 * Validate that end date is after start date
 */
export function validateDateRange(
  startDate: string | null,
  endDate: string | null
): string | null {
  if (!startDate || !endDate) {
    return null; // Allow empty dates
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return "End date must be after start date";
    }

    return null;
  } catch (error) {
    return "Invalid date format";
  }
}
