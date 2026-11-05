import { useEffect, useRef } from 'react';
import { Button } from '../../../components/ui/Button.jsx';

export function DiscardDialog({ open, onKeep, onDiscard }) {
  const dialog = useRef(null);
  const keep = useRef(null);
  useEffect(() => {
    if (!open) return;
    const node = dialog.current;
    const trigger = document.activeElement;
    node.showModal();
    keep.current?.focus();
    return () => {
      node.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, [open]);
  return <dialog ref={dialog} className="settings-dialog" aria-labelledby="discard-title" aria-describedby="discard-copy" onCancel={event => { event.preventDefault(); onKeep(); }}>
    <h2 id="discard-title">Discard unsaved changes?</h2>
    <p id="discard-copy">Your changes have not been saved. Stay to continue editing or discard them to leave.</p>
    <div><button ref={keep} className="button button--outline" onClick={onKeep}>Keep editing</button><Button className="button--primary" onClick={onDiscard}>Discard changes</Button></div>
  </dialog>;
}
