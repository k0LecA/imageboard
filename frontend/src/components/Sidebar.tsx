import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBoards } from "../services/BoardService";
import type { Board } from "../types/Board";


function Sidebar() {
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    getBoards()
      .then(setBoards)
      .catch(console.error);
  }, []);

  const groupedBoards = boards.reduce<Record<string, Board[]>>(
    (groups, board) => {
      (groups[board.theme] ??= []).push(board);
      return groups;
    },
    {}
  );

  return (
    <aside className="sidebar">
      {Object.entries(groupedBoards).map(([theme, boards]) => (
        <div className="sidebar-group" key={theme}>
          <div className="sidebar-heading">{theme}</div>

          <div className="sidebar-links">
            {boards.map((board) => (
              <Link key={board.id} to={`/${board.slug}`}>
                /{board.slug}/ - {board.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}

export default Sidebar;
