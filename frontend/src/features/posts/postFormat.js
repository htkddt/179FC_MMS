import { formatTimestamp } from '../shared/dateFormat.js';

export function formatPostDate(value, settings) {
  return formatTimestamp(value, settings).replace(',', ' at');
}
