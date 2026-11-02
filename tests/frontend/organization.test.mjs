import test from 'node:test';
import assert from 'node:assert/strict';
import { members } from '../../frontend/src/mocks/members.js';
import { applyMemberProfile, saveMemberProfile } from '../../frontend/src/features/employees/memberProfileStore.js';
import { memberTeams, transferMemberTeam } from '../../frontend/src/features/employees/api/membersApi.js';
import { LAYOUT_STORAGE_KEY, NODE_HEIGHT, NODE_WIDTH, TEAM_HEADER_HEIGHT, VIEW_STORAGE_KEY, createOrganizationLayout, findDropTeam, getTeamView, groupMembers, loadPositions, loadTeamViews, movePosition, positionOverride, resolvePositions, savePositions, saveTeamViews } from '../../frontend/src/features/organization/organizationLayout.js';

function memoryStorage() {
  const values = new Map();
  return { values, getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
}

test('each directory member occupies one non-overlapping slot below its team header', () => {
  const layout = createOrganizationLayout(members, 4, {}, memberTeams);
  assert.deepEqual(Object.keys(layout.positions).sort(), members.map(member => member.id).sort());
  for (const area of layout.teamAreas) for (const member of members.filter(item => item.team === area.team)) {
    const point = layout.positions[member.id];
    assert.ok(point.y >= area.y + TEAM_HEADER_HEIGHT + 14);
    assert.ok(point.x >= area.x && point.x + NODE_WIDTH <= area.x + area.width);
    assert.ok(point.y + NODE_HEIGHT <= area.y + area.height);
  }
  const points = Object.values(layout.positions);
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
    assert.ok(Math.abs(points[i].x - points[j].x) >= NODE_WIDTH || Math.abs(points[i].y - points[j].y) >= NODE_HEIGHT);
  }
});

test('collapse, hide and scaling alter presentation while preserving membership records', () => {
  const before = JSON.stringify(members);
  const layout = createOrganizationLayout(members, 3, { Management: { collapsed: true }, Media: { hidden: true }, Medical: { scale: 1.25 } }, memberTeams);
  assert.equal(layout.teamAreas.some(area => area.team === 'Media'), false);
  assert.ok(layout.teamAreas.find(area => area.team === 'Management').collapsed);
  for (const member of members.filter(item => ['Management', 'Media'].includes(item.team))) assert.equal(layout.positions[member.id], undefined);
  assert.equal(layout.positions['thao-vy'].scale, 1.25);
  assert.equal(JSON.stringify(members), before);
});

test('small viewports, empty teams and empty collections keep valid drop areas', () => {
  const mobile = createOrganizationLayout(members, 1, {}, memberTeams);
  assert.equal(mobile.width, 298);
  assert.deepEqual(new Set(Object.values(mobile.positions).map(point => point.x)), new Set([44]));
  const empty = createOrganizationLayout([], 4, {}, ['Media']);
  assert.equal(empty.teamAreas.length, 1);
  assert.equal(empty.teamAreas[0].count, 0);
  assert.deepEqual(empty.positions, {});
  assert.deepEqual(createOrganizationLayout([]).positions, {});
  assert.deepEqual(groupMembers([], memberTeams).map(group => group.name), memberTeams);
});

test('drop hit testing includes collapsed/empty targets and excludes source, hidden teams and blank space', () => {
  const layout = createOrganizationLayout(members, 4, { Media: { collapsed: true }, Medical: { hidden: true } }, memberTeams);
  const media = layout.teamAreas.find(area => area.team === 'Media');
  const point = { x: media.x + 10, y: media.y + 10 };
  assert.equal(findDropTeam(layout.teamAreas, point, 'Management'), 'Media');
  assert.equal(findDropTeam(layout.teamAreas, point, 'Media'), null);
  assert.equal(findDropTeam(layout.teamAreas, { x: -100, y: -100 }, 'Management'), null);
});

test('member-relative positions survive responsive layout and team scaling but do not follow membership transfers', () => {
  const layout = createOrganizationLayout(members, 3);
  const base = layout.positions['thu-le'];
  const saved = positionOverride(base, { x: base.x + 10, y: base.y + 20 });
  assert.deepEqual(saved, { team: 'Management', dx: 10, dy: 20 });
  const scaled = createOrganizationLayout(members, 2, { Management: { scale: 1.2 } });
  const resolved = resolvePositions(scaled, { 'thu-le': saved });
  assert.equal(resolved['thu-le'].x, scaled.positions['thu-le'].x + 12);
  assert.equal(resolved['thu-le'].y, scaled.positions['thu-le'].y + 24);
  const changed = members.map(member => member.id === 'thu-le' ? { ...member, team: 'Media' } : member);
  const newLayout = createOrganizationLayout(changed);
  assert.deepEqual(resolvePositions(newLayout, { 'thu-le': saved })['thu-le'], newLayout.positions['thu-le']);
});

