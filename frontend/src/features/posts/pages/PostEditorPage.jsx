import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../../components/ui/Card.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { PostStatus } from '../../../mocks/posts.js';
import { getPosts, restorePost, savePost } from '../api/postsApi.js';
import { sanitizePostHtml, textToPostHtml } from '../postContent.js';
import { useSavedSettings } from '../../settings/SettingsProvider.jsx';
import { formatPostDate } from '../postFormat.js';

const emptyPost = () => ({ id: globalThis.crypto?.randomUUID?.() || `post-${Date.now()}`, title: '', content: '', contentHtml: '', status: PostStatus.draft, type: 'file', author: 'Tuan Kiet', visibility: 'all', image: '', imageName: '', scheduledAt: null });

export function PostEditorPage() {
  const { settings } = useSavedSettings();
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = !postId;
  const editorRef = useRef(null);
  const fileRef = useRef(null);
  const reviewRef = useRef(null);
  const originalRef = useRef(null);
  const skipSave = useRef(true);
  const [post, setPost] = useState(() => isNew ? emptyPost() : null);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');
  const [saveState, setSaveState] = useState('saved');
  const [schedule, setSchedule] = useState('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [review, setReview] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const isDraft = post?.status !== PostStatus.published;
  const fallback = isNew ? '/posts' : isDraft ? '/posts?tab=drafts' : `/posts/${postId}`;
  const returnTo = typeof location.state?.returnTo === 'string' && /^\/posts(?:\?|$)/.test(location.state.returnTo) ? location.state.returnTo : fallback;

  useEffect(() => {
    if (isNew) return;
    let active = true;
    setLoading(true); setError('');
    getPosts().then(items => {
      if (!active) return;
      const found = items.find(item => item.id === postId);
      if (!found) { setError('Post not found.'); setLoading(false); return; }
      originalRef.current = found; skipSave.current = true;
      setPost(found); setSchedule(found.scheduledAt ? 'later' : 'now');
      if (found.scheduledAt) { const date = new Date(found.scheduledAt); setScheduleDate(new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)); }
      setLoading(false);
    }).catch(() => { if (active) { setError('Could not load this post.'); setLoading(false); } });
    return () => { active = false; };
  }, [isNew, postId, attempt]);

  useEffect(() => {
    if (!post || loading || !editorRef.current) return;
    editorRef.current.innerHTML = post.contentHtml ? sanitizePostHtml(post.contentHtml) : textToPostHtml(post.content || '');
  }, [loading, postId]);

  useEffect(() => {
    if (isNew || !post || loading || !isDraft) return;
    if (skipSave.current) { skipSave.current = false; return; }
    if (!post.title.trim()) { setSaveState('unsaved'); return; }
    let active = true;
    setSaveState('saving');
    savePost({ ...post, scheduledAt: post.scheduledAt || null }).then(() => { if (active) { setSaveState('saved'); setError(''); } }).catch(() => { if (active) { setSaveState('unsaved'); setError('Auto-save failed. Please save your draft again.'); } });
    return () => { active = false; };
  }, [post, loading, isNew, isDraft]);

  useEffect(() => {
    if (!review) return;
    const previous = document.activeElement;
    reviewRef.current?.querySelector('input')?.focus();
    const onKeyDown = event => {
      if (event.key === 'Escape') setReview(false);
      if (event.key !== 'Tab') return;
      const controls = [...reviewRef.current.querySelectorAll('input, button:not(:disabled)')];
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0]?.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); previous?.focus(); };
  }, [review]);

  function update(field, value) { setReviewed(false); setPost(current => ({ ...current, [field]: value })); }
  function updateContent() { update('contentHtml', sanitizePostHtml(editorRef.current.innerHTML)); setPost(current => ({ ...current, content: editorRef.current.innerText })); }
  function format(command, value) { editorRef.current?.focus(); document.execCommand(command, false, value); updateContent(); }
  function addLink() { const url = window.prompt('Enter an https:// or http:// link'); if (url && /^https?:\/\//i.test(url)) format('createLink', url); }
  function loadImage(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { setError('Please choose an image smaller than 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => { setReviewed(false); setPost(current => ({ ...current, image: reader.result, imageName: file.name, imageSize: file.size })); setError(''); };
    reader.onerror = () => setError('Could not read the image. Please try again.');
    reader.readAsDataURL(file);
  }

  async function submit(mode) {
    try {
      setError('');
      if (!post.title.trim()) throw new Error('Please add a post title.');
      if (mode !== 'draft' && !post.content?.trim()) throw new Error('Please write an update before publishing.');
      if (mode === 'review') { setReview(true); return; }
      let scheduledAt = mode === 'draft' ? (post.scheduledAt || null) : null;
      if (mode === 'publish' && isNew && schedule === 'later') {
        if (!scheduleDate || new Date(scheduleDate).getTime() <= Date.now()) throw new Error('Please choose a future date and time.');
        scheduledAt = new Date(scheduleDate).toISOString();
      }
      const saved = await savePost({ ...post, contentHtml: sanitizePostHtml(post.contentHtml || ''), scheduledAt, status: mode === 'draft' || scheduledAt ? PostStatus.draft : PostStatus.published });
      navigate(`/posts/${saved.id}`, { state: { returnTo: scheduledAt || mode === 'draft' ? '/posts?tab=drafts' : '/posts' } });
    } catch (reason) { setError(reason.message || 'Could not save this post. Please try again.'); }
  }
  async function discard() {
    if (!isNew && isDraft && originalRef.current) {
      try { await restorePost(originalRef.current); } catch { setError('Could not discard changes. Please try again.'); return; }
    }
    navigate(returnTo);
  }

  const title = isNew ? 'Create post' : isDraft ? 'Edit draft' : 'Edit post';
  return <section className="post-workflow post-editor">
    <Link className="post-detail__back" to={returnTo}><span aria-hidden="true">←</span> Back to {isNew || !isDraft ? 'posts' : 'drafts'}</Link>
    <header className="post-workflow__heading"><h1>{title}</h1><p>{isNew ? 'Share an update with your club members.' : isDraft ? 'Continue preparing your update before publishing.' : 'Update this club post.'}</p></header>
    {loading ? <Card className="post-panel posts-state" role="status">Loading post…</Card> : !post ? <Card className="post-panel posts-state" role="alert">{error} <button onClick={() => setAttempt(value => value + 1)}>Retry</button></Card> : <div className="post-editor__layout">
      <Card className="post-form">
        <div className="post-form__body">
          <label className="post-form__label" htmlFor="post-title">Post title</label>
          <input id="post-title" className="post-form__input" value={post.title} onChange={event => update('title', event.target.value)} placeholder="Give your post a title" maxLength={150} />
          <label className="post-form__label" id="post-content-label" htmlFor="post-content">Write your update</label>
          <div className="post-editor-box">
            <div className="post-editor-toolbar" role="toolbar" aria-label="Text formatting">
              <select aria-label="Text style" defaultValue="p" onChange={event => format('formatBlock', event.target.value)}><option value="p">Paragraph</option><option value="h2">Heading</option><option value="h3">Subheading</option></select>
              {[['bold', 'B', 'Bold'], ['italic', 'I', 'Italic'], ['underline', 'U', 'Underline'], ['link', '↗', 'Insert link'], ['insertUnorderedList', '☷', 'Bulleted list'], ['insertOrderedList', '☰', 'Numbered list'], ['formatBlock', '❞', 'Quote']].map(([command, symbol, label]) => <button type="button" key={label} aria-label={label} title={label} className={'post-editor-toolbar__' + command} onMouseDown={event => event.preventDefault()} onClick={() => command === 'link' ? addLink() : format(command, command === 'formatBlock' ? 'blockquote' : undefined)}>{symbol}</button>)}
              {!isNew && <button type="button" title="Add image" aria-label="Add image" onClick={() => fileRef.current?.click()}><Icon name="image" size={18} /></button>}
            </div>
            <div id="post-content" ref={editorRef} className="post-editor-content" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-labelledby="post-content-label" data-placeholder="Share your update..." onInput={updateContent} />
          </div>
          <input ref={fileRef} className="sr-only" type="file" accept="image/*" aria-label="Choose an image" onChange={event => { loadImage(event.target.files?.[0]); event.target.value = ''; }} />
          {post.image ? <div className="post-media"><img src={post.image} alt="" /><span><strong>{post.imageName || 'Post image'}</strong><small>{post.imageSize ? `${(post.imageSize / 1024 / 1024).toFixed(1)} MB · ` : ''}Image</small></span><button type="button" aria-label="Remove image" onClick={() => { setReviewed(false); setPost(current => ({ ...current, image: '', imageName: '', imageSize: 0 })); }}><Icon name="close" /></button></div> : <><span className="post-form__label">Add media</span><div className="post-dropzone" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); loadImage(event.dataTransfer.files?.[0]); }}><span><Icon name="image" size={24} /></span><p>Drag and drop images here, or <button type="button" onClick={() => fileRef.current?.click()}>browse</button></p></div></>}
          {error && <p className="post-form__error" role="alert">{error}</p>}
        </div>
        <div className="post-form__footer"><button className="post-link-button" type="button" onClick={discard}>{isNew ? 'Cancel' : 'Discard changes'}</button><div>{(isNew || isDraft) && <button type="button" className="button post-button--outline" onClick={() => submit('draft')}>Save draft</button>}<button type="button" className="button button--primary" onClick={() => submit(isNew || !isDraft ? 'publish' : 'review')}>{isNew ? (schedule === 'later' ? 'Schedule post' : 'Publish post') : isDraft ? 'Review & publish' : 'Save changes'}</button></div></div>
      </Card>
      <aside className="post-editor__rail">
        <Card className="post-panel post-settings"><h2>{isNew ? 'Post settings' : isDraft ? 'Draft settings' : 'Post settings'}</h2><label className="post-form__label" htmlFor="visibility">Visibility</label><div className="post-select"><Icon name="users" size={17} /><select id="visibility" value={post.visibility || 'all'} onChange={event => update('visibility', event.target.value)}><option value="all">All members</option><option value="admins">Club admins</option></select></div>
          {isNew ? <div className="post-schedule"><label><input type="radio" name="schedule" checked={schedule === 'now'} onChange={() => setSchedule('now')} /><span><strong>Publish now</strong><small>Your post will be visible to members immediately.</small></span></label><label><input type="radio" name="schedule" checked={schedule === 'later'} onChange={() => setSchedule('later')} /><span><strong>Schedule for later</strong><small>Choose a date and time to publish your post.</small></span></label>{schedule === 'later' && <label className="post-schedule__date">Publication date and time (device time zone)<input type="datetime-local" value={scheduleDate} onChange={event => setScheduleDate(event.target.value)} /></label>}</div> : isDraft ? <><div className="post-autosave"><span><Icon name="check" size={16} /></span><div><strong>{saveState === 'saving' ? 'Saving changes…' : saveState === 'unsaved' ? 'Changes not saved' : 'Auto-save enabled'}</strong><small>{saveState === 'unsaved' ? 'Add a title or save again.' : 'Changes are saved in this browser.'}</small></div></div>{post.scheduledAt && <div className="post-scheduled-note">Scheduled for {formatPostDate(post.scheduledAt, settings)}<br /><button className="post-link-button" type="button" onClick={() => update('scheduledAt', null)}>Cancel schedule</button></div>}</> : null}
        </Card>
        {isNew ? <Card className="post-panel post-tips"><h2><span><Icon name="bulb" size={18} /></span>Writing tips</h2><ol><li>Keep the title short and clear.</li><li>Add context and next steps.</li><li>Use media to make your post stand out.</li></ol></Card> : isDraft && <Card className="post-panel post-checklist"><h2>Publishing checklist</h2><ul><li><span className={post.title.trim() ? 'checked' : ''}>{post.title.trim() ? '✓' : ''}</span>Clear title</li><li><span className={post.content?.trim() ? 'checked' : ''}>{post.content?.trim() ? '✓' : ''}</span>Add relevant details</li><li><span className={reviewed ? 'checked' : ''}>{reviewed ? '✓' : ''}</span>Review before publishing</li></ul></Card>}
      </aside>
    </div>}
    {review && <div className="post-review-overlay" role="presentation"><div ref={reviewRef} className="post-review" role="dialog" aria-modal="true" aria-labelledby="review-title"><h2 id="review-title">Review your post</h2><h3>{post.title}</h3><div className="post-rich-content" dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.contentHtml || textToPostHtml(post.content)) }} />{post.image && <img src={post.image} alt="Post attachment" />}<label><input type="checkbox" checked={reviewed} onChange={event => setReviewed(event.target.checked)} /> I have reviewed this post</label><div><button className="button post-button--outline" onClick={() => setReview(false)}>Back to editing</button><button className="button button--primary" disabled={!reviewed} onClick={() => submit('publish')}>Publish post</button></div></div></div>}
  </section>;
}
