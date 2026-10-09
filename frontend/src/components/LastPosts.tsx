import { useEffect, useState } from "react";
import type { Post } from "../types/Post";
import { getLastPosts } from "../services/PostService";


function LastPosts({ slug,threadId }: { slug:string,threadId: number }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getLastPosts(slug,threadId)
      .then(setPosts)
      .catch(()=> setError("Server is unreachable"))
      .finally(()=>setLoading(false))
  }, [slug,threadId])
  if (error) return <p>Probably empty thread</p>

  if (loading) return <p>Loading...</p>

  if (posts.length === 0) {
    return <p>Thread is empty</p>
  }
  return (
    <div className="last-posts">
      {[...posts]
        .sort((a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        )
        .slice(0, 2)
        .map((post) => (
          <div className="last-post" key={post.id}>
            <small>Anonymous {new Date(post.created_at).toLocaleString()}</small>
            <p>{post.message}</p>
          </div>
        ))}
    </div>
  );
}

export default LastPosts
