export const guides = [
  { icon: 'pen', title: 'Create a post', description: 'Publish updates and keep your club informed.', to: '/posts/new' },
  { icon: 'users', title: 'Find a member', description: 'Search and manage club members.', to: '/employees' },
  { icon: 'settings', title: 'Manage your account', description: 'Update your profile and preferences.', to: '/settings' },
];
export const articleDetails = [
  {
    id: 'invite-members',
    category: 'Member management',
    breadcrumb: 'Member management',
    title: 'How to invite new members',
    description: 'Use the Employees workspace to prepare and review a member invitation.',
    steps: [
      { id: 'open-employees', heading: 'Open Employees', description: 'Go to the Employees workspace from the sidebar.' },
      { id: 'prepare-member-details', heading: 'Prepare member details', description: 'Check the member name, role, and team before continuing.' },
      { id: 'review-the-invitation', heading: 'Review the invitation', description: 'Confirm the information before an authorized service sends an invitation.' },
    ],
    boundary: 'Invitation delivery is not connected in this demo.',
    relatedIds: ['club-profile', 'member-roles'],
  },
  {
    id: 'club-profile',
    category: 'Club settings',
    breadcrumb: 'Club settings',
    title: 'How to update your club profile',
    description: 'Keep your club information accurate from Settings.',
    steps: [
      { id: 'open-settings', heading: 'Open Settings', description: 'Choose General from the Settings workspace.' },
      { id: 'update-club-details', heading: 'Update club details', description: 'Review the club name and other visible profile preferences.' },
      { id: 'save-your-changes', heading: 'Save your changes', description: 'Save the draft only after checking the changes.' },
    ],
    boundary: 'Settings are browser-local in this demo and are not shared with a server.',
    relatedIds: ['invite-members', 'member-roles'],
  },
  {
    id: 'member-roles',
    category: 'Organization',
    breadcrumb: 'Organization',
    title: 'Understanding member roles',
    description: 'Learn how roles, teams, and permissions are presented in the portal.',
    steps: [
      { id: 'review-member-role', heading: 'Review the member role', description: 'Open a member profile to see the displayed role and team.' },
      { id: 'check-team-context', heading: 'Check the team context', description: 'Use Organization to understand how the member appears in the club structure.' },
      { id: 'request-role-change', heading: 'Request a role change', description: 'Ask an authorized club administrator when access or responsibilities must change.' },
    ],
    boundary: 'Permissions are not connected to a server-authorized role service in this demo.',
    relatedIds: ['invite-members', 'club-profile'],
  },
];

export const articles = articleDetails.map(({ id, title, category, description, steps }) => ({
  id,
  title,
  searchTerms: [category, description, ...steps.map((step) => step.heading)],
}));
