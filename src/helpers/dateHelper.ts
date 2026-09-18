/**
 * Date formatting helpers for Disaster Rescue Web
 */

export const formatDateTime = (value?: string | null): string => {
  if (!value) return "-";

  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) {
      // Fallback regex matching standard ISO string (YYYY-MM-DDTHH:mm)
      const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      if (match) {
        const [, year, month, day, hour, minute] = match;
        return `${day}/${month}/${year} ${hour}:${minute}`;
      }
      return value;
    }

    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value || "-";
  }
};

export const formatDate = (value?: string | null): string => {
  return formatDateTime(value);
};

export const formatDateOnly = (value?: string | null): string => {
  if (!value) return "-";

  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;

    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return value || "-";
  }
};

export const formatTimeOnly = (value?: string | null): string => {
  if (!value) return "-";

  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;

    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value || "-";
  }
};
