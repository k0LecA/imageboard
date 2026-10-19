
import { useState, type SubmitEvent } from 'react';
import { ModService } from '../services/ModService';

function ModAuth() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const username = formData.get('username');
    const password = formData.get('password');

    if (typeof username !== 'string' || typeof password !== 'string') {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await ModService.authenticate(username, password);

      window.location.assign('/mod/dashboard');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid username or password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mod-auth-page">
      <section className="mod-auth-card" aria-labelledby="mod-auth-title">
        <a className="mod-auth-back" href="/">
          ← Back to imageboard
        </a>

        <p className="mod-auth-eyebrow">Moderator access</p>

        <h1 id="mod-auth-title">Sign in</h1>

        <p className="mod-auth-description">
          Sign in with your moderator account to continue.
        </p>

        <form className="mod-auth-form" onSubmit={handleSubmit}>
          <label htmlFor="mod-username">Username</label>
          <input
            id="mod-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Your username"
            disabled={isLoading}
            required
          />

          <label htmlFor="mod-password">Password</label>
          <input
            id="mod-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            disabled={isLoading}
            required
          />

          {error && (
            <p className="mod-auth-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Log in'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default ModAuth;
