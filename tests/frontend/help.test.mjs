import test from 'node:test';
import assert from 'node:assert/strict';
import { articleDetails, articles, guides } from '../../frontend/src/mocks/help.js';
import { filterHelpContent, normalizeHelpQuery } from '../../frontend/src/features/help/helpFilters.js';
import { getHelpArticle } from '../../frontend/src/features/help/api/helpApi.js';

test('help filters normalize queries and preserve matching guide and article records', () => {
  assert.equal(normalizeHelpQuery('  MEMBER  '), 'member');
  assert.deepEqual(filterHelpContent(null, '').guides, []);
  assert.deepEqual(filterHelpContent({ guides, articles }, 'member').guides.map((guide) => guide.title), ['Find a member']);
  assert.deepEqual(filterHelpContent({ guides, articles }, 'invite').articles.map((article) => article.id), ['invite-members']);
  assert.deepEqual(filterHelpContent({ guides, articles }, 'permission').articles.map((article) => article.id), ['member-roles']);
  assert.deepEqual(filterHelpContent({ guides, articles }, 'no matching help').guides, []);
  assert.equal(guides.length, 3);
  assert.equal(articles.length, 3);
});

test('help article adapter returns an isolated shared article contract', async () => {
  const article = await getHelpArticle('invite-members');
  assert.equal(article.category, 'Member management');
  assert.deepEqual(article.steps.map((step) => step.id), ['open-employees', 'prepare-member-details', 'review-the-invitation']);
  assert.deepEqual(article.relatedIds, ['club-profile', 'member-roles']);
  article.steps[0].heading = 'Changed locally';
  article.relatedIds.pop();
  assert.equal(articleDetails[0].steps[0].heading, 'Open Employees');
  assert.deepEqual(articleDetails[0].relatedIds, ['club-profile', 'member-roles']);
  assert.equal(await getHelpArticle('missing-article'), null);
});
