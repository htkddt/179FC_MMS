import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { initialSettings } from '../../mocks/settings.js';
import { readSettingsSnapshot, settingsChangedEvent, settingsStorageKey } from './api/settingsApi.js';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [snapshot, setSnapshot] = useState({ settings: initialSettings, revision: null, loading: true, error: null });
  const refresh = useCallback(() => {
    try {
      const latest = readSettingsSnapshot();
      setSnapshot(current => !current.loading && !current.error && current.revision === latest.revision
        ? current : { ...latest, loading: false, error: null });
    } catch (error) { setSnapshot(current => ({ ...current, loading: false, error: error.message })); }
  }, []);
  useEffect(() => {
    const onStorage = event => { if (event.key === settingsStorageKey || event.key === null) refresh(); };
    refresh();
    window.addEventListener(settingsChangedEvent, refresh);
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(settingsChangedEvent, refresh);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);
  return <SettingsContext.Provider value={{ ...snapshot, refresh }}>{children}</SettingsContext.Provider>;
}

export function useSavedSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSavedSettings requires SettingsProvider.');
  return context;
}
