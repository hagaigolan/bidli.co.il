// DB timestamps are stored without a timezone designator (e.g. "2026-09-12T09:19:56.155000")
// and are in UTC. new Date() parses them as local time, shifting results by the local
// timezone offset (3 hours in Israel). This helper appends "Z" so they parse as UTC.
export function parseDbDate(value) {
  if (!value) return null;
  const str = String(value);
  const hasTz = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(str);
  const d = new Date(hasTz ? str : str + "Z");
  return isNaN(d.getTime()) ? null : d;
}