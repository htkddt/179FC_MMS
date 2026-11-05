import { useState } from 'react';
import { CurrentAccountProvider } from '../../features/auth/CurrentAccountProvider.jsx';
import { SettingsProvider, useSavedSettings } from '../../features/settings/SettingsProvider.jsx';
import { Outlet } from 'react-router-dom';
import { AssistantLauncher } from '../assistant/AssistantLauncher.jsx';
import { Sidebar } from './Sidebar.jsx';
import { TopBar } from './TopBar.jsx';

function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings: { compactNavigation: compact } } = useSavedSettings();
  return <div className={'portal-shell' + (compact ? ' portal-shell--compact' : '')}><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><main className="portal-main" inert={sidebarOpen}><TopBar onMenuClick={() => setSidebarOpen(true)} /><div className="portal-content"><Outlet /></div></main><div inert={sidebarOpen}><AssistantLauncher /></div></div>;
}

export function AppShell() {
  return <SettingsProvider><CurrentAccountProvider><Shell /></CurrentAccountProvider></SettingsProvider>;
}
