import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon.jsx';
import { ROUTES } from '../../../app/routes.js';
import { useAuth } from '../authStore.jsx';
import { SignInForm } from '../components/SignInForm.jsx';

function AuthBrand() {
  return <div className="auth-brand"><span className="brand__mark">179</span><span><strong>179FC</strong><small>MEMBER MANAGEMENT PORTAL</small></span></div>;
}

function isSafeInternalReturnTo(returnTo) {
  if (typeof returnTo !== 'string' || !returnTo.startsWith('/') || returnTo.startsWith('//') || returnTo.includes('\\')) return false;
  try {
    const decoded = decodeURIComponent(returnTo);
    return !decoded.startsWith('//') && !decoded.includes('\\');
  } catch {
    return false;
  }
}

export function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  function handleSignIn() {
    const returnTo = location.state?.returnTo;
    const destination = isSafeInternalReturnTo(returnTo) ? returnTo : ROUTES.dashboard;
    setIsSigningIn(true);
    signIn();
    navigate(destination, { replace: true });
  }

  if (user && !isSigningIn) return <Navigate to={ROUTES.dashboard} replace />;

  return (
    <main className="auth-layout">
      <section className="auth-promo"><AuthBrand /><div className="auth-promo__copy"><h1>One club. One<br />connected team.</h1><p>A calmer way for 179FC members to share updates,<br className="desktop-break" /> find teammates and stay aligned.</p></div><ul className="auth-promo__benefits"><li><Icon name="check" size={15} />Team updates &amp; posts</li><li><Icon name="check" size={15} />Clear roles &amp; ownership</li><li><Icon name="check" size={15} />Help in one click</li></ul></section>
      <section className="auth-panel"><div className="auth-card"><h1>Welcome back</h1><p>Sign in to the 179FC workspace.</p><SignInForm onSubmit={handleSignIn} /><small className="auth-help">Need access? Contact your club administrator.</small></div></section>
    </main>
  );
}
