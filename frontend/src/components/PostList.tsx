import { useState, useEffect } from "react";
import { getLastPosts } from "../services/PostService";
import type { Post } from "../types/Post";


function PostList({
  threadId,
  slug,
}: {
  threadId: number;
  slug: string;
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
  }, [slug,threadId]);
  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container">
      {items.map((item) => (
        <div key={item.id}>
          <div>
              <strong>{item.message}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PostList;
