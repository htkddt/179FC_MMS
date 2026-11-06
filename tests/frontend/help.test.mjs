import test from 'node:test';
import assert from 'node:assert/strict';
import { articles, guides } from '../../frontend/src/mocks/help.js';
import { filterHelpContent, normalizeHelpQuery } from '../../frontend/src/features/help/helpFilters.js';

test('help filters normalize queries and preserve matching guide and article records', () => {
  assert.equal(normalizeHelpQuery('  MEMBER  '), 'member');
  assert.deepEqual(filterHelpContent(null, '').guides, []);
  assert.deepEqual(filterHelpContent({ guides, articles }, 'member').guides.map((guide) => guide.title), ['Find a member']);
  assert.deepEqual(filterHelpContent({ guides, articles }, 'invite').articles.map((article) => article.id), ['invite-members']);
  assert.deepEqual(filterHelpContent({ guides, articles }, 'no matching help').guides, []);
  assert.equal(guides.length, 3);
  assert.equal(articles.length, 3);
});
