import test from 'node:test';
import assert from 'node:assert/strict';
import { initialSettings } from '../../frontend/src/mocks/settings.js';
import { getSettings, readSettingsSnapshot, saveSettingsSnapshot, settingsStorageKey } from '../../frontend/src/features/settings/api/settingsApi.js';
import { eventDateParts, formatTimestamp } from '../../frontend/src/features/shared/dateFormat.js';

function storageFixture(initial = null) {
  let raw = initial;
  return { getItem: () => raw, setItem: (key, value) => { assert.equal(key, settingsStorageKey); raw = value; } };
}

test('settings use defaults only for missing storage and reject malformed or unreadable snapshots', () => {
  assert.deepEqual(readSettingsSnapshot(storageFixture()).settings, initialSettings);
  for (const raw of ['null', '[]', 'false', '{broken', '{"summary":"yes"}', '{"timeZone":"invalid"}']) {
    assert.throws(() => readSettingsSnapshot(storageFixture(raw)), /Could not load/);
  }
  assert.throws(() => readSettingsSnapshot({ getItem() { throw new Error('denied'); } }), /Could not load/);
});

test('settings trim patches, preserve legacy choices and unrelated keys, and reject stale writers', async () => {
  const storage = storageFixture(JSON.stringify({ ...initialSettings, language: 'Vietnamese', twoFactor: true, futureKey: { id: 'synthetic' } }));
  globalThis.localStorage = storage;
  let events = 0;
  globalThis.window = { dispatchEvent() { events++; } };
  try {
    const first = readSettingsSnapshot();
    const result = await saveSettingsSnapshot({ clubName: '  Sample Club  ', compactNavigation: true }, { expectedRevision: first.revision });
    assert.equal(result.settings.clubName, 'Sample Club');
    assert.equal(result.settings.language, 'Vietnamese');
    assert.equal(result.settings.twoFactor, true);
    assert.deepEqual(result.settings.futureKey, { id: 'synthetic' });
    assert.equal(events, 1);
    await assert.rejects(saveSettingsSnapshot({ clubName: 'Stale draft' }, { expectedRevision: first.revision }), { code: 'SETTINGS_CONFLICT' });
    assert.equal((await getSettings()).clubName, 'Sample Club');
    assert.equal(events, 1);
  } finally { delete globalThis.localStorage; delete globalThis.window; }
});

test('unavailable settings and invalid types never persist or publish success', async () => {
  globalThis.localStorage = storageFixture();
  let events = 0;
  globalThis.window = { dispatchEvent() { events++; } };
  try {
    for (const changes of [{ clubName: ' ' }, { clubName: 'a'.repeat(81) }, { clubName: 9 }, { language: 'Vietnamese' }, { timeZone: 'Mars' }, { compactNavigation: 'true' }, { assistant: false }, { summary: true }, { twoFactor: false }]) {
      await assert.rejects(saveSettingsSnapshot(changes));
    }
    assert.equal(events, 0);
    assert.equal(readSettingsSnapshot().revision, null);
    globalThis.localStorage.setItem = () => { throw new Error('quota'); };
    await assert.rejects(saveSettingsSnapshot({ clubName: 'Sample Club' }), /Could not save/);
    assert.equal(readSettingsSnapshot().settings.clubName, initialSettings.clubName);
    assert.equal(events, 0);
  } finally { delete globalThis.localStorage; delete globalThis.window; }
});

test('shared dates convert instants and club wall-clock events without shifting date-only data', () => {
  const utc = { ...initialSettings, timeZone: 'UTC' };
  assert.match(formatTimestamp('2026-11-03T02:00:00Z'), /09:00/);
  assert.match(formatTimestamp('2026-11-03T02:00:00Z', utc), /02:00/);
  assert.match(formatTimestamp('2026-11-03T09:00:00', utc), /02:00/);
  assert.equal(formatTimestamp('2026-11-03', utc), formatTimestamp('2026-11-03'));
  assert.equal(formatTimestamp('bad timestamp', utc), 'Date unavailable');
  assert.equal(formatTimestamp(null, utc), 'Date unavailable');
  const event = { date: '2026-11-03', time: '02:00' };
  assert.equal(eventDateParts(event, utc).day, '2');
  assert.equal(eventDateParts(event, initialSettings).day, '3');
  assert.deepEqual(event, { date: '2026-11-03', time: '02:00' });
});
