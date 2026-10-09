import { Link } from 'react-router-dom';
import notFoundImg from '../assets/404.png';

export default function NotFound() {
  return (
    <div className="not-found">
      <img src={notFoundImg} alt="404 Not Found" />
      <h2>Well, this is awkward...</h2>
      <p>
        This page doesn't exist. Try contacting the administrator,
        but he's probably sleeping.
      </p>
      <Link to="/">Go back home</Link>
    </div>
  );
}
