import { initialSettings } from '../../../mocks/settings.js';

export const settingsStorageKey = '179fc-demo-settings';
export const settingsChangedEvent = '179fc-settings-changed';
export const generalSettingKeys = ['clubName', 'language', 'timeZone', 'compactNavigation', 'assistant', 'summary'];

function validateStored(settings) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) throw new Error('Invalid settings');
  if (typeof settings.clubName !== 'string' || !settings.clubName.trim() || settings.clubName.trim().length > 80
    || typeof settings.language !== 'string' || !settings.language
    || !['Asia/Ho_Chi_Minh', 'UTC'].includes(settings.timeZone)
    || ['compactNavigation', 'assistant', 'summary'].some(key => typeof settings[key] !== 'boolean')) throw new Error('Invalid settings');
}

export function readSettingsSnapshot(storage) {
  try {
    const revision = (storage ?? globalThis.localStorage).getItem(settingsStorageKey);
    const stored = revision === null ? {} : JSON.parse(revision);
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) throw new Error('Invalid settings');
    const settings = { ...initialSettings, ...stored };
    validateStored(settings);
    return { settings, revision };
  } catch {
    throw new Error('Could not load settings. Check browser storage and retry.');
  }
}

export async function getSettings() { return readSettingsSnapshot().settings; }

// Read/compare/write are synchronous: no asynchronous gap before persistence.
// localStorage cannot provide a server-style atomic compare-and-swap across processes.
export async function saveSettingsSnapshot(changes, { expectedRevision } = {}) {
  if (!changes || Object.keys(changes).some(key => !generalSettingKeys.includes(key))) throw new Error('This preference is unavailable.');
  if ('clubName' in changes && (typeof changes.clubName !== 'string' || !changes.clubName.trim())) throw new Error('Club name is required.');
  if ('clubName' in changes && changes.clubName.trim().length > 80) throw new Error('Club name must be 80 characters or fewer.');
  if ('language' in changes && !['English', 'Vietnamese'].includes(changes.language)) throw new Error('Choose an available workspace language.');
  const latest = readSettingsSnapshot();
  if (expectedRevision !== undefined && expectedRevision !== latest.revision) {
    const error = new Error('Settings changed in another tab. Reload the latest values before saving.');
    error.code = 'SETTINGS_CONFLICT';
    throw error;
  }
  const settings = { ...latest.settings, ...changes, ...('clubName' in changes ? { clubName: changes.clubName.trim() } : {}) };
  validateStored(settings);
  const revision = JSON.stringify(settings);
  try { globalThis.localStorage.setItem(settingsStorageKey, revision); }
  catch { throw new Error('Could not save settings. Check browser storage and try again.'); }
  globalThis.window?.dispatchEvent(new Event(settingsChangedEvent));
  return { settings, revision };
}

export async function saveSettings(changes, options) { return (await saveSettingsSnapshot(changes, options)).settings; }
