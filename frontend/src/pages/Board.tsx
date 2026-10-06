import { useParams } from 'react-router-dom'
import ThreadList from '../components/ThreadList'

function Board () {
  const { slug } =useParams();
  return (
    <>
      <div>Board {slug}</div>
      <div>
        <ThreadList slug={slug!} />
      </div>
    </>
  )
}

export default Board;
