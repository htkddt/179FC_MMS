import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../app/routes.js';
import { useAuth } from '../../features/auth/authStore.jsx';
import { useCurrentAccount } from '../../features/auth/CurrentAccountProvider.jsx';
import { useSavedSettings } from '../../features/settings/SettingsProvider.jsx';
import { Avatar } from '../ui/Avatar.jsx';
import { Icon } from '../ui/Icon.jsx';

export function Sidebar({ open, onClose }) {
  const { settings } = useSavedSettings();
  const { user } = useAuth();
  const account = useCurrentAccount();
  const drawer = useRef(null);
  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement;
    drawer.current?.querySelector('button')?.focus();
    return () => { if (trigger?.isConnected) trigger.focus(); };
  }, [open]);
  function keyDown(event) {
    if (!open) return;
    if (event.key === 'Escape') { event.preventDefault(); onClose(); }
    if (event.key === 'Tab') {
      const links = drawer.current.querySelectorAll('a, button');
      const first = links[0], last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }
  return <>
    <aside ref={drawer} className={'sidebar' + (open ? ' sidebar--open' : '')} role={open ? 'dialog' : undefined} aria-modal={open || undefined} aria-label={open ? 'Navigation' : undefined} onKeyDown={keyDown}>
      <div className="brand" aria-label={settings.clubName + ' member portal'}><span className="brand__mark">179</span><span><strong title={settings.clubName}>{settings.clubName}</strong><small>MEMBER PORTAL</small></span></div>
      {open && <button className="sidebar__close" aria-label="Close navigation" onClick={onClose}><Icon name="close" /></button>}
      <nav className="sidebar__nav" aria-label="Main navigation">
        {NAV_ITEMS.map(item => <NavLink key={item.to} to={item.to} aria-label={item.label} className={({ isActive }) => 'nav-item' + (isActive ? ' nav-item--active' : '')} onClick={onClose}><Icon name={item.icon} size={15} /><span>{item.label}</span></NavLink>)}
      </nav>
      {user ? <div className="sidebar__user"><Avatar initials={account.initials} tone={account.tone} image={account.avatar} size="sm" label={account.name} /><span><strong>{account.name || 'Account'}</strong><small>{account.role || 'Member'}</small></span></div> : null}
    </aside>
    {open && <button className="sidebar-scrim" aria-label="Close navigation" onClick={onClose} />}
  </>;
}
