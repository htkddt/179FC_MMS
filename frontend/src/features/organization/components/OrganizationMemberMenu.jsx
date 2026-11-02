import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon.jsx';

export function OrganizationMemberMenu({ menu, teamNames, onClose, onViewTeam, onResetPosition, onMoveMember }) {
  const ref = useRef(null);
  const [choosingTeam, setChoosingTeam] = useState(false);
  const [position, setPosition] = useState({ x: menu.x, y: menu.y });

  useLayoutEffect(() => {
    const element = ref.current;
    const rect = element.getBoundingClientRect();
    setPosition({ x: Math.max(8, Math.min(menu.x, window.innerWidth - rect.width - 8)), y: Math.max(8, Math.min(menu.y, window.innerHeight - rect.height - 8)) });
    element.querySelector('[role="menuitem"]')?.focus({ preventScroll: true });
    const outside = event => { if (!element.contains(event.target)) onClose(); };
    const dismiss = () => onClose();
    // Ignore delayed scroll events from bringing the trigger into view before opening.
    const scrollPositions = new Map();
    for (let ancestor = menu.trigger; ancestor; ancestor = ancestor.parentElement) {
      scrollPositions.set(ancestor, { x: ancestor.scrollLeft, y: ancestor.scrollTop });
    }
    const scrollingElement = document.scrollingElement;
    scrollPositions.set(scrollingElement, { x: scrollingElement.scrollLeft, y: scrollingElement.scrollTop });
    const scrolled = event => {
      if (element.contains(event.target)) return;
      const target = event.target === document ? scrollingElement : event.target;
      const before = scrollPositions.get(target);
      if (!before || target.scrollLeft !== before.x || target.scrollTop !== before.y) onClose();
    };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', dismiss);
    window.addEventListener('scroll', scrolled, true);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', dismiss);
      window.removeEventListener('scroll', scrolled, true);
    };
  }, [menu, onClose, choosingTeam]);

  function keyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (choosingTeam) setChoosingTeam(false); else onClose(true);
      return;
    }
    if (event.key === 'Tab') { onClose(); return; }
    const items = [...ref.current.querySelectorAll('[role="menuitem"]')];
    const index = items.indexOf(document.activeElement);
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % items.length;
    if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = items.length - 1;
    if (next !== undefined) { event.preventDefault(); items[next].focus(); }
  }

  return createPortal(<div ref={ref} className="organization-context-menu" role="menu" aria-label={choosingTeam ? `Move ${menu.member.name} to team` : `Options for ${menu.member.name}`}
    style={{ left: position.x, top: position.y }} onKeyDown={keyDown}>
    <div className="organization-context-menu__member"><strong>{menu.member.name}</strong><span>{choosingTeam ? 'Choose destination team' : menu.member.role}</span></div>
    {choosingTeam ? <>
      <button role="menuitem" type="button" onClick={() => setChoosingTeam(false)}><Icon name="chevronDown" size={16} />Back</button>
      {teamNames.filter(team => team !== menu.member.team).map(team => <button role="menuitem" type="button" key={team} onClick={() => { onClose(true); onMoveMember(menu.member, team); }}><Icon name="users" size={16} />{team}</button>)}
    </> : <>
      <Link role="menuitem" to={`/employees/${menu.member.id}`} onClick={() => onClose()}><Icon name="employees" size={17} />Profile<Icon name="arrow" size={14} /></Link>
      <button role="menuitem" type="button" onClick={() => { onViewTeam(menu.member.team); onClose(true); }}><Icon name="users" size={17} />View team</button>
      <button role="menuitem" type="button" onClick={() => setChoosingTeam(true)}><Icon name="organization" size={17} />Move to team<Icon name="arrow" size={14} /></button>
      <div className="organization-context-menu__divider" role="separator" />
      <button role="menuitem" type="button" onClick={() => { onResetPosition(menu.member.id); onClose(true); }}><Icon name="reset" size={17} />Reset position</button>
    </>}
  </div>, document.body);
}
