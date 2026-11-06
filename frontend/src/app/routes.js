export const ROUTES = {
  signIn: '/sign-in',
  dashboard: '/dashboard',
  posts: '/posts',
  employees: '/employees',
  organization: '/organization',
  settings: '/settings',
  help: '/help',
  assistant: '/assistant',
};

export const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', to: ROUTES.dashboard },
  { label: 'Posts', icon: 'posts', to: ROUTES.posts },
  { label: 'Employees', icon: 'employees', to: ROUTES.employees },
  { label: 'Organization', icon: 'organization', to: ROUTES.organization },
  { label: 'Settings', icon: 'settings', to: ROUTES.settings },
  { label: 'Help', icon: 'help', to: ROUTES.help },
];

export const PAGE_META = {
  [ROUTES.dashboard]: { title: 'Dashboard' },
  [ROUTES.posts]: { title: 'Posts' },
  [ROUTES.employees]: { title: 'Employees' },
  [ROUTES.organization]: { title: 'Organization' },
  [ROUTES.settings]: { title: 'Settings' },
  [ROUTES.help]: { title: 'Help Center' },
  [ROUTES.assistant]: { title: '179 Assist - Expanded', subtitle: 'Monday, 13 October 2026' },
};
