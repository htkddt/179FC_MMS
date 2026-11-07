import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(false);
    getHelpArticle(articleId)
      .then((result) => {
        if (!active) return;
        setArticle(result);
        const hashStep = location.hash.slice(1);
        setCurrentStep(result?.steps.some((step) => step.id === hashStep) ? hashStep : (result?.steps[0]?.id || ''));
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
    const stepId = location.hash.slice(1);
    if (!article || !stepId || !article.steps.some((step) => step.id === stepId)) return undefined;
    setCurrentStep(stepId);
    const frame = requestAnimationFrame(() => {
      document.getElementById(stepId)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [article, location.hash]);

  const pageClassName = 'help-article-page help-route-transition';
  const renderPage = (content) => <section className={pageClassName} key={articleId}>{content}</section>;

  function selectStep(event, stepId) {
    event.preventDefault();
    setCurrentStep(stepId);
    const hash = '#' + stepId;
    if (location.hash === hash) {
      document.getElementById(stepId)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
      return;
    }
    navigate({ pathname: location.pathname, search: location.search, hash });
  }

  if (isLoading || (!error && article && article.id !== articleId)) return renderPage(<ArticleLoading />);
  if (error) return renderPage(<ArticleRecovery title="Could not load this help article" description="Please try again or return to Help Center." onRetry={() => setAttempt((value) => value + 1)} />);
  if (!article) return renderPage(<ArticleRecovery title="Help article not found" description="This article may have moved or the link may be incorrect." />);

  return renderPage(<>
    <nav className="help-breadcrumb" aria-label="Breadcrumb"><Link to="/help">Help Center</Link><span aria-hidden="true">/</span><span>{article.breadcrumb}</span></nav>
    <Card className="help-article__header"><p>{article.category}</p><h2>{article.title}</h2><span>{article.description}</span></Card>
    <div className="help-article__body">
      <Card className="help-article__toc"><nav aria-label="On this page"><h3>On this page</h3><div>{article.steps.map((step) => <a href={'#' + step.id} key={step.id} aria-current={currentStep === step.id ? 'location' : undefined} onClick={(event) => selectStep(event, step.id)}>{step.heading}</a>)}</div></nav></Card>
      <Card className="help-article__steps"><ol>{article.steps.map((step, index) => <li className={currentStep === step.id ? 'help-step--active' : ''} id={step.id} key={step.id}><span aria-hidden="true">{index + 1}</span><div><h3>{step.heading}</h3><p>{step.description}</p></div></li>)}</ol><aside className="help-boundary" aria-label="Demo service boundary"><Icon name="alert" size={23} /><p>{article.boundary}</p></aside></Card>
    </div>
    <Card className="help-related"><h2>Related articles</h2><div>{article.relatedArticles.map((related) => <Link to={'/help/articles/' + related.id} key={related.id}><span><Icon name="file" size={20} /></span><strong>{related.title}</strong><Icon className="help-related__arrow" name="chevronDown" size={22} /></Link>)}</div></Card>
    <Link className="help-back-link" to="/help"><span aria-hidden="true">←</span> Back to Help Center</Link>
  </>);
}
