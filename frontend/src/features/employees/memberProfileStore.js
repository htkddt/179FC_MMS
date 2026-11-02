const PROFILE_STORAGE_KEY = '179fc-member-profiles-v1';
const editableFields = ['avatar', 'team', 'dateOfBirth', 'phone'];

function getStorage() {
  try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; }
}

export function loadMemberProfileOverrides(storage = getStorage()) {
  try {
    const saved = JSON.parse(storage?.getItem(PROFILE_STORAGE_KEY) || '{}');
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  } catch { return {}; }
}

export function applyMemberProfile(member, overrides = loadMemberProfileOverrides()) {
  const saved = overrides[member.id];
  return saved && typeof saved === 'object' ? { ...member, ...saved } : member;
}

export function saveMemberProfile(memberId, profile, storage = getStorage(), { requirePersistence = false } = {}) {
  const overrides = loadMemberProfileOverrides(storage);
  const merged = { ...overrides[memberId], ...profile };
  const savedProfile = Object.fromEntries(editableFields.filter((field) => typeof merged[field] === 'string').map((field) => [field, merged[field]]));
  const next = { ...overrides, [memberId]: savedProfile };
  try {
    if (!storage && requirePersistence) throw new Error('Storage unavailable');
    storage?.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    if (requirePersistence) throw new Error('Unable to save the team change. Please enable browser storage and try again.');
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('179fc-member-profile-changed'));
  return next;
}
