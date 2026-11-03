import { Link } from 'react-router-dom';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';

export function SettingsSwitch({ label, checked, disabled, describedBy, onChange }) {
  return <button className={'settings-switch' + (checked ? ' settings-switch--on' : '')} type="button" role="switch" aria-checked={checked} aria-label={label} aria-describedby={describedBy} disabled={disabled} onClick={() => onChange(!checked)}><span /></button>;
}

export function PreferenceRow({ icon, title, children }) {
  return <div className="settings-option"><span className="settings-option__icon"><Icon name={icon} size={22} /></span><h3>{title}</h3><div className="settings-option__actions">{children}</div></div>;
}

export function AccountCard({ account }) {
  return <Card className="settings-account">
    <h2>Account</h2>
    <div className="settings-account__profile"><Avatar initials={account.initials} tone={account.tone} image={account.avatar} label={account.name} size="xl" /><div><strong>{account.name || 'Account'}</strong><span>{account.role || 'Member'}</span></div></div>
    <dl><dt>Email</dt><dd>{account.email || 'Email not available'}</dd></dl>
    {account.id && <Link to={'/employees/' + account.id}>View profile <Icon name="arrow" size={18} /></Link>}
  </Card>;
}