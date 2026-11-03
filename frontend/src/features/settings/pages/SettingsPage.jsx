import { useEffect, useRef, useState } from 'react';
import { useBlocker, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { Tabs } from '../../../components/ui/Tabs.jsx';
import { useUrlTab } from '../../../hooks/useUrlTab.js';
import { useCurrentAccount } from '../../auth/CurrentAccountProvider.jsx';
import { formatTimestamp } from '../../shared/dateFormat.js';
import { useSavedSettings } from '../SettingsProvider.jsx';
import { generalSettingKeys, saveSettingsSnapshot } from '../api/settingsApi.js';
import { AccountCard, PreferenceRow, SettingsSwitch } from '../components/SettingsControls.jsx';
import { DiscardDialog } from '../components/DiscardDialog.jsx';

const tabs = [
  { value: 'general', label: <><Icon name="settings" size={18} />General</> },
  { value: 'notifications', label: <><Icon name="bell" size={18} />Notifications</> },
  { value: 'security', label: <><Icon name="shield" size={18} />Security</> },
];
const titles = { general: 'General settings', notifications: 'Notification preferences', security: 'Security' };
const icons = { general: 'settings', notifications: 'bell', security: 'shield' };
const toModel = snapshot => ({ saved: snapshot.settings, revision: snapshot.revision, draft: { ...snapshot.settings } });

export function SettingsPage() {
  const shared = useSavedSettings();
  const account = useCurrentAccount();
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useUrlTab(tabs.map(item => item.value), 'general');
  const [model, setModel] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [validation, setValidation] = useState('');
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState(null);
  const inFlight = useRef(false);
  const signingOut = useRef(false);
  const clubInput = useRef(null);
  const restoredFocusId = useRef(null);
  const dirty = !!model && generalSettingKeys.some(key => model.draft[key] !== model.saved[key]);
  const conflict = !!model && model.revision !== shared.revision;

  useEffect(() => {
    if (!shared.loading && !shared.error && !saving && (!model || (!dirty && conflict))) {
      setModel(toModel(shared));
      setFeedback(null);
    }
  }, [shared.settings, shared.revision, shared.loading, shared.error, saving, model, dirty, conflict]);

  useEffect(() => {
    const focusId = location.state?.focusId;
    if (!focusId) return undefined;
    restoredFocusId.current = focusId;
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
  }, [location.key, location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    if (location.state || !restoredFocusId.current) return undefined;
    const focusId = restoredFocusId.current;
    restoredFocusId.current = null;
    const frame = window.requestAnimationFrame(() => document.getElementById(focusId)?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [location.key, location.state]);

  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    (dirty || inFlight.current) && !signingOut.current &&
    (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search));
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (inFlight.current) blocker.reset();
    else setPending({ kind: 'navigation' });
  }, [blocker]);
  useEffect(() => {
    const warn = event => {
      if (dirty || inFlight.current) { event.preventDefault(); event.returnValue = ''; }
    };
    const signOut = event => {
      if (inFlight.current) { event.preventDefault(); return; }
      if (dirty) { event.preventDefault(); setPending({ kind: 'signout', proceed: event.detail?.proceed }); }
    };
    window.addEventListener('beforeunload', warn);
    window.addEventListener('179fc-before-signout', signOut);
    return () => { window.removeEventListener('beforeunload', warn); window.removeEventListener('179fc-before-signout', signOut); };
  }, [dirty]);

  function update(key, value) {
    if (inFlight.current) return;
    setModel(current => ({ ...current, draft: { ...current.draft, [key]: value } }));
    setFeedback(null);
    if (key === 'clubName') setValidation('');
  }
  function discard() {
    setModel(toModel(shared));
    setValidation('');
    setFeedback(null);
  }
  function keepEditing() {
    setPending(null);
    if (blocker.state === 'blocked') blocker.reset();
  }
  function confirmDiscard() {
    const action = pending;
    discard();
    setPending(null);
    if (action?.kind === 'navigation' && blocker.state === 'blocked') blocker.proceed();
    if (action?.kind === 'signout') { signingOut.current = true; action.proceed?.(); }
  }
  async function save(event) {
    event.preventDefault();
    if (inFlight.current || !dirty || conflict || shared.error) return;
    const name = model.draft.clubName.trim();
    if (tab === 'general' && (!name || name.length > 80)) {
      setValidation(!name ? 'Enter a club name.' : 'Use 80 characters or fewer.');
      clubInput.current?.focus();
      return;
    }
    inFlight.current = true;
    setSaving(true);
    setFeedback(null);
    try {
      const changes = Object.fromEntries(generalSettingKeys.filter(key => model.draft[key] !== model.saved[key]).map(key => [key, model.draft[key]]));
      const snapshot = await saveSettingsSnapshot(changes, { expectedRevision: model.revision });
      setModel(toModel(snapshot));
      setFeedback({ text: 'Changes saved.', error: false });
    } catch (error) {
      if (error.code === 'SETTINGS_CONFLICT') shared.refresh();
      setFeedback({ text: error.message || 'Could not save settings. Please try again.', error: true });
    } finally { inFlight.current = false; setSaving(false); }
  }

  const form = model?.draft;
  const status = saving ? 'Saving changes...' : feedback?.text || (dirty ? 'Unsaved changes' : tab === 'notifications' ? 'No changes to save' : 'All changes saved');
  return <section className="settings-page settings-route">
    <Tabs items={tabs} value={tab} onChange={setTab} label="Settings sections" disabled={saving} />
    <div className="settings-layout">
      <Card key={tab} className="settings-panel" id={'panel-' + tab} role="tabpanel" aria-labelledby={'tab-' + tab} aria-busy={shared.loading || saving}>
        <header className="settings-panel__heading"><span><Icon name={icons[tab]} size={23} /></span><h2>{titles[tab]}</h2></header>
        {shared.error && <div className="settings-notice settings-notice--error" role="alert">{shared.error}<Button className="button--outline" onClick={shared.refresh} disabled={saving}>Retry</Button></div>}
        {shared.loading || (!form && !shared.error) ? <div className="settings-loading" role="status">Loading settings...<span /><span /><span /></div> : form && <form onSubmit={save} noValidate>
          {conflict && <div className="settings-notice" role="alert"><span>Settings changed in another tab. Reload the latest values before saving.</span><Button className="button--outline" disabled={saving || !!shared.error} onClick={() => dirty ? setPending({ kind: 'reload' }) : discard()}>Reload latest</Button></div>}
          <fieldset disabled={saving}>
            {tab === 'general' && <>
              <div className="settings-section"><h3>Workspace</h3><div className="settings-field-grid">
                <label className="settings-control"><span>Club name</span><input ref={clubInput} value={form.clubName} onChange={event => update('clubName', event.target.value)} required maxLength={80} aria-invalid={!!validation} aria-describedby={validation ? 'club-name-error' : undefined} />{validation && <small id="club-name-error" className="settings-error">{validation}</small>}</label>
                <label className="settings-control"><span>Workspace language</span><select value={form.language} onChange={event => update('language', event.target.value)} aria-describedby={form.language !== 'English' ? 'language-boundary' : undefined}><option value="English">English</option><option value="Vietnamese">Vietnamese</option>{!['English', 'Vietnamese'].includes(form.language) && <option value={form.language} disabled>{form.language} - unavailable</option>}</select></label>
              </div>{form.language !== 'English' && <p className="settings-hint" id="language-boundary">{form.language === 'Vietnamese' ? 'Vietnamese is saved as your preference. The portal remains in English until translation is connected.' : `Saved language ${form.language} is not available yet. The portal uses English until you choose an available language.`}</p>}</div>
              <div className="settings-section"><h3>Preferences</h3>
                <label className="settings-control"><span>Time zone</span><select value={form.timeZone} onChange={event => update('timeZone', event.target.value)}><option value="Asia/Ho_Chi_Minh">(GMT+07:00) Ho Chi Minh City</option><option value="UTC">(GMT+00:00) UTC</option></select></label>
                <p className="settings-hint">Example: {formatTimestamp('2026-11-03T02:00:00Z', form, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                <PreferenceRow icon="monitor" title="Compact navigation"><span>{form.compactNavigation ? 'On' : 'Off'}</span><SettingsSwitch label="Compact navigation" checked={form.compactNavigation} onChange={value => update('compactNavigation', value)} /></PreferenceRow>
              </div>
            </>}
            {tab === 'notifications' && <div className="settings-section">
              <p className="settings-notice" id="notifications-unavailable">Notification delivery is not connected. Saving these preferences does not send reminders, reports, push notifications, or email.</p>
              <PreferenceRow icon="bell" title="Assistant notifications"><span>{form.assistant ? 'On' : 'Off'}</span><SettingsSwitch label="Assistant notifications" checked={form.assistant} onChange={value => update('assistant', value)} describedBy="notifications-unavailable" /></PreferenceRow>
              <PreferenceRow icon="chart" title="Weekly activity summary"><span>{form.summary ? 'On' : 'Off'}</span><SettingsSwitch label="Weekly activity summary" checked={form.summary} onChange={value => update('summary', value)} describedBy="notifications-unavailable" /></PreferenceRow>
            </div>}
            {tab === 'security' && <div className="settings-section">
              <p className="settings-notice" id="security-unavailable">Security services are not connected in this preview. These destinations provide UI only and never confirm a password, factor, or session change.</p>
              <PreferenceRow icon="lock" title="Password"><Button id="settings-password" className="button--outline" onClick={() => navigate('/settings/password')} aria-describedby="security-unavailable">Change password</Button></PreferenceRow>
              <PreferenceRow icon="shield" title="Two-factor authentication"><span className="settings-badge">Not set up</span><Button id="settings-two-factor" className="button--outline" onClick={() => navigate('/settings/two-factor')} aria-describedby="security-unavailable">Set up</Button></PreferenceRow>
              <PreferenceRow icon="monitor" title="Active sessions"><Button id="settings-sessions" className="button--outline" onClick={() => navigate('/settings/sessions')} aria-describedby="security-unavailable">Manage sessions</Button></PreferenceRow>
            </div>}
          </fieldset>
          {tab !== 'security' && <footer className="settings-footer">
            <span className={feedback?.error ? 'settings-error' : ''} role="status"><Icon name="check" size={16} />{status}</span>
            <div>{dirty && <Button className="button--outline" disabled={saving || !!shared.error} onClick={discard}>Discard</Button>}<Button type="submit" className="button--primary" disabled={!dirty || saving || conflict || !!shared.error}>{saving ? 'Saving...' : feedback?.error ? 'Retry save' : 'Save changes'}</Button></div>
          </footer>}
        </form>}
      </Card>
      <AccountCard account={account} />
    </div>
    <DiscardDialog open={!!pending} onKeep={keepEditing} onDiscard={confirmDiscard} />
  </section>;
}
