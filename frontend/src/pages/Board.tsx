import { Link, useParams } from 'react-router-dom'
import ThreadList from '../components/ThreadList'
import type { Board } from '../types/Board';
import { getBoardMeta } from '../services/BoardService';
import { useEffect, useState } from 'react';
import NotFound from './NotFound';
import CreateThread from '../components/CreateThread';
import Sidebar from '../components/Sidebar';

function Board () {
  const { slug } = useParams();

  const [board, setBoard] = useState<Board>()
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
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
      <div><Link to="/">Home</Link></div>
      <div className="container">Board /{slug}</div>
      <CreateThread />

      <div className="board-content">
        <Sidebar />
        <ThreadList slug={slug!} />
      </div>
    </>
  );
}

export default Board;
