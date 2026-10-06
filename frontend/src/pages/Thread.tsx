import { useParams } from 'react-router-dom'
import PostList from '../components/PostList'

function Thread () {
  const { slug,threadId } =useParams();
  return (
    <>
      <div>Thread {threadId}</div>
      <div>
        <PostList
          slug={slug}
          threadId={Number(threadId)}
        />
      </div>
    </>
  )
}

export default Thread;