test('scaled card bounds keep the complete card inside the canvas', () => {
  assert.deepEqual(movePosition({ x: 100, y: 200 }, -9999, -9999, 800, 900, 1.25), { x: 12, y: 12 });
  assert.deepEqual(movePosition({ x: 100, y: 200 }, 9999, 9999, 800, 900, 1.25), { x: 900 - NODE_WIDTH * 1.25 - 12, y: 800 - NODE_HEIGHT * 1.25 - 12 });
});

test('layout and team view persist independently of member data and reset safely', () => {
  const storage = memoryStorage();
  const offsets = { 'thu-le': { team: 'Management', dx: 10, dy: 25 } };
  const views = { Media: { hidden: true, collapsed: true, scale: 1.2 } };
  assert.equal(savePositions(offsets, storage), true);
  assert.equal(saveTeamViews(views, storage), true);
  assert.deepEqual(loadPositions(storage), offsets);
  assert.deepEqual(loadTeamViews(storage), views);
  assert.deepEqual([...storage.values.keys()].sort(), [LAYOUT_STORAGE_KEY, VIEW_STORAGE_KEY].sort());
  savePositions({}, storage); saveTeamViews({}, storage);
  assert.deepEqual(loadPositions(storage), {});
  assert.deepEqual(loadTeamViews(storage), {});
});

test('malformed offsets, legacy coordinates, invalid view scales and unavailable storage stay safe', () => {
  for (const json of ['{invalid', 'null', '[]']) {
    assert.deepEqual(loadPositions({ getItem: () => json }), {});
    assert.deepEqual(loadTeamViews({ getItem: () => json }), {});
  }
  assert.deepEqual(loadPositions({ getItem: () => JSON.stringify({ legacy: { x: 12, y: 30 }, bad: { team: 'Media', dx: '5', dy: 1 } }) }), {});
  assert.equal(getTeamView({ Media: { scale: 50 } }, 'Media').scale, 1.25);
  assert.equal(getTeamView({ Media: { scale: -2 } }, 'Media').scale, .75);
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.deepEqual(loadPositions(blocked), {});
  assert.equal(savePositions({}, blocked), false);
  assert.equal(saveTeamViews({}, null), false);
});

test('team transfer preserves avatar and personal fields and changes the shared employee record only', async () => {
  const storage = memoryStorage();
  saveMemberProfile('thu-le', { avatar: 'custom-photo', phone: '+84 123', dateOfBirth: '1990-01-01', team: 'Management' }, storage);
  const updated = await transferMemberTeam({ memberId: 'thu-le', targetTeam: 'Media' }, storage);
  assert.equal(updated.team, 'Media');
  assert.equal(updated.avatar, 'custom-photo');
  assert.equal(updated.phone, '+84 123');
  assert.equal(updated.dateOfBirth, '1990-01-01');
  assert.equal(updated.role, 'Operations Lead');
  assert.equal(updated.email, members.find(member => member.id === 'thu-le').email);
  assert.equal(applyMemberProfile(members.find(member => member.id === 'thu-le'), JSON.parse(storage.getItem('179fc-member-profiles-v1'))).team, 'Media');
  assert.equal(storage.values.has(LAYOUT_STORAGE_KEY), false);
});

test('empty teams remain valid destinations and invalid mutations leave data untouched', async () => {
  const storage = memoryStorage();
  for (const member of members.filter(member => member.team === 'Partnerships')) await transferMemberTeam({ memberId: member.id, targetTeam: 'Media' }, storage);
  assert.ok(memberTeams.includes('Partnerships'));
  await transferMemberTeam({ memberId: 'khanh-linh', targetTeam: 'Partnerships' }, storage);
  const before = storage.getItem('179fc-member-profiles-v1');
  await assert.rejects(transferMemberTeam({ memberId: 'missing', targetTeam: 'Media' }, storage), /no longer exists/);
  await assert.rejects(transferMemberTeam({ memberId: 'thu-le', targetTeam: 'not-a-team' }, storage), /available destination/);
  assert.equal(storage.getItem('179fc-member-profiles-v1'), before);
});

test('failed team writes reject without publishing a false member update', async () => {
  const previous = globalThis.window;
  let events = 0;
  globalThis.window = { dispatchEvent() { events++; } };
  try {
    const blocked = { getItem: () => null, setItem() { throw Error('quota'); } };
    await assert.rejects(transferMemberTeam({ memberId: 'thu-le', targetTeam: 'Media' }, blocked), /Unable to save/);
    assert.equal(events, 0);
    await assert.rejects(transferMemberTeam({ memberId: 'thu-le', targetTeam: 'Media' }, null), /Unable to save/);
    assert.equal(events, 0);
  } finally {
    if (previous === undefined) delete globalThis.window; else globalThis.window = previous;
  }
});
