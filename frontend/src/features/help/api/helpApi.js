import { articleDetails, articles, guides } from '../../../mocks/help.js';

function cloneArticle(article) {
  if (!article) return null;
  return {
    ...article,
    steps: article.steps.map((step) => ({ ...step })),
    relatedIds: [...article.relatedIds],
  };
}

export async function getHelp() { return { guides: [...guides], articles: [...articles] }; }

export async function getHelpArticle(articleId) {
  return cloneArticle(articleDetails.find((article) => article.id === articleId));
}
