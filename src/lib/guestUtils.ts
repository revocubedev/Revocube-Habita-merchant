// Confirm the real values with your backend
export const GUEST_STATUSES = ["INCOMING", "CHECKED_IN", "CHECKED_OUT"];

// The API sends the date and the time of day as separate fields (time is on a 1970 date)
export const combine = (
  date?: string | null,
  time?: string | null
): string | null => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  if (time) {
    const t = new Date(time);
    if (!isNaN(t.getTime()))
      d.setUTCHours(t.getUTCHours(), t.getUTCMinutes(), 0, 0);
  }
  return d.toISOString();
};

// UTC on purpose: the API stores the time of day as entered, so a timezone shift would change it
export const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      });
};

export const prettyStatus = (status: string) =>
  status
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || "—";

export const getStatusBadgeStyle = (status: string) => {
  switch (status.toLowerCase().replace(/[^a-z]/g, "")) {
    case "incoming":
      return { backgroundColor: "#FEF3C7", color: "#B45309" };
    case "checkedin":
      return { backgroundColor: "#E5F9EC", color: "#27964F" };
    default:
      return { backgroundColor: "#F3F4F6", color: "#6B7280" };
  }
};
