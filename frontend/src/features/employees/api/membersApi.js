import { members } from '../../../mocks/members.js';
import { applyMemberProfile, saveMemberProfile } from '../memberProfileStore.js';

// Keep the catalog independent of membership: empty teams remain valid destinations.
export const memberTeams = [...new Set(members.map(member => member.team))];

// Replace this adapter with the server mutation; keep both chart entry points here.
export async function transferMemberTeam({ memberId, targetTeam }, storage) {
  const member = members.find(item => item.id === memberId);
  if (!member) throw new Error('This member no longer exists. Refresh the directory and try again.');
  if (!memberTeams.includes(targetTeam)) throw new Error('Choose an available destination team.');
  const overrides = saveMemberProfile(memberId, { team: targetTeam }, storage, { requirePersistence: true });
  return applyMemberProfile(member, overrides);
}
