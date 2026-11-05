import { useState } from 'react';
import { Card } from '../../../components/ui/Card.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { SessionDetails } from './SessionDetails.jsx';
import { useSavedSettings } from '../../settings/SettingsProvider.jsx';
import { eventDateParts, eventInstant } from '../../shared/dateFormat.js';

const emptyEvent = { title: '', date: '', time: '', location: '', address: '', imageUrl: '' };

export function UpcomingPanel({ events, onAddEvent }) {
  const { settings } = useSavedSettings();
  const [adding, setAdding] = useState(false);
  const [event, setEvent] = useState(emptyEvent);
  function update(field, value) { setEvent(current => ({ ...current, [field]: value })); }
  function submit(e) {
    e.preventDefault();
    const title = event.title.trim();
    const location = event.location.trim();
    if (!title || !location || !event.date || !event.time) return;
    onAddEvent({ ...event, title, location, address: event.address.trim(), imageUrl: event.imageUrl.trim() });
    setEvent(emptyEvent);
    setAdding(false);
  }
  function cancel() { setAdding(false); setEvent(emptyEvent); }

  return (
    <Card className="upcoming-panel" aria-labelledby="upcoming-title">
      <div className="dashboard-section-heading"><h2 id="upcoming-title">Upcoming</h2><button className="button dashboard-add-button" type="button" aria-expanded={adding} aria-controls="upcoming-form" onClick={() => setAdding(value => !value)}><Icon name="plus" size={15} /> Add session</button></div>
      {adding && <form id="upcoming-form" className="dashboard-form dashboard-form--upcoming" onSubmit={submit}>
        <label htmlFor="event-title">Session name</label><input id="event-title" value={event.title} onChange={e => update('title', e.target.value)} maxLength={100} required />
        <label htmlFor="event-date">Date</label><input id="event-date" type="date" value={event.date} onChange={e => update('date', e.target.value)} required />
        <label htmlFor="event-time">Time (Ho Chi Minh City, GMT+07:00)</label><input id="event-time" type="time" value={event.time} onChange={e => update('time', e.target.value)} required />
        <label htmlFor="event-location">Location or venue</label><input id="event-location" value={event.location} onChange={e => update('location', e.target.value)} maxLength={100} required />
        <label htmlFor="event-address">Address <span className="dashboard-form__optional">(optional)</span></label><input id="event-address" value={event.address} onChange={e => update('address', e.target.value)} maxLength={200} placeholder="Street, city" aria-describedby="event-address-hint" /><small id="event-address-hint" className="dashboard-form__hint">Adding an address creates a Google Maps link.</small>
        <label htmlFor="event-image">Image URL <span className="dashboard-form__optional">(optional)</span></label><input id="event-image" type="url" pattern="https?://.+" value={event.imageUrl} onChange={e => update('imageUrl', e.target.value)} placeholder="https://example.com/pitch.jpg" />
        <div className="dashboard-form__actions"><button className="button" type="button" onClick={cancel}>Cancel</button><button className="button button--primary" type="submit" disabled={!event.title.trim() || !event.location.trim() || !event.date || !event.time}>Add</button></div>
      </form>}
      <div className="upcoming-list">{events.map(item => {
        const date = eventDateParts(item, settings);
        return <article className="upcoming-event" key={item.id}><time className="upcoming-event__date" dateTime={eventInstant(item)} aria-label={date.label}><span>{date.month}</span>{date.day}</time><SessionDetails event={item} compact /></article>;
      })}</div>
    </Card>
  );
}
