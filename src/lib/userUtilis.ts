export const prettyRole = (name?: string | null) =>
  name
    ? name
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "—";

export const isSuspended = (u: { status?: string; isActive?: boolean }) =>
  u.status?.toUpperCase() === "SUSPENDED" || u.isActive === false;
export const isUnSuspended = (u: { status?: string; isActive?: boolean }) =>
  u.status?.toUpperCase() === "ACTIVE" || u.isActive === false;

export const prettyStatus = (status?: string | null) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "—";