export const NODE_WIDTH = 210;
export const NODE_HEIGHT = 108;
export const CANVAS_WIDTH = 1128;
export const TEAM_HEADER_HEIGHT = 82;
export const LAYOUT_STORAGE_KEY = '179fc-organization-layout-v2';
export const VIEW_STORAGE_KEY = '179fc-organization-view-v1';
const PADDING = 24;
const TEAM_PADDING = 20;
const GAP = 24;

export function groupMembers(members, teamNames = []) {
  const groups = new Map(teamNames.map(name => [name, []]));
  for (const member of members) {
    if (!groups.has(member.team)) groups.set(member.team, []);
    groups.get(member.team).push(member);
  }
  return [...groups].map(([name, items]) => ({ name, members: items }));
}

export function getTeamView(views, team) {
  const view = views[team] || {};
  return { hidden: view.hidden === true, collapsed: view.collapsed === true,
    scale: Number.isFinite(view.scale) ? Math.max(.75, Math.min(1.25, view.scale)) : 1 };
}

// Frames represent membership, including empty teams; no reporting hierarchy is inferred.
export function createOrganizationLayout(members, maxColumns = 4, views = {}, teamNames = []) {
  const groups = groupMembers(members, teamNames).filter(group => !getTeamView(views, group.name).hidden);
  const columns = Math.max(1, Math.min(maxColumns, groups.length || 1));
  const columnWidth = Math.max(250, ...groups.map(group => NODE_WIDTH * getTeamView(views, group.name).scale + TEAM_PADDING * 2));
  const width = PADDING * 2 + columns * columnWidth + (columns - 1) * GAP;
  const bottoms = Array(columns).fill(PADDING);
  const positions = {};
  const teamAreas = [];
  for (const group of groups) {
    const view = getTeamView(views, group.name);
    const column = bottoms.indexOf(Math.min(...bottoms));
    const x = PADDING + column * (columnWidth + GAP);
    const y = bottoms[column];
    const bodyHeight = view.collapsed || !group.members.length ? 46 : group.members.length * (NODE_HEIGHT * view.scale + 18) + 14;
    const area = { team: group.name, x, y, width: columnWidth, height: TEAM_HEADER_HEIGHT + bodyHeight, ...view, count: group.members.length };
    teamAreas.push(area);
    if (!view.collapsed) group.members.forEach((member, index) => {
      positions[member.id] = { x: x + TEAM_PADDING, y: y + TEAM_HEADER_HEIGHT + 14 + index * (NODE_HEIGHT * view.scale + 18), scale: view.scale, team: member.team };
    });
    bottoms[column] = y + area.height + GAP;
  }
  return { positions, teamAreas, width, height: Math.max(400, ...bottoms) };
}

function getStorage() {
  try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; }
}
function readObject(key, storage) {
  try {
    const saved = JSON.parse(storage?.getItem(key) || '{}');
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  } catch { return {}; }
}
export function loadPositions(storage = getStorage()) {
  return Object.fromEntries(Object.entries(readObject(LAYOUT_STORAGE_KEY, storage)).filter(([, point]) =>
    point && typeof point.team === 'string' && Number.isFinite(point.dx) && Number.isFinite(point.dy)
    && Math.abs(point.dx) <= 10000 && Math.abs(point.dy) <= 10000));
}
export function loadTeamViews(storage = getStorage()) {
  return Object.fromEntries(Object.entries(readObject(VIEW_STORAGE_KEY, storage))
    .filter(([, view]) => view && typeof view === 'object' && !Array.isArray(view))
    .map(([team, view]) => [team, getTeamView({ [team]: view }, team)]));
}
function saveObject(key, value, storage) {
  try { storage?.setItem(key, JSON.stringify(value)); return Boolean(storage); } catch { return false; }
}
export function savePositions(positions, storage = getStorage()) { return saveObject(LAYOUT_STORAGE_KEY, positions, storage); }
export function saveTeamViews(views, storage = getStorage()) { return saveObject(VIEW_STORAGE_KEY, views, storage); }

export function movePosition(point, dx, dy, height, width = CANVAS_WIDTH, scale = 1) {
  return { x: Math.max(12, Math.min(width - NODE_WIDTH * scale - 12, point.x + dx)),
    y: Math.max(12, Math.min(height - NODE_HEIGHT * scale - 12, point.y + dy)) };
}
export function resolvePositions(layout, overrides) {
  return Object.fromEntries(Object.entries(layout.positions).map(([id, point]) => {
    const saved = overrides[id];
    const offset = saved?.team === point.team ? saved : { dx: 0, dy: 0 };
    return [id, { ...point, ...movePosition(point, offset.dx * point.scale, offset.dy * point.scale, layout.height, layout.width, point.scale) }];
  }));
}
export function positionOverride(base, point) {
  return { team: base.team, dx: (point.x - base.x) / base.scale, dy: (point.y - base.y) / base.scale };
}
export function findDropTeam(areas, point, sourceTeam) {
  return areas.find(area => area.team !== sourceTeam && point.x >= area.x && point.x <= area.x + area.width
    && point.y >= area.y && point.y <= area.y + area.height)?.team || null;
}
