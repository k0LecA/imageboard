import { useState, useEffect } from "react";
import { Link } from 'react-router-dom'
import { getThreads } from "../services/ThreadService";
import type { Thread } from "../types/Thread";
import LastPosts from "./LastPosts";

function ThreadList ({ slug }: { slug: string }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getThreads(slug)
      .then(setThreads)
      .catch(()=> setError("Server is unreachable"))
      .finally(()=>setLoading(false))
  }, [slug]);

  if (error) return <p>{error}</p>

  if (loading) return <p>Loading...</p>

  if (threads.length === 0) {
    return <p>Board {slug} is empty</p>
  }
  return (
    <div className="thread-list">
      {threads.map((thread) => (
        <div className="thread" key={thread.id}>
          <div className="thread-header">
            <span>Anonymous</span>
            <span>{new Date(thread.created_at).toLocaleString()}</span>
            <span>№{thread.id}</span>
            <Link to={`/${slug}/${thread.id}`}>Reply</Link>
          </div>

          <strong className="thread-subject">{thread.subject}</strong>

          <LastPosts slug={slug} threadId={thread.id} />
        </div>
      ))}
    </div>
  );
}

export default ThreadList;
