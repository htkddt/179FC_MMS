import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button.jsx';
import { Card } from '../../../components/ui/Card.jsx';

const emptyForm = { current: '', next: '', confirmation: '' };

export function PasswordSettingsPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [checking, setChecking] = useState(false);
  const [outcome, setOutcome] = useState('');
  const timer = useRef(null);
  const inputs = useRef({});

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function returnToSecurity() {
    window.clearTimeout(timer.current);
    setForm(emptyForm);
    navigate('/settings?tab=security', { state: { focusId: 'settings-password' } });
  }
  function update(name, value) {
    setForm(current => ({ ...current, [name]: value }));
    setErrors(current => ({ ...current, [name]: '' }));
    setOutcome('');
  }
  function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.current) nextErrors.current = 'Enter your current password.';
    if (!form.next) nextErrors.next = 'Enter a new password.';
    else if (form.next.length < 12) nextErrors.next = 'Use at least 12 characters.';
    if (!form.confirmation) nextErrors.confirmation = 'Confirm your new password.';
    else if (form.confirmation !== form.next) nextErrors.confirmation = 'Passwords do not match.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      inputs.current[Object.keys(nextErrors)[0]]?.focus();
      return;
    }
    setChecking(true);
    setOutcome('');
    timer.current = window.setTimeout(() => {
      setChecking(false);
      setOutcome('Password changes are not connected. No password was changed or stored.');
    }, 250);
  }

  return <section className="settings-subpage settings-route">
    <button className="settings-back" type="button" onClick={returnToSecurity}>Back to Security</button>
    <Card className="settings-security-panel">
      <header className="settings-security-panel__heading"><h2>Update password</h2></header>
      <form className="settings-security-form" onSubmit={submit} noValidate>
        <p className="settings-security-boundary">This is a UI-only form. A connected account service must require fresh authentication before changing a password.</p>
        <label className="settings-control"><span>Current password</span><input ref={node => { inputs.current.current = node; }} type="password" autoComplete="current-password" value={form.current} onChange={event => update('current', event.target.value)} aria-invalid={!!errors.current} aria-describedby={errors.current ? 'current-password-error' : undefined} />{errors.current && <small id="current-password-error" className="settings-error">{errors.current}</small>}</label>
        <label className="settings-control"><span>New password</span><input ref={node => { inputs.current.next = node; }} type="password" autoComplete="new-password" value={form.next} onChange={event => update('next', event.target.value)} aria-invalid={!!errors.next} aria-describedby={errors.next ? 'new-password-error' : undefined} />{errors.next && <small id="new-password-error" className="settings-error">{errors.next}</small>}</label>
        <label className="settings-control"><span>Confirm new password</span><input ref={node => { inputs.current.confirmation = node; }} type="password" autoComplete="new-password" value={form.confirmation} onChange={event => update('confirmation', event.target.value)} aria-invalid={!!errors.confirmation} aria-describedby={errors.confirmation ? 'confirm-password-error' : undefined} />{errors.confirmation && <small id="confirm-password-error" className="settings-error">{errors.confirmation}</small>}</label>
        {checking && <p className="settings-security-status" role="status">Checking the password-change service...</p>}
        {outcome && <p className="settings-security-status settings-security-status--error" role="alert">{outcome}</p>}
        <footer className="settings-security-footer"><Button className="button--outline" onClick={returnToSecurity} disabled={checking}>Cancel</Button><Button type="submit" className="button--primary" disabled={checking}>{checking ? 'Checking...' : 'Continue'}</Button></footer>
      </form>
    </Card>
  </section>;
}
