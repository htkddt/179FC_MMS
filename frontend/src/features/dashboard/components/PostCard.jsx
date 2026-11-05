import { useState } from 'react';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Card } from '../../../components/ui/Card.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { SessionDetails } from './SessionDetails.jsx';
import { useSavedSettings } from '../../settings/SettingsProvider.jsx';
import { formatTimestamp } from '../../shared/dateFormat.js';

export function PostCard({ post, session, onLike, onComment }) {
  const { settings } = useSavedSettings();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState('');

  function submit(event) {
    event.preventDefault();
    const trimmed = comment.trim();
    if (!trimmed) return;
    onComment(post.id, trimmed);
    setComment('');
  }

  return (
    <Card className="post-card">
      <div className="post-card__author"><Avatar initials={post.initials} tone={post.tone} size="sm" /><span><strong>{post.author}</strong><small>{post.createdAt ? formatTimestamp(post.createdAt, settings) : post.time} · {post.team}</small></span></div>
      <p className="post-card__content">{post.content}</p>
      {session && <SessionDetails event={session} />}
      <div className="post-card__footer">
        <span className="post-card__tag">{post.tag}</span>
        <div className="post-card__metrics">
          <button type="button" className={post.liked ? 'feed-action feed-action--liked' : 'feed-action'} aria-pressed={post.liked} aria-label={`${post.liked ? 'Unlike' : 'Like'} ${post.author}'s update, ${post.likes} likes`} onClick={() => onLike(post.id)}><Icon name="heart" size={16} /> <span>{post.likes}</span></button>
          <button type="button" className="feed-action" aria-expanded={commentsOpen} aria-controls={`comments-${post.id}`} onClick={() => setCommentsOpen(value => !value)}><Icon name="comment" size={16} /> <span>{post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}</span></button>
        </div>
      </div>
      {commentsOpen && <div className="post-comments" id={`comments-${post.id}`}>
        {post.comments.length ? <ul>{post.comments.map(item => <li key={item.id}><strong>{item.author}</strong><span>{item.text}</span></li>)}</ul> : <p className="post-comments__empty">No comments yet. Start the conversation.</p>}
        <form className="post-comments__form" onSubmit={submit}><label className="sr-only" htmlFor={`comment-input-${post.id}`}>Add a comment to {post.author}'s update</label><input id={`comment-input-${post.id}`} value={comment} onChange={event => setComment(event.target.value)} placeholder="Write a comment..." maxLength={500} required /><button className="button button--primary" type="submit" disabled={!comment.trim()}>Comment</button></form>
      </div>}
    </Card>
  );
}
