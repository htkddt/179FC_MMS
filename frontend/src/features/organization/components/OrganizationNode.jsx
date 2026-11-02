import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';

export function OrganizationNode({ member, position, index, dragging, selected, disabled, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onKeyDown, onOpenMenu }) {
  return <article className={'organization-node' + (dragging ? ' organization-node--dragging' : '') + (selected ? ' organization-node--selected' : '')}
    style={{ left: position.x, top: position.y, transform: `scale(${position.scale})`, '--node-delay': `${Math.min(index, 10) * 20}ms` }} data-member-id={member.id}>
    <button type="button" className="organization-node__move" aria-label={`${member.name}, ${member.role}, ${member.team}. Drag to move; use arrow keys to reposition.`}
      aria-describedby="organization-keyboard-help" disabled={disabled}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel} onLostPointerCapture={onPointerCancel}
      onKeyDown={onKeyDown}>
      <span className="organization-node__avatar"><Avatar initials={member.initials} image={member.avatar || undefined} tone={member.tone} size="lg" /><i className={member.availability === 'online' ? 'is-online' : ''} /></span>
      <span className="organization-node__identity"><strong>{member.name}</strong><span className="organization-node__role">{member.role}</span><span className="organization-node__team">{member.team}</span></span>
    </button>
    <button type="button" className="organization-node__menu" aria-label={`Options for ${member.name}`} aria-haspopup="menu" aria-expanded={selected}
      onClick={onOpenMenu} disabled={disabled}><Icon name="more" size={15} /></button>
  </article>;
}
