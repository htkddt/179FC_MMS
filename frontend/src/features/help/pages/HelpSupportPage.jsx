import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { getHelpRelatedArticles } from '../api/helpApi.js';

const relatedArticleIds = ['club-profile', 'member-roles'];

function RelatedArticles({ articles, error, isLoading, retry }) {
  return <Card className="help-related" aria-busy={isLoading}>
    <h2>Related articles</h2>
    {isLoading ? <p className="help-related__state" role="status">Loading related articles.</p> : null}
    {!isLoading && error ? <div className="help-related__state"><p role="alert">Could not load related articles. Please try again.</p><button className="button button--outline" type="button" onClick={retry}>Retry</button></div> : null}
    {!isLoading && !error ? <div>{articles.map((article) => <Link to={'/help/articles/' + article.id} key={article.id}><span><Icon name="file" size={20} /></span><strong>{article.title}</strong><Icon className="help-related__arrow" name="chevronDown" size={22} /></Link>)}</div> : null}
  </Card>;
}

export function HelpSupportPage() {
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(false);
    getHelpRelatedArticles(relatedArticleIds)
      .then((articles) => {
        if (!active) return;
        setRelatedArticles(articles);
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setRelatedArticles([]);
        setError(true);
        setIsLoading(false);
      });
    return () => { active = false; };
  }, [attempt]);

  return <section className="help-support-page help-route-transition">
    <nav className="help-breadcrumb" aria-label="Breadcrumb"><Link to="/help">Help Center</Link><span aria-hidden="true">/</span><span>Contact support</span></nav>
    <header className="help-support__heading"><h2>Tell us how we can help</h2><p>Share enough context for a club administrator to understand the issue.</p></header>
    <div className="help-support__grid">
      <Card className="help-support__form-card"><h3>What do you need help with?</h3><p>Support is a secondary escalation after self-service.</p><form onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="support-topic">Topic<select id="support-topic" name="topic" defaultValue=""><option value="" disabled>Choose a topic</option><option value="account">Account or settings</option><option value="member">Member management</option><option value="organization">Organization or roles</option><option value="other">Other Help Center issue</option></select></label>
        <label htmlFor="support-page">Relevant page <span>(optional)</span><input id="support-page" name="page" type="text" placeholder="For example: Settings" /></label>
        <label htmlFor="support-description">What happened?<textarea id="support-description" name="description" rows="4" placeholder="Describe the issue without sharing sensitive information." aria-describedby="support-sensitive-note" /></label>
        <aside className="help-boundary" id="support-sensitive-note" aria-label="Support service boundary"><Icon name="alert" size={23} /><p>Support messaging is not connected in this demo. This form will not send a request.</p></aside>
        <button className="button" type="submit" disabled>Support service unavailable</button>
      </form></Card>
      <Card className="help-support__guidance"><h3>Before you contact support</h3><ul><li><span><Icon name="search" size={24} /></span>Try searching Help Center</li><li><span><Icon name="file" size={24} /></span>Include the page and steps</li><li><span><Icon name="lock" size={24} /></span>Do not include passwords or personal data</li></ul></Card>
    </div>
    <RelatedArticles articles={relatedArticles} error={error} isLoading={isLoading} retry={() => setAttempt((value) => value + 1)} />
    <Link className="help-back-link" to="/help"><span aria-hidden="true">←</span> Back to Help Center</Link>
  </section>;
}
