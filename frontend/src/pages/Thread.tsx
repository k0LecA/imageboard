import { Link, useParams } from 'react-router-dom'
import PostList from '../components/PostList'
import Sidebar from '../components/Sidebar'
import NotFound from './NotFound'
import CreateReply from '../components/CreateReply'
import { useState } from 'react'

function Thread () {
  const { slug, threadId: threadIdParam } = useParams();
  const threadId = Number(threadIdParam);
  const [postListVersion, setPostListVersion] = useState(0);

  if (!slug || !Number.isSafeInteger(threadId) || threadId <= 0) {
    return <NotFound />;
  }

  return (
    <div className="thread-page">
      <nav className="thread-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={`/${slug}`}>/{slug}/</Link>
        <span>/</span>
        <span>Thread №{threadId}</span>
      </nav>

      <header className="thread-page-header">
        <h1>Thread №{threadId}</h1>
        <Link to={`/${slug}`} className="thread-back-link">← Back to /{slug}/</Link>
      </header>

      <CreateReply slug={slug} threadId={threadId} onCreated={() => setPostListVersion((version) => version + 1)} />

      <div className="board-content thread-page-content">
        <Sidebar />
        <main className="thread-post-list">
          <PostList slug={slug} threadId={threadId} refreshVersion={postListVersion} />
        </main>
      </div>
    </div>
  )
}

export default Thread;
