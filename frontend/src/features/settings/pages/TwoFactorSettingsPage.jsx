import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button.jsx';
import { Card } from '../../../components/ui/Card.jsx';

export function TwoFactorSettingsPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState('authenticator');
  const [checking, setChecking] = useState(false);
  const [outcome, setOutcome] = useState('');
  const timer = useRef(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function returnToSecurity() {
    window.clearTimeout(timer.current);
    navigate('/settings?tab=security', { state: { focusId: 'settings-two-factor' } });
  }
  function submit(event) {
    event.preventDefault();
    setChecking(true);
    setOutcome('');
    timer.current = window.setTimeout(() => {
      setChecking(false);
      setOutcome(`Two-factor setup with ${method === 'authenticator' ? 'an authenticator app' : 'a security key'} requires a connected security service. No factor was enrolled.`);
    }, 250);
  }

  return <section className="settings-subpage settings-route">
    <button className="settings-back" type="button" onClick={returnToSecurity}>Back to Security</button>
    <Card className="settings-security-panel">
      <header className="settings-security-panel__heading"><h2>Set up two-factor authentication</h2><span className="settings-badge">Not set up</span></header>
      <form className="settings-security-form" onSubmit={submit}>
        <p className="settings-security-boundary">Choose a method to preview the setup UI. This preview never creates a QR code, recovery code, or enrolled factor.</p>
        <fieldset className="settings-methods" disabled={checking}><legend>Verification method</legend>
          <label className="settings-method"><input type="radio" name="two-factor-method" value="authenticator" checked={method === 'authenticator'} onChange={event => setMethod(event.target.value)} /> <span><strong>Authenticator app</strong><small>Use a time-based code after server verification is connected.</small></span></label>
          <label className="settings-method"><input type="radio" name="two-factor-method" value="security-key" checked={method === 'security-key'} onChange={event => setMethod(event.target.value)} /> <span><strong>Security key</strong><small>Use a registered security key after server verification is connected.</small></span></label>
        </fieldset>
        {checking && <p className="settings-security-status" role="status">Checking the two-factor setup service...</p>}
        {outcome && <p className="settings-security-status settings-security-status--error" role="alert">{outcome}</p>}
        <footer className="settings-security-footer"><Button className="button--outline" onClick={returnToSecurity} disabled={checking}>Cancel</Button><Button type="submit" className="button--primary" disabled={checking}>{checking ? 'Checking...' : 'Start setup'}</Button></footer>
      </form>
    </Card>
  </section>;
}
