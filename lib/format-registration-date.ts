export function formatRegistrationDate(
  value: string,
  fallbackDate?: string,
  fallbackTime?: string,
) {
  const date = new Date(value)
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "Africa/Lagos",
    }).format(date).replace(", ", " at ")
  }

  return [fallbackDate, fallbackTime].filter(Boolean).join(" at ") || "Not available"
}
