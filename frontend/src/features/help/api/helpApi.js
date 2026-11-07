import { articleDetails, articles, guides } from '../../../mocks/help.js';

function cloneArticleSummary(article) {
  if (!article) return null;
  return { ...article, searchTerms: [...article.searchTerms] };
}

function cloneRelatedArticles(articleIds) {
  return articleIds.map((id) => cloneArticleSummary(articles.find((article) => article.id === id))).filter(Boolean);
}

function cloneArticle(article) {
  if (!article) return null;
  return {
    ...article,
    steps: article.steps.map((step) => ({ ...step })),
    relatedIds: [...article.relatedIds],
    relatedArticles: cloneRelatedArticles(article.relatedIds),
  };
}

export async function getHelp() {
  return { guides: guides.map((guide) => ({ ...guide })), articles: articles.map(cloneArticleSummary) };
}

export async function getHelpArticle(articleId) {
  return cloneArticle(articleDetails.find((article) => article.id === articleId));
}

export async function getHelpRelatedArticles(articleIds) {
  return cloneRelatedArticles(articleIds);
}
