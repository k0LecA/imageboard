import { useState, useEffect } from "react";
import { Link } from 'react-router-dom'
import { getThreads } from "../services/ThreadService";
import type { Thread } from "../types/Thread";

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
    <div>
      {threads.map((thread) => (
        <div key={thread.id}>
            <Link to={`/${slug}/${thread.id}`}>
              <strong>{thread.subject}</strong>
            </Link>
          </div>
      ))}
    </div>
  );
}

export default ThreadList;
