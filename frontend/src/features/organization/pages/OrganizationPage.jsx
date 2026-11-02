import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '../../../components/ui/Icon.jsx';
import { EmptyState } from '../../../components/ui/states/EmptyState.jsx';
import { memberTeams, transferMemberTeam } from '../../employees/api/membersApi.js';
import { useMembers } from '../../employees/useMembers.js';
import { OrganizationChart } from '../components/OrganizationChart.jsx';
import { getTeamView, groupMembers, loadTeamViews, saveTeamViews } from '../organizationLayout.js';

export function OrganizationPage() {
  const members = useMembers();
  const [query, setQuery] = useState('');
  const [team, setTeam] = useState('');
  const [teamViews, setTeamViews] = useState(loadTeamViews);
  const [expanded, setExpanded] = useState(false);
  const [viewNotice, setViewNotice] = useState('');
  const teams = useMemo(() => groupMembers(members, memberTeams), [members]);
  const visibleMembers = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return members.filter(member => (!team || member.team === team)
      && [member.name, member.role, member.team, member.email].join(' ').toLocaleLowerCase().includes(search));
  }, [members, query, team]);
  const chartTeams = team ? [team] : query.trim() ? [...new Set(visibleMembers.map(member => member.team))] : teams.map(group => group.name);

  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = event => { if (event.key === 'Escape' && !event.defaultPrevented) setExpanded(false); };
    window.addEventListener('keydown', escape);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', escape); };
  }, [expanded]);

  const changeTeamView = useCallback((name, patch) => {
    setTeamViews(current => {
      const next = name ? { ...current, [name]: { ...getTeamView(current, name), ...patch } } : {};
      return next;
    });
  }, []);
  useEffect(() => {
    setViewNotice(saveTeamViews(teamViews) ? '' : 'Team display changes are kept for this visit. Browser storage is unavailable.');
  }, [teamViews]);
  const viewTeam = useCallback(name => { setQuery(''); setTeam(name); }, []);
  const moveMember = useCallback((memberId, targetTeam) => transferMemberTeam({ memberId, targetTeam }), []);
  function expandTeam(name) { viewTeam(name); setExpanded(true); }

  return <section className="organization-page" aria-label="Organization workspace">
    <div className="organization-toolbar">
      <label className="organization-search"><Icon name="search" size={19} /><input type="search" aria-label="Search organization members" placeholder="Search members..." value={query} onChange={event => setQuery(event.target.value)} /></label>
      <label className="organization-team-filter"><span className="sr-only">Filter by team</span><select value={team} onChange={event => setTeam(event.target.value)}><option value="">All teams</option>{teams.map(group => <option key={group.name} value={group.name}>{group.name}</option>)}</select></label>
    </div>
    <div className="organization-layout">
      <section className={'organization-board' + (expanded ? ' organization-board--expanded' : '')} aria-labelledby="organization-chart-title">
        <header className="organization-board__heading"><h2 id="organization-chart-title">{expanded && team ? team : 'Team structure'}</h2><span role="status">{visibleMembers.length} of {members.length} members</span></header>
        {visibleMembers.length || !query.trim() ? <OrganizationChart members={members} visibleMembers={visibleMembers} teamNames={chartTeams} allTeamNames={teams.map(group => group.name)} teamViews={teamViews}
          onTeamViewChange={changeTeamView} onViewTeam={viewTeam} onExpandTeam={expandTeam} onMoveMember={moveMember}
          expanded={expanded} onToggleExpanded={() => setExpanded(current => !current)} filtered={Boolean(team || query.trim())} />
          : <div className="organization-empty"><EmptyState title="No members found" message="Try another name, role, team, or email address." /><button className="button button--outline" onClick={() => viewTeam('')}>Clear filters</button></div>}
      </section>
      <aside className="organization-sidebar" aria-label="Organization summary">
        <section className="organization-summary"><h2>Organization overview</h2><dl>{[
          { label: 'Members', value: members.length, icon: 'users' },
          { label: 'Teams', value: teams.length, icon: 'organization' },
          { label: 'Online', value: members.filter(member => member.availability === 'online').length, icon: 'chart' },
        ].map(stat => <div key={stat.label}><span className="organization-summary__icon"><Icon name={stat.icon} size={25} /></span><div><dd>{stat.value}</dd><dt>{stat.label}</dt></div></div>)}</dl></section>
        <section className="organization-teams"><div className="organization-teams__heading"><h2>Teams</h2>{team && <button type="button" onClick={() => viewTeam('')}>Show all</button>}</div><ul>{teams.map((group, index) => {
          const hidden = getTeamView(teamViews, group.name).hidden;
          return <li key={group.name}><button type="button" className="organization-teams__filter" aria-pressed={team === group.name} onClick={() => { setQuery(''); setTeam(current => current === group.name ? '' : group.name); }}><span className={'organization-teams__avatar organization-teams__avatar--' + index % 4}>{group.name.split(/\s+/).map(word => word[0]).join('').slice(0, 2)}</span><strong>{group.name}</strong><span>{group.members.length}</span></button><button className="organization-teams__visibility" type="button" aria-label={`${hidden ? 'Show' : 'Hide'} ${group.name} in chart`} aria-pressed={!hidden} onClick={() => changeTeamView(group.name, { hidden: !hidden })}><Icon name={hidden ? 'eyeOff' : 'eye'} size={16} /></button></li>;
        })}</ul></section>
        {viewNotice && <p className="organization-view-notice" role="status">{viewNotice}</p>}
      </aside>
    </div>
  </section>;
}
