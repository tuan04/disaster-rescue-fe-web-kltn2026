export const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
  );

  if (!match) {
    return value;
  }

  const [, year, month, day, hour, minute] = match;

  return `${day}/${month}/${year} ${hour}:${minute}`;
};
