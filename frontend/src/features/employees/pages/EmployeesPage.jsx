import { useMemo, useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { EmptyState } from '../../../components/ui/states/EmptyState.jsx';
import { EmployeeGrid } from '../components/EmployeeGrid.jsx';
import { MemberSearch } from '../components/MemberSearch.jsx';
import { useMembers } from '../useMembers.js';
import { memberTeams } from '../api/membersApi.js';

const memberCollator = new Intl.Collator('en', { sensitivity: 'base' });

function sortMembers(items, sortBy) {
  return [...items].sort((first, second) => {
    const byName = memberCollator.compare(first.name, second.name);
    if (sortBy === 'name-desc') return memberCollator.compare(second.name, first.name);
    if (sortBy === 'team') return memberCollator.compare(first.team, second.team) || byName;
    if (sortBy === 'newest') return Date.parse(second.joined) - Date.parse(first.joined) || byName;
    return byName;
  });
}

export function EmployeesPage() {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [notice, setNotice] = useState('');
  const directoryMembers = useMembers();
  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return directoryMembers;
    return directoryMembers.filter((member) => [member.name, member.role, member.team, member.email].join(' ').toLocaleLowerCase().includes(normalizedQuery));
  }, [directoryMembers, query]);
  const displayedMembers = useMemo(() => sortMembers(filteredMembers, sortBy), [filteredMembers, sortBy]);
  const memberStats = useMemo(() => [
    { label: 'Total', value: directoryMembers.length, tone: 'total' },
    { label: 'Online', value: directoryMembers.filter((member) => member.availability === 'online').length, tone: 'online' },
    { label: 'Offline', value: directoryMembers.filter((member) => member.availability === 'offline').length, tone: 'offline' },
    { label: 'Teams', value: memberTeams.length, tone: 'teams' },
  ], [directoryMembers]);

  return <section className="employees-page">
    <header className="employees-hero" aria-label="Member statistics"><div className="member-stats">{memberStats.map((stat) => <div className={'member-stat member-stat--' + stat.tone} key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div></header>
    <div className="employees-toolbar">
      <MemberSearch value={query} onChange={setQuery} />
      <Button icon="plus" className="button--primary employee-add" onClick={() => setNotice('Member creation is ready to connect when the API contract is available.')}>Add member</Button>
    </div>
    {notice ? <p className="inline-notice" role="status">{notice}</p> : null}
    <div className="members-results" aria-live="polite"><div><span className="members-results__eyebrow">MEMBER DIRECTORY</span><h3>{query ? 'Matching members' : 'All members'}</h3></div><div className="members-results__actions"><span className="members-results__count">{filteredMembers.length} of {directoryMembers.length} members</span><label className="member-sort"><span>Sort by</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort members"><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option><option value="team">Team</option><option value="newest">Recently joined</option></select></label></div></div>
    {displayedMembers.length ? <EmployeeGrid members={displayedMembers} /> : <EmptyState title="No members found" message="Try another name, role, team, or email address." />}
  </section>;
}
