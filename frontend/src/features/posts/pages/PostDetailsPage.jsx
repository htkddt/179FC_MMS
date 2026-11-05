import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { PostStatus } from '../../../mocks/posts.js';
import { getPosts, unpublishPost } from '../api/postsApi.js';
import { sanitizePostHtml } from '../postContent.js';
import { formatPostDate } from '../postFormat.js';
import { useSavedSettings } from '../../settings/SettingsProvider.jsx';

function PerformanceChart({ performance }) {
  const values = performance?.dailyViews;
  if (!values?.length) return <p className="post-performance__empty">No activity data yet.</p>;
  const max = Math.max(30, ...values);
  const points = values.map((value, index) => [index * (300 / Math.max(values.length - 1, 1)), 70 - value / max * 65]);
  const line = points.map(point => point.join(',')).join(' ');
  return <div className="post-chart" role="img" aria-label={'Views over time: ' + values.join(', ')}>
    <div className="post-chart__axis"><span>{max}</span><span>{Math.round(max * 2 / 3)}</span><span>{Math.round(max / 3)}</span><span>0</span></div>
    <div><svg viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true"><path d="M0 5H300 M0 26.7H300 M0 48.3H300 M0 70H300" stroke="#edf0f3" fill="none" /><polygon points={'0,70 ' + line + ' 300,70'} fill="#fbe3e6" /><polyline points={line} fill="none" stroke="#e6002c" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />{points.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="3" fill="#e6002c" />)}</svg><div className="post-chart__dates">{performance.dates?.map((date, index) => <span key={index}>{date}</span>)}</div></div>
  </div>;
}

export function PostDetailsPage() {
  const { settings } = useSavedSettings();
  const { postId } = useParams();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const returnTo = typeof location.state?.returnTo === 'string' && /^\/posts(?:\?|$)/.test(location.state.returnTo) ? location.state.returnTo : '/posts';

  useEffect(() => {
    let active = true;
    setError(''); setLoading(true);
    getPosts().then(items => { if (active) { setPost(items.find(item => item.id === postId) || null); setLoading(false); } }).catch(() => { if (active) { setError('Could not load this post.'); setLoading(false); } });
    return () => { active = false; };
  }, [postId, attempt]);

  async function unpublish() {
    try { setPost(await unpublishPost(post.id)); setError(''); }
    catch { setError('Could not unpublish this post. Please try again.'); }
  }

  const metrics = post?.performance || {};
  return <section className="post-workflow post-detail">
    <Link className="post-detail__back" to={returnTo}><span aria-hidden="true">←</span> Back to posts</Link>
    <header className="post-workflow__heading"><h1>Post details</h1><p>View and manage this club update.</p></header>
    {loading ? <Card className="post-detail__card posts-state" role="status">Loading post…</Card> : !post ? <Card className="post-detail__card posts-state">{error ? <span role="alert">{error} <button onClick={() => setAttempt(value => value + 1)}>Retry</button></span> : <><h2>Post not found</h2><p>This post may have been removed or the link may be incorrect.</p><Link to={returnTo}>Back to posts</Link></>}</Card> : <>
      {error && <p className="post-form__error" role="alert">{error}</p>}
      <div className="post-detail__layout">
        <Card className="post-detail__card">
          <span className={'post-status post-status--' + post.status}>{post.status === PostStatus.published ? 'Published' : post.scheduledAt ? 'Scheduled' : 'Draft'}</span>
          <h2>{post.title}</h2>
          <div className="post-detail__meta"><Avatar initials={post.author.split(' ').map(name => name[0]).join('').slice(0, 2)} size="md" /><span><strong>{post.author}</strong><small><time dateTime={post.publishedAt || post.updatedAt}>{formatPostDate(post.publishedAt || post.updatedAt, settings)}</time></small></span></div>
          {post.image && <img className="post-detail__image" src={post.image} alt={post.imageName || 'Post illustration'} />}
          {post.contentHtml ? <div className="post-detail__content post-rich-content" dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.contentHtml) }} /> : <div className="post-detail__content"><p>{post.content || post.excerpt}</p></div>}
          <div className="post-detail__stats"><span><Icon name="eye" size={19} /> <strong>{metrics.views || 0}</strong> views</span><span><Icon name="heart" size={19} /> <strong>{metrics.reactions || 0}</strong> reactions</span></div>
        </Card>
        <aside className="post-detail__rail">
          <Card className="post-panel post-actions"><h2>Post actions</h2><Link className="button post-button--outline" to={'/posts/' + post.id + '/edit'} state={{ returnTo }}><Icon name="pen" size={16} /> Edit {post.status === PostStatus.draft ? 'draft' : 'post'}</Link>{post.status === PostStatus.published && <button className="post-link-button" onClick={unpublish}>Unpublish</button>}</Card>
          <Card className="post-panel"><h2>Post performance</h2><div className="post-performance__metrics">{[['Views', metrics.views], ['Reactions', metrics.reactions], ['Comments', metrics.comments]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value || 0}</strong></div>)}</div><PerformanceChart performance={post.performance} /></Card>
          <Card className="post-panel"><h2>Recent activity</h2>{post.activity?.length ? <ul className="post-activity">{post.activity.map((item, index) => <li key={index}><span className={'post-activity__avatar post-activity__avatar--' + index}>{item.initials}</span><span><strong>{item.name}</strong> {item.action}</span><time dateTime={item.date}>{formatPostDate(item.date, settings)}</time></li>)}</ul> : <p className="post-performance__empty">No recent activity yet.</p>}</Card>
        </aside>
      </div>
    </>}
  </section>;
}
