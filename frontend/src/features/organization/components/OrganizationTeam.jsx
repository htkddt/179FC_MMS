import { Icon } from '../../../components/ui/Icon.jsx';

export function OrganizationTeam({ area, total, dropTarget, onChange, onExpand }) {
  return <section className={'organization-team-frame' + (dropTarget ? ' organization-team-frame--drop-target' : '') + (area.collapsed ? ' organization-team-frame--collapsed' : '')}
    data-team={area.team} aria-label={`${area.team} team chart`} style={{ left: area.x, top: area.y, width: area.width, height: area.height }}>
    <header className="organization-team-header">
      <div className="organization-team-header__title"><h3>{area.team}</h3><span>{total}</span></div>
      <div className="organization-team-header__controls">
        <button type="button" aria-label={`Zoom out ${area.team} team`} disabled={area.scale <= .75} onClick={() => onChange({ scale: Math.max(.75, area.scale - .1) })}><Icon name="minus" size={14} /></button>
        <span aria-label={`${area.team} size`}>{Math.round(area.scale * 100)}%</span>
        <button type="button" aria-label={`Zoom in ${area.team} team`} disabled={area.scale >= 1.25} onClick={() => onChange({ scale: Math.min(1.25, area.scale + .1) })}><Icon name="plus" size={14} /></button>
        <button type="button" aria-label={`${area.collapsed ? 'Show' : 'Collapse'} ${area.team} members`} aria-expanded={!area.collapsed} onClick={() => onChange({ collapsed: !area.collapsed })}><Icon name="chevronDown" size={15} className={area.collapsed ? 'is-collapsed' : ''} /></button>
        <button type="button" aria-label={`Expand ${area.team} team chart`} onClick={onExpand}><Icon name="expand" size={14} /></button>
        <button type="button" aria-label={`Hide ${area.team} team`} onClick={() => onChange({ hidden: true })}><Icon name="eyeOff" size={14} /></button>
      </div>
    </header>
    {(area.collapsed || !area.count || dropTarget) && <p className={'organization-team-frame__hint' + (dropTarget ? ' organization-team-frame__hint--drop' : '')}>{dropTarget ? 'Drop to move here' : area.collapsed ? `${area.count} members collapsed` : 'Drop a member here'}</p>}
  </section>;
}
