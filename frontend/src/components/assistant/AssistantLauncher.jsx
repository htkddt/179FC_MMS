import { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { sendAssistantMessage } from './assistantApi.js';

export function AssistantLauncher() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Hi Kiet! What do you need help with?' }]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const input = useRef(null);
  const launcher = useRef(null);
  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  function close() { setOpen(false); launcher.current?.focus(); }
  function toggle() { if (open) close(); else setOpen(true); }
  async function submit(event) { event.preventDefault(); const text = question.trim(); if (!text || sending) return; setMessages(current => [...current, { role: 'user', text }]); setQuestion(''); setSending(true); setError(''); try { const reply = await sendAssistantMessage(text); setMessages(current => [...current, { role: 'assistant', text: reply }]); } catch { setError('Unable to get a reply. Please try again.'); setQuestion(text); } finally { setSending(false); } }
  return <aside className="assistant" aria-label="179 Assist">{open && <section className="assistant-panel" aria-label="Conversation with 179 Assist" onKeyDown={event => { if (event.key === 'Escape') close(); }}><header><span className="assistant-panel__title"><Icon name="sparkle" size={21} /><span><strong>179 Assist</strong><small>Online ? Replies instantly</small></span></span><button aria-label="Close assistant" onClick={close}><Icon name="close" size={16} /></button></header><div className="assistant-panel__messages" aria-live="polite">{messages.map((message, index) => <p key={index} className={message.role === 'user' ? 'assistant-panel__user' : ''}><span className="sr-only">{message.role === 'user' ? 'You: ' : 'Assistant: '}</span>{message.text}</p>)}{sending && <p role="status">179 Assist is replying?</p>}{error && <p role="alert">{error}</p>}<button type="button" className="assistant-suggestion" onClick={() => { setQuestion('How do I publish a post?'); input.current?.focus(); }}>How do I publish a post?</button></div><form onSubmit={submit}><input ref={input} value={question} onChange={event => setQuestion(event.target.value)} placeholder="Ask about the portal..." aria-label="Ask 179 Assist" /><button aria-label="Send question" type="submit" disabled={sending}><Icon name="send" size={16} /></button></form></section>}<div className="assistant-launcher"><button ref={launcher} className="assistant-launcher__orb" aria-label={open ? "Close 179 Assist" : "Open 179 Assist"} aria-expanded={open} onClick={toggle}><Icon name="sparkle" size={25} /></button></div></aside>;
}
