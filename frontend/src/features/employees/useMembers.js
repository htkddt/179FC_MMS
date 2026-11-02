import { useEffect, useMemo, useState } from 'react';
import { members } from '../../mocks/members.js';
import { applyMemberProfile, loadMemberProfileOverrides } from './memberProfileStore.js';

// The directory and organization always read the same editable member records.
export function useMembers() {
  const [overrides, setOverrides] = useState(loadMemberProfileOverrides);

  useEffect(() => {
    const refresh = () => setOverrides(loadMemberProfileOverrides());
    window.addEventListener('179fc-member-profile-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('179fc-member-profile-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return useMemo(() => members.map(member => applyMemberProfile(member, overrides)), [overrides]);
}
