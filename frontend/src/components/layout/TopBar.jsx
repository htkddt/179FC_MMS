import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PAGE_META, ROUTES } from '../../app/routes.js';
import { useAuth } from '../../features/auth/authStore.jsx';
import { useCurrentAccount } from '../../features/auth/CurrentAccountProvider.jsx';
import { Avatar } from '../ui/Avatar.jsx';
import { Icon } from '../ui/Icon.jsx';

export function TopBar({ onMenuClick }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const account = useCurrentAccount();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const outside = event => { if (!menuRef.current?.contains(event.target)) setMenuOpen(false); };
    const escape = event => { if (event.key === 'Escape') { setMenuOpen(false); menuRef.current?.querySelector('button')?.focus(); } };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [menuOpen]);
  const meta = PAGE_META[pathname] || (pathname === '/posts/new' ? { title: 'Create post', subtitle: 'Post creation' }
    : pathname.startsWith('/posts/') ? { title: pathname.endsWith('/edit') ? 'Edit draft' : 'Post details', subtitle: 'Club updates' }
    : pathname === '/settings/password' ? { title: 'Change password' }
    : pathname === '/settings/two-factor' ? { title: 'Two-factor authentication' }
    : pathname === '/settings/sessions' ? { title: 'Manage sessions' }
    : pathname === '/help/support' ? { title: 'Contact support' }
    : pathname.startsWith('/help/articles/') ? { title: 'Help Center' }
    : { title: 'Employee profile', subtitle: 'Member details' });
  const go = (to) => { setMenuOpen(false); navigate(to); };

  return (
    <header className={'top-bar top-bar--' + (pathname.split('/')[1] || 'dashboard') + (pathname.startsWith('/posts/') ? ' top-bar--post-workflow' : '')}>
      <div className="top-bar__title"><button className="menu-toggle" aria-label="Open navigation" onClick={onMenuClick}><Icon name="menu" /></button><div><h1>{meta.title}</h1>{meta.subtitle && <p>{meta.subtitle}</p>}</div></div>
      <div className="top-bar__actions">
      {!user ? <div className="guest-auth-actions" aria-label="Account actions">
        <Link className="guest-auth-actions__sign-up" to={ROUTES.signIn}>Sign up</Link>
        <Link className="guest-auth-actions__log-in" to={ROUTES.signIn}>Log in</Link>
      </div> : null}
      {user ?
      <div className="user-menu-wrap" ref={menuRef}>
        <button className="user-trigger" aria-expanded={menuOpen} aria-label="Open user menu" onClick={() => setMenuOpen((current) => !current)}><Avatar initials={account.initials} tone={account.tone} image={account.avatar} size="sm" label={account.name} /><Icon name="chevronDown" size={14} /></button>
        {menuOpen ? <div className="user-menu">
          <div className="user-menu__identity"><Avatar initials={account.initials} tone={account.tone} image={account.avatar} size="sm" /><span><strong>{account.name || 'Account'}</strong><small>{account.role || 'Member'}</small></span></div>
          <div className="user-menu__divider" />
          <button disabled={!account.id} onClick={() => go('/employees/' + account.id)}>Profile</button>
          <button onClick={() => go(ROUTES.settings)}>Settings</button>
          <button onClick={() => go(ROUTES.help)}>Help center</button>
          <div className="user-menu__divider user-menu__divider--section" role="separator" />
          <button className="user-menu__logout" onClick={() => {
            const proceed = () => {
              navigate(ROUTES.dashboard, { replace: true, flushSync: true });
              signOut();
            };
            if (window.dispatchEvent(new CustomEvent('179fc-before-signout', { cancelable: true, detail: { proceed } }))) proceed();
          }}>Log out</button>
        </div> : null}
      </div> : null}</div>
    </header>
  );
}
