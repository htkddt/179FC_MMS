import { useRef } from 'react';

export function Tabs({ items, value, onChange, label, className = '', disabled = false }) {
  const refs = useRef({});
  function keyDown(event, index) {
    if (disabled) return;
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % items.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = items.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    onChange(items[next].value);
    refs.current[items[next].value]?.focus();
  }
  return <div className={'settings-tabs ' + className} role="tablist" aria-label={label}>{items.map((item, index) => <button key={item.value} ref={el => { refs.current[item.value] = el; }} id={'tab-' + item.value} type="button" role="tab" disabled={disabled} aria-selected={value === item.value} aria-controls={'panel-' + item.value} tabIndex={value === item.value ? 0 : -1} className={'settings-tabs__item' + (value === item.value ? ' settings-tabs__item--active' : '')} onClick={() => onChange(item.value)} onKeyDown={event => keyDown(event, index)}>{item.label}</button>)}</div>;
}
