import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { filterHelpContent, normalizeHelpQuery } from '../helpFilters.js';
import { getHelp } from '../api/helpApi.js';

function HelpLoading() {
  return (
    <div className="help-loading" aria-busy="true" aria-describedby="help-loading-status">
      <span className="sr-only" id="help-loading-status" role="status">Loading help content.</span>
      <section className="help-guides-section" aria-hidden="true">
        <h2>Quick guides</h2>
        <div className="help-guides">
          {[0, 1, 2].map((index) => <div className="help-skeleton-card" key={index}><span /><strong /><small /></div>)}
        </div>
      </section>
      <div className="help-lower-grid" aria-hidden="true">
        <div className="help-skeleton-panel"><strong />{[0, 1, 2].map((index) => <span key={index} />)}</div>
        <div className="help-skeleton-panel help-skeleton-panel--support"><strong /><span /><small /></div>
      </div>
    </div>
  );
}

function SupportCard() {
  return (
    <section className="support-card" aria-labelledby="help-support-heading">
      <Icon name="headset" size={39} />
      <h2 id="help-support-heading">Still need help?</h2>
      <p>Our support team is here to help you get the most from 179FC.</p>
      <Link className="button" to="/help/support">Contact support</Link>
    </section>
  );
}

export function HelpPage() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [restoreFocusAfterRetry, setRestoreFocusAfterRetry] = useState(false);
  const searchRef = useRef(null);
  const retryRef = useRef(null);
  const initialContentArrival = useRef(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(false);

    getHelp()
      .then((result) => {
        if (!active) return;
        setData(result);
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setData(null);
        setError(true);
        setIsLoading(false);
      });

    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    if (!restoreFocusAfterRetry || isLoading) return;
    (error ? retryRef : searchRef).current?.focus();
    setRestoreFocusAfterRetry(false);
  }, [error, isLoading, restoreFocusAfterRetry]);

  useEffect(() => {
    if (data) initialContentArrival.current = false;
  }, [data]);

  const normalized = normalizeHelpQuery(query);
  const { guides, articles } = useMemo(() => filterHelpContent(data, normalized), [data, normalized]);
  const hasResults = guides.length > 0 || articles.length > 0;
  const retry = () => {
    setRestoreFocusAfterRetry(true);
    setIsLoading(true);
    setError(false);
    setAttempt((value) => value + 1);
  };

  return (
    <section className={'help-page' + (initialContentArrival.current ? '' : ' help-page--content-entered')}>
      <label className="help-search" htmlFor="help-search">
        <Icon name="search" size={27} />
        <span className="sr-only">Search help articles</span>
        <input
          id="help-search"
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search help articles..."
          disabled={isLoading}
        />
      </label>

      {isLoading ? <HelpLoading /> : null}

      {!isLoading && error ? (
        <section className="help-state help-state--error" aria-labelledby="help-error-heading">
          <p id="help-error-heading" role="alert">Could not load help content. Please try again.</p>
          <button className="button help-state__retry" ref={retryRef} type="button" onClick={retry}>Retry</button>
        </section>
      ) : null}

      {!isLoading && !error ? (
        <>
          {guides.length ? (
            <section className="help-guides-section" aria-labelledby="quick-guides-heading">
              <h2 id="quick-guides-heading">Quick guides</h2>
              <div className="help-guides">
                {guides.map((guide, index) => (
                  <Card className="help-guide-card" key={guide.title} style={{ '--help-index': index }}>
                    <span className="help-guide-card__icon"><Icon name={guide.icon} size={31} /></span>
                    <h3>{guide.title}</h3>
                    <p>{guide.description}</p>
                    <Link className="help-guide-card__action" aria-label={'Go to ' + guide.title} to={guide.to}><Icon name="arrow" size={21} /></Link>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          <section className={'help-lower-grid' + (articles.length ? '' : ' help-lower-grid--support-only')}>
            {articles.length ? (
              <Card className="popular-articles">
                <h2>Popular articles</h2>
                <div>
                  {articles.map((article) => (
                    <Link className="popular-article-link" key={article.id} to={'/help/articles/' + article.id}>
                      <span><Icon name="file" size={21} /></span>
                      <strong>{article.title}</strong>
                      <Icon name="chevronDown" className="popular-articles__arrow" size={23} />
                    </Link>
                  ))}
                </div>
              </Card>
            ) : null}
            <SupportCard />
          </section>

          {!hasResults ? (
            <p className="help-empty" role="status">No help articles match your search. Try another keyword or contact support.</p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
