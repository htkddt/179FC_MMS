import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell.jsx';
import { useAuth } from '../features/auth/authStore.jsx';
import { SignInPage } from '../features/auth/pages/SignInPage.jsx';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage.jsx';
import { EmployeeProfilePage } from '../features/employees/pages/EmployeeProfilePage.jsx';
import { EmployeesPage } from '../features/employees/pages/EmployeesPage.jsx';
import { HelpPage } from '../features/help/pages/HelpPage.jsx';
import { HelpArticlePage } from '../features/help/pages/HelpArticlePage.jsx';
import { HelpSupportPage } from '../features/help/pages/HelpSupportPage.jsx';
import { PostsPage } from '../features/posts/pages/PostsPage.jsx';
import { PostDetailsPage } from '../features/posts/pages/PostDetailsPage.jsx';
import { PostEditorPage } from '../features/posts/pages/PostEditorPage.jsx';
import { OrganizationPage } from '../features/organization/pages/OrganizationPage.jsx';
import { PlaceholderPage } from '../features/shared/pages/PlaceholderPage.jsx';
import { PasswordSettingsPage } from '../features/settings/pages/PasswordSettingsPage.jsx';
import { SettingsPage } from '../features/settings/pages/SettingsPage.jsx';
import { SessionsSettingsPage } from '../features/settings/pages/SessionsSettingsPage.jsx';
import { TwoFactorSettingsPage } from '../features/settings/pages/TwoFactorSettingsPage.jsx';
import { ROUTES } from './routes.js';

function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to={ROUTES.signIn} replace />;
}

function PublicRoute() {
  const { user } = useAuth();
  return user ? <Navigate to={ROUTES.dashboard} replace /> : <Outlet />;
}

export const router = createBrowserRouter([
  { element: <PublicRoute />, children: [{ path: ROUTES.signIn, element: <SignInPage /> }] },
  {
    element: <ProtectedRoute />,
    children: [{
      element: <AppShell />,
      children: [
        { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },
        { path: ROUTES.dashboard, element: <DashboardPage /> },
        { path: ROUTES.posts, element: <PostsPage /> },
        { path: '/posts/new', element: <PostEditorPage /> },
        { path: '/posts/:postId/edit', element: <PostEditorPage /> },
        { path: '/posts/:postId', element: <PostDetailsPage /> },
        { path: ROUTES.employees, element: <EmployeesPage /> },
        { path: '/employees/:memberId', element: <EmployeeProfilePage /> },
        { path: ROUTES.organization, element: <OrganizationPage /> },
        { path: ROUTES.settings, element: <SettingsPage /> },
        { path: '/settings/password', element: <PasswordSettingsPage /> },
        { path: '/settings/two-factor', element: <TwoFactorSettingsPage /> },
        { path: '/settings/sessions', element: <SessionsSettingsPage /> },
        { path: ROUTES.help, element: <HelpPage /> },
        { path: '/help/articles/:articleId', element: <HelpArticlePage /> },
        { path: '/help/support', element: <HelpSupportPage /> },
        { path: ROUTES.assistant, element: <PlaceholderPage title="179 Assist" description="Use the assistant panel to get help from 179 Assist." /> },
        { path: '*', element: <Navigate to={ROUTES.dashboard} replace /> },
      ],
    }],
  },
  { path: '*', element: <Navigate to={ROUTES.signIn} replace /> },
], {
  basename: import.meta.env.BASE_URL,
});
