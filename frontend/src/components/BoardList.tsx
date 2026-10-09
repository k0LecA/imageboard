import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getBoards } from '../services/BoardService'
import type { Board } from '../types/Board'

function BoardList() {
  const [boards, setBoards] = useState<Board[]>([])
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getBoards()
      .then(setBoards)
      .catch(()=> setError("Server is unreachable"))
      .finally(()=>setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  if (error) return <p>{error}</p>

  if (boards.length === 0) {
    return <p>Imageboard is empty</p>
  }

  return (
    <div className="board-list">
      {Object.entries(
        boards.reduce<Record<string, Board[]>>((groups, board) => {
          (groups[board.theme] ??= []).push(board);
          return groups;
        }, {})
      ).map(([theme, groupedBoards]) => (
        <div key={theme} className="board-group">
          <h2>{theme}</h2>

          <div className="board-group-items">
            {groupedBoards?.map((board) => (
              <div key={board.id}>
                <Link to={`/${board.slug}`}>
                  /{board.slug}/ - {board.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default BoardList
