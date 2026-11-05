import { initialSettings } from '../../mocks/settings.js';

export function parsePortalInstant(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  // Legacy timestamps without an offset represent club wall-clock time (UTC+07).
  const normalized = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value) ? value + '+07:00' : value;
  const date = new Date(normalized);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function formatTimestamp(value, settings = initialSettings, options = {}) {
  const date = parsePortalInstant(value);
  if (!date) return 'Date unavailable';
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    ...(!dateOnly ? { hour: '2-digit', minute: '2-digit' } : {}),
    ...options, timeZone: dateOnly ? 'UTC' : settings.timeZone,
  }).format(date);
}

export function eventInstant(event) { return event.date + 'T' + event.time + ':00+07:00'; }

export function eventDateParts(event, settings) {
  const date = parsePortalInstant(eventInstant(event));
  if (!date) return { day: '—', month: '—', label: 'Date unavailable' };
  const parts = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: settings.timeZone }).formatToParts(date);
  return { day: parts.find(part => part.type === 'day').value, month: parts.find(part => part.type === 'month').value,
    label: formatTimestamp(eventInstant(event), settings) };
}
