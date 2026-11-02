import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../../components/ui/Icon.jsx';
import { CANVAS_WIDTH, NODE_HEIGHT, NODE_WIDTH, TEAM_HEADER_HEIGHT, createOrganizationLayout, findDropTeam, getTeamView, loadPositions, movePosition, positionOverride, resolvePositions, savePositions } from '../organizationLayout.js';
import { OrganizationMemberMenu } from './OrganizationMemberMenu.jsx';
import { OrganizationNode } from './OrganizationNode.jsx';
import { OrganizationTeam } from './OrganizationTeam.jsx';

export function OrganizationChart({ members, visibleMembers, teamNames, allTeamNames, teamViews, onTeamViewChange, onViewTeam, onExpandTeam, onMoveMember, expanded, onToggleExpanded, filtered }) {
  const [viewportWidth, setViewportWidth] = useState(CANVAS_WIDTH);
  const largestTeamWidth = Math.max(250, ...teamNames.map(team => NODE_WIDTH * getTeamView(teamViews, team).scale + 40));
  const columns = Math.max(1, Math.min(4, Math.floor((viewportWidth - 24) / (largestTeamWidth + 24))));
  const layout = useMemo(() => createOrganizationLayout(visibleMembers, columns, teamViews, teamNames), [visibleMembers, columns, teamViews, teamNames]);
  const [overrides, setOverrides] = useState(loadPositions);
  const [dragging, setDragging] = useState(null);
  const [preview, setPreview] = useState(null);
  const [pendingMember, setPendingMember] = useState(null);
  const [revealMember, setRevealMember] = useState(null);
  const [menu, setMenu] = useState(null);
  const [manualZoom, setManualZoom] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const viewport = useRef(null);
  const canvas = useRef(null);
  const drag = useRef(null);
  const mutationPending = useRef(false);
  const menuTrigger = useRef(null);
  const positionsRef = useRef(overrides);
  const positions = resolvePositions(layout, overrides);
  if (dragging && preview) positions[dragging.id] = preview;
  const fitZoom = Math.max(.45, Math.min(1, (viewportWidth - 24) / layout.width));
  const zoom = manualZoom ?? fitZoom;
  const hiddenTeams = teamNames.filter(team => getTeamView(teamViews, team).hidden);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setViewportWidth(entry.contentRect.width));
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!revealMember || !positions[revealMember]) return;
    const point = positions[revealMember];
    viewport.current.scrollTo({ left: Math.max(0, point.x * zoom - 24), top: Math.max(0, point.y * zoom - 100) });
    setRevealMember(null);
  }, [revealMember, positions, zoom]);

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenu(null);
    if (restoreFocus) menuTrigger.current?.focus({ preventScroll: true });
  }, []);

  function commit(next, message = '') {
    positionsRef.current = next;
    setOverrides(next);
    const saved = savePositions(next);
    setNotice(saved ? message : 'Layout updated for this visit. Browser storage is unavailable.');
  }

  function openMenu(event, member) {
    if (drag.current || mutationPending.current) return;
    menuTrigger.current = event.currentTarget;
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({ member, x: rect.right, y: rect.bottom, trigger: event.currentTarget });
  }

  async function transfer(member, targetTeam) {
    if (mutationPending.current || targetTeam === member.team) return;
    mutationPending.current = true;
    setPendingMember(member.id);
    setError('');
    setNotice(`Moving ${member.name} to ${targetTeam}...`);
    try {
      const updated = await onMoveMember(member.id, targetTeam);
      const next = { ...positionsRef.current };
      delete next[member.id];
      commit(next, `${updated.name} moved from ${member.team} to ${updated.team}.`);
      onTeamViewChange(targetTeam, { hidden: false, collapsed: false });
      onViewTeam('');
      setRevealMember(updated.id);
    } catch (failure) {
      setNotice('');
      setError(failure instanceof Error ? failure.message : 'Unable to move this member. Please try again.');
    } finally {
      mutationPending.current = false;
      setPendingMember(null);
    }
  }

  function startDrag(event, member) {
    if (event.button !== 0 || !event.isPrimary || mutationPending.current) return;
    closeMenu();
    setError('');
    const element = event.currentTarget;
    element.focus({ preventScroll: true });
    element.setPointerCapture(event.pointerId);
    drag.current = { member, pointerId: event.pointerId, x: event.clientX, y: event.clientY,
      scrollLeft: viewport.current.scrollLeft, scrollTop: viewport.current.scrollTop,
      start: positions[member.id], base: layout.positions[member.id], zoom, moved: false, point: positions[member.id] };
    setDragging({ id: member.id, targetTeam: null });
    setPreview(positions[member.id]);
  }

  function pointerTeam(event, active) {
    const rect = canvas.current.getBoundingClientRect();
    return findDropTeam(layout.teamAreas, { x: (event.clientX - rect.left) / active.zoom, y: (event.clientY - rect.top) / active.zoom }, active.member.team);
  }

  function moveDrag(event) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const rect = viewport.current.getBoundingClientRect();
    if (event.clientY > rect.bottom - 28) viewport.current.scrollTop += 16;
    if (event.clientY < rect.top + 28) viewport.current.scrollTop -= 16;
    if (event.clientX > rect.right - 28) viewport.current.scrollLeft += 16;
    if (event.clientX < rect.left + 28) viewport.current.scrollLeft -= 16;
    const dx = (event.clientX - active.x + viewport.current.scrollLeft - active.scrollLeft) / active.zoom;
    const dy = (event.clientY - active.y + viewport.current.scrollTop - active.scrollTop) / active.zoom;
    active.moved ||= Math.hypot(event.clientX - active.x, event.clientY - active.y) > 4;
    active.point = { ...active.start, ...movePosition(active.start, dx, dy, layout.height, layout.width, active.start.scale) };
    setPreview(active.point);
    setDragging({ id: active.member.id, targetTeam: active.moved ? pointerTeam(event, active) : null });
  }

  function finishDrag(event, cancel = false) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const targetTeam = !cancel && active.moved ? pointerTeam(event, active) : null;
    drag.current = null;
    setDragging(null);
    setPreview(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (cancel) { setNotice('Move canceled.'); return; }
    if (targetTeam) { transfer(active.member, targetTeam); return; }
    if (active.moved) commit({ ...positionsRef.current, [active.member.id]: positionOverride(active.base, active.point) }, 'Position saved.');
  }

  function nodeKeyDown(event, member) {
    if (drag.current) {
      if (event.key === 'Escape') { event.preventDefault(); finishDrag({ pointerId: drag.current.pointerId, currentTarget: event.currentTarget }, true); }
      return;
    }
    const step = event.shiftKey ? 40 : 10;
    const deltas = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (!deltas[event.key] || mutationPending.current) return;
    event.preventDefault();
    const [dx, dy] = deltas[event.key];
    const next = movePosition(positions[member.id], dx, dy, layout.height, layout.width, positions[member.id].scale);
    commit({ ...positionsRef.current, [member.id]: positionOverride(layout.positions[member.id], next) }, `Position saved for ${member.name}.`);
  }

  function resetPosition(id) {
    const next = { ...positionsRef.current };
    delete next[id];
    commit(next, 'Position reset.');
  }

  return <>
    <div className="organization-chart-controls">
      <div>{filtered && <button type="button" onClick={() => onViewTeam('')}>All teams</button>}</div>
      <div><button type="button" aria-label="Zoom out" disabled={zoom <= .45 || Boolean(dragging)} onClick={() => setManualZoom(Math.max(.45, zoom - .1))}><Icon name="minus" size={15} /></button><button type="button" aria-label="Fit chart to width" onClick={() => setManualZoom(null)}>{Math.round(zoom * 100)}%</button><button type="button" aria-label="Zoom in" disabled={zoom >= 1.4 || Boolean(dragging)} onClick={() => setManualZoom(Math.min(1.4, zoom + .1))}><Icon name="plus" size={15} /></button><span className="organization-chart-controls__divider" />
        <button type="button" className="organization-chart-controls__reset" onClick={() => { commit({}, 'Layout and team view reset.'); onTeamViewChange(null); setManualZoom(null); }}><Icon name="reset" size={15} />Reset layout</button>
        <button type="button" aria-label={expanded ? 'Exit expanded chart' : 'Expand chart'} aria-pressed={expanded} onClick={onToggleExpanded}><Icon name={expanded ? 'collapse' : 'expand'} size={16} /></button>
      </div>
    </div>
    {hiddenTeams.length > 0 && <div className="organization-hidden-teams" aria-label="Hidden teams">{hiddenTeams.map(team => <button type="button" key={team} onClick={() => onTeamViewChange(team, { hidden: false })}><Icon name="eye" size={14} />Show {team}</button>)}</div>}
    <p id="organization-keyboard-help" className="sr-only">Drag to arrange a member. Drop on another team to change membership. Use the three-dot options button for Profile or Move to team. Arrow keys move a focused member; Shift makes larger steps. Escape cancels dragging.</p>
    <div ref={viewport} className={'organization-chart-scroll' + (dragging ? ' organization-chart-scroll--dragging' : '')} tabIndex={0} aria-label="Scrollable member chart" aria-busy={Boolean(pendingMember)}>
      <div className="organization-canvas-size" style={{ width: layout.width * zoom, height: layout.height * zoom }}>
        <div ref={canvas} className="organization-canvas" style={{ width: layout.width, height: layout.height, transform: `scale(${zoom})` }}>
          {layout.teamAreas.map(area => <OrganizationTeam key={area.team} area={area} total={members.filter(member => member.team === area.team).length} dropTarget={dragging?.targetTeam === area.team} onChange={patch => onTeamViewChange(area.team, patch)} onExpand={() => onExpandTeam(area.team)} />)}
          <svg className="organization-connections" width={layout.width} height={layout.height} aria-hidden="true">
            {layout.teamAreas.filter(area => !area.collapsed).map(area => <g key={area.team}>{visibleMembers.filter(member => member.team === area.team && positions[member.id]).map(member => {
              const point = positions[member.id];
              return <path key={member.id} d={`M ${area.x + 10} ${area.y + TEAM_HEADER_HEIGHT + 8} V ${point.y + NODE_HEIGHT * point.scale / 2} H ${point.x}`} />;
            })}</g>)}
          </svg>
          {visibleMembers.filter(member => positions[member.id]).map((member, index) => <OrganizationNode key={member.id} member={member} position={positions[member.id]} index={index} dragging={dragging?.id === member.id} selected={menu?.member.id === member.id} disabled={Boolean(pendingMember)}
            onPointerDown={event => startDrag(event, member)} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={event => finishDrag(event, true)}
            onKeyDown={event => nodeKeyDown(event, member)} onOpenMenu={event => openMenu(event, member)} />)}
          {!layout.teamAreas.length && <p className="organization-canvas__empty">All teams are hidden. Use Show above to restore a team.</p>}
        </div>
      </div>
    </div>
    <footer className="organization-board__footer"><span>Drag to arrange or move between teams <span aria-hidden="true">·</span> More actions in <Icon name="more" size={14} /></span><span role={error ? 'alert' : 'status'} aria-live="polite">{error || notice}</span></footer>
    {menu && <OrganizationMemberMenu menu={menu} teamNames={allTeamNames} onClose={closeMenu} onViewTeam={onViewTeam} onResetPosition={resetPosition} onMoveMember={transfer} />}
  </>;
}
