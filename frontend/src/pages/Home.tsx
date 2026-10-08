import BoardList from '../components/BoardList.tsx'
import logo from '../assets/logo.svg'

function Home() {
  return (
    <div>
      <header style={{ textAlign: 'center', padding: '30px' }}>
        <img src={logo} alt="blankch logo" width={260} />
      </header>

      <main>
        <p>
          blankch is a forum system where you can communicate quickly and
          freely, and where every point of view has the right to exist.
          No registration or subscription is required, but you are still
          expected to follow the <a href="/rules">rules</a>.
        </p>

        <p>
          All boards, except <a href="/b">/b/</a>, have their own specific
          topics. You can find the list of boards below. Anything that
          is not prohibited by a board's rules and is relevant to its
          topic is allowed.
        </p>

        <BoardList />
      </main>
    </div>
  )
}

export default Home
