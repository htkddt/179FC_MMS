import { createContext, useContext } from 'react';
import { useMembers } from '../employees/useMembers.js';
import { useAuth } from './authStore.jsx';

const AccountContext = createContext(null);

export function CurrentAccountProvider({ children }) {
  const { user } = useAuth();
  const members = useMembers();
  const profile = members.find(member => member.id === user?.id);
  const account = { ...user, ...profile, email: profile?.email || user?.email || '', profileAvailable: !!profile };
  return <AccountContext.Provider value={account}>{children}</AccountContext.Provider>;
}

export function useCurrentAccount() { return useContext(AccountContext); }
