import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button.jsx';
import { Card } from '../../../components/ui/Card.jsx';

export function SessionsSettingsPage() {
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState('loading');
  const timer = useRef(null);

  useEffect(() => {
    setStatus('loading');
    timer.current = window.setTimeout(() => setStatus('unavailable'), 250);
    return () => window.clearTimeout(timer.current);
  }, [attempt]);

  function returnToSecurity() {
    navigate('/settings?tab=security', { state: { focusId: 'settings-sessions' } });
  }

  return <section className="settings-subpage settings-route">
    <button className="settings-back" type="button" onClick={returnToSecurity}>Back to Security</button>
    <div className="settings-subpage__content">
      <Card className="settings-security-panel">
        <header className="settings-security-panel__heading"><h2>Active sessions</h2></header>
        <div className="settings-security-form">
          <p className="settings-security-boundary">Session records are server-authoritative. This preview does not invent a browser, device, location, session, or revoke result.</p>
          {status === 'loading' ? <div className="settings-session-loading" aria-busy="true" role="status"><span /><span /><span />Loading verified sessions...</div> : <div className="settings-session-empty" role="alert"><h3>No verified sessions available</h3><p>The session service is not connected, so this preview cannot show or revoke sessions.</p></div>}
          <footer className="settings-security-footer"><Button className="button--outline" onClick={returnToSecurity}>Back</Button><Button className="button--primary" onClick={() => setAttempt(current => current + 1)}>Retry</Button></footer>
        </div>
      </Card>
      <aside className="settings-security-context" aria-labelledby="sessions-boundary-heading">
        <h2 id="sessions-boundary-heading">Connected behavior</h2>
        <p>Each session shows only server-authoritative details. Revoking the current session signs out through the shared account flow.</p>
      </aside>
    </div>
  </section>;
}
