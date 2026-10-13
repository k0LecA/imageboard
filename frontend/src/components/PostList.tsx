import { useState, useEffect } from "react";
import { getLastPosts } from "../services/PostService";
import type { Post } from "../types/Post";
import PostImages from "./PostImages";


function PostList({
  threadId,
  slug,
  refreshVersion = 0,
}: {
  threadId: number;
  slug: string;
  refreshVersion?: number;
}) {
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    setError(null);
    getLastPosts(slug, threadId)
      .then(setItems)
      .catch(() => setError("Failed to load posts"))
      .finally(() => setLoading(false));
  }, [slug,threadId,refreshVersion]);
  if (loading) return <p className="thread-post-state">Loading posts...</p>;
  if (error) return <p className="thread-post-state" role="alert">{error}</p>;
  if (items.length === 0) return <p className="thread-post-state">No posts in this thread yet.</p>;

  return (
    <div className="thread-posts">
      {items.map((item, index) => (
        <article className={`thread-post${index === 0 ? " thread-post-op" : ""}`} key={item.id}>
          <header className="thread-post-header">
            <strong>{index === 0 ? "Original post" : "Anonymous"}</strong>
            <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time>
            <span>№{item.id}</span>
          </header>
          <div className="post-content">
            <PostImages files={item.files ?? []} />
            <p className="post-message">{item.message}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export default PostList;
