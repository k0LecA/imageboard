import { Link, useParams } from 'react-router-dom'
import ThreadList from '../components/ThreadList'
import type { Board as BoardData } from '../types/Board';
import { getBoardMeta } from '../services/BoardService';
import { useEffect, useState } from 'react';
import NotFound from './NotFound';
import CreateThread from '../components/CreateThread';
import Sidebar from '../components/Sidebar';

function Board () {
  const { slug } = useParams();

  const [board, setBoard] = useState<BoardData>()
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [threadListVersion, setThreadListVersion] = useState(0);
  useEffect(() => {
    if (!slug) {
      setError("Board not found");
      setLoading(false);
      return;
    }

    getBoardMeta(slug)
      .then(setBoard)
      .catch(()=> setError("Server is unreachable"))
      .finally(()=>setLoading(false))
  }, [slug])

  if (loading) return <p>Loading</p>
  if (error) return <NotFound />
  if (!board) return <NotFound />

  return (
    <>
      <nav className="thread-breadcrumbs board-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>/{board.slug}/</span>
      </nav>
      <div className="container">Board /{board.slug}</div>
      <CreateThread slug={board.slug} boardId={board.id} onCreated={() => setThreadListVersion((version) => version + 1)} />

      <div className="board-content">
        <Sidebar />
        <ThreadList slug={board.slug} refreshVersion={threadListVersion} />
      </div>
    </>
  );
}

export default Board;
