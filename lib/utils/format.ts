/**
 * Format a date string for display
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Failed to format date:", error);
    return dateString;
  }
}

/**
 * Convert a Date object to ISO 8601 string
 */
export function toISO8601(date: Date): string {
  return date.toISOString();
}

/**
 * Parse ISO 8601 string to Date object
 */
export function fromISO8601(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Format date for datetime-local input
 */
export function toDateTimeLocalValue(dateString: string | null): string {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    // Format: yyyy-MM-ddTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error("Failed to convert to datetime-local:", error);
    return "";
  }
}
