export function normalizeHelpQuery(query) {
  return String(query || '').trim().toLowerCase();
}

export function filterHelpContent(source, query) {
  const { guides = [], articles = [] } = source || {};
  const normalized = normalizeHelpQuery(query);
  const includesQuery = values => values.join(' ').toLowerCase().includes(normalized);

  return {
    guides: guides.filter((guide) => includesQuery([guide.title, guide.description])),
    articles: articles.filter((article) => includesQuery([article.title, ...(article.searchTerms || [])])),
  };
}
