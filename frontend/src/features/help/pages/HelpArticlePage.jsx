import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '../../../components/ui/Card.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { getHelpArticle } from '../api/helpApi.js';

function ArticleLoading() {
  return <div className="help-article__loading" aria-busy="true" aria-describedby="help-article-loading-status">
    <span className="sr-only" id="help-article-loading-status" role="status">Loading help article.</span>
    <span className="help-article__breadcrumb-skeleton" aria-hidden="true" />
    <Card className="help-article__skeleton"><span /><strong /><small /></Card>
    <div className="help-article__body" aria-hidden="true"><Card className="help-article__skeleton help-article__skeleton--toc"><strong /><span /><span /><span /></Card><Card className="help-article__skeleton help-article__skeleton--steps"><strong /><span /><span /><span /></Card></div>
  </div>;
}

function ArticleRecovery({ title, description, onRetry }) {
  return <section className="help-article__recovery" aria-labelledby="help-article-recovery-heading">
    <h2 id="help-article-recovery-heading">{title}</h2>
    <p role={onRetry ? 'alert' : 'status'}>{description}</p>
    <div>{onRetry ? <button className="button button--outline" type="button" onClick={onRetry}>Retry</button> : null}<Link className="help-back-link" to="/help"><span aria-hidden="true">←</span> Back to Help Center</Link></div>
  </section>;
}

export function HelpArticlePage() {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [isRouteTransitioning, setIsRouteTransitioning] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(false);
    getHelpArticle(articleId)
      .then((result) => {
        if (!active) return;
        setArticle(result);
        setCurrentStep(result?.steps[0]?.id || '');
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setArticle(null);
        setIsLoading(false);
        setError(true);
      });
    return () => { active = false; };
  }, [articleId, attempt]);

  useEffect(() => {
    setIsRouteTransitioning(false);
    const frame = requestAnimationFrame(() => setIsRouteTransitioning(true));
    return () => cancelAnimationFrame(frame);
  }, [articleId]);

  const pageClassName = 'help-article-page' + (isRouteTransitioning ? ' help-route-transition' : '');

  if (isLoading) return <section className={pageClassName}><ArticleLoading /></section>;
  if (error) return <section className={pageClassName}><ArticleRecovery title="Could not load this help article" description="Please try again or return to Help Center." onRetry={() => setAttempt((value) => value + 1)} /></section>;
  if (!article) return <section className={pageClassName}><ArticleRecovery title="Help article not found" description="This article may have moved or the link may be incorrect." /></section>;

  return <section className={pageClassName}>
    <nav className="help-breadcrumb" aria-label="Breadcrumb"><Link to="/help">Help Center</Link><span aria-hidden="true">/</span><span>{article.breadcrumb}</span></nav>
    <Card className="help-article__header"><p>{article.category}</p><h2>{article.title}</h2><span>{article.description}</span></Card>
    <div className="help-article__body">
      <Card className="help-article__toc"><nav aria-label="On this page"><h3>On this page</h3><div>{article.steps.map((step) => <a href={'#' + step.id} key={step.id} aria-current={currentStep === step.id ? 'location' : undefined} onClick={() => setCurrentStep(step.id)}>{step.heading}</a>)}</div></nav></Card>
      <Card className="help-article__steps"><ol>{article.steps.map((step, index) => <li id={step.id} key={step.id}><span aria-hidden="true">{index + 1}</span><div><h3>{step.heading}</h3><p>{step.description}</p></div></li>)}</ol><aside className="help-boundary" aria-label="Demo service boundary"><Icon name="alert" size={23} /><p>{article.boundary}</p></aside></Card>
    </div>
    <Card className="help-related"><h2>Related articles</h2><div>{article.relatedArticles.map((related) => <Link to={'/help/articles/' + related.id} key={related.id}><span><Icon name="file" size={20} /></span><strong>{related.title}</strong><Icon className="help-related__arrow" name="chevronDown" size={22} /></Link>)}</div></Card>
    <Link className="help-back-link" to="/help"><span aria-hidden="true">←</span> Back to Help Center</Link>
  </section>;
}
