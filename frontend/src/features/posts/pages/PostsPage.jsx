import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { Tabs } from '../../../components/ui/Tabs.jsx';
import { useUrlTab } from '../../../hooks/useUrlTab.js';
import { PostStatus } from '../../../mocks/posts.js';
import { getPosts } from '../api/postsApi.js';
import { filterPosts } from '../postFilters.js';
import { formatPostDate } from '../postFormat.js';
import { useSavedSettings } from '../../settings/SettingsProvider.jsx';

const tabs = [{ value: 'all', label: 'All posts' }, { value: 'published', label: 'Published' }, { value: 'drafts', label: 'Drafts' }];
const headings = { all: 'All posts', published: 'Published posts', drafts: 'Draft posts' };

export function PostsPage() {
  const { settings } = useSavedSettings();
  const [tab, setTab] = useUrlTab(tabs.map(item => item.value), 'all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    setError(false);
    setData(null);
    getPosts().then(result => { if (active) setData(result); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [attempt]);

  const visible = useMemo(() => filterPosts(data || [], tab, query, sort), [data, tab, query, sort]);
  const published = data?.filter(post => post.status === PostStatus.published).length;
  const drafts = data?.filter(post => post.status === PostStatus.draft).length;
  const returnTo = location.pathname + location.search;

  return <section className="posts-page">
    <Card className="posts-overview" aria-label="Post overview">
      <div className="posts-overview__intro"><span className="posts-eyebrow">YOUR CONTENT</span><h2>Post overview</h2><p>A quick look at your club updates.</p></div>
      <div className="posts-overview__counts">
        <div><span className="overview-icon overview-icon--green"><Icon name="file" /></span><span><strong>{published ?? '—'}</strong><small>Published</small></span></div>
        <div><span className="overview-icon overview-icon--orange"><Icon name="file" /></span><span><strong>{drafts ?? '—'}</strong><small>Drafts</small></span></div>
      </div>
    </Card>
    <Card className="posts-results">
      <div className="posts-results__heading"><div><span className="posts-eyebrow">CONTENT LIBRARY</span><h2>{headings[tab]}</h2></div><span className="posts-results__count">{data ? `${visible.length} ${visible.length === 1 ? 'post' : 'posts'}` : ''}</span></div>
      <Tabs items={tabs} value={tab} onChange={setTab} label="Post status" />
      <div className="posts-toolbar">
        <label className="posts-search"><Icon name="search" /><input aria-label="Search posts" placeholder="Search posts..." value={query} onChange={event => setQuery(event.target.value)} /></label>
        <div className="posts-toolbar__actions"><label className="posts-sort"><span>Sort by</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title-asc">Title: A to Z</option><option value="title-desc">Title: Z to A</option><option value="author-asc">Author: A to Z</option><option value="status">Status</option></select></label><Link className="button button--primary posts-create" to="/posts/new"><Icon name="plus" size={16} />Create post</Link></div>
      </div>
      <div id={'panel-' + tab} role="tabpanel" aria-labelledby={'tab-' + tab}>
      {error ? <div className="posts-state" role="alert">Could not load posts. <button onClick={() => setAttempt(value => value + 1)}>Retry</button></div> : !data ? <div className="posts-state" role="status">Loading posts…</div> : !visible.length ? <div className="posts-state"><p>{query ? 'No posts match your search.' : tab === 'drafts' ? 'You have no drafts yet.' : 'There are no posts to show.'}</p>{!query && <Link to="/posts/new">Create post</Link>}</div> : <div className="posts-list">{visible.map((post, index) => <article className="posts-item" key={post.id} style={{ '--post-index': Math.min(index, 5) }}>
        <Link className="posts-item__link" to={'/posts/' + post.id} state={{ returnTo }}>
          <span className="posts-item__icon"><Icon name={post.type} size={24} /></span>
          <span className="posts-item__body"><span className="posts-item__title">{post.title}</span><span className="posts-item__excerpt">{post.excerpt}</span><span className="posts-item__author"><Avatar initials={post.author.split(' ').map(name => name[0]).join('').slice(0, 2)} size="sm" /><strong>{post.author}</strong><span aria-hidden="true">·</span><time dateTime={post.updatedAt}>{formatPostDate(post.updatedAt, settings)}</time></span></span>
        </Link>
        <div className="posts-item__actions"><span className={'post-status post-status--' + post.status}>{post.status === PostStatus.published ? 'Published' : post.scheduledAt ? 'Scheduled' : 'Draft'}</span>{post.status === PostStatus.draft && <Link className="post-icon-button post-edit" to={'/posts/' + post.id + '/edit'} state={{ returnTo }} aria-label={'Edit ' + post.title}><Icon name="pen" size={18} /></Link>}<Icon name="arrow" size={17} className="posts-item__arrow" /></div>
      </article>)}</div>}
      </div>
    </Card>
  </section>;
}
