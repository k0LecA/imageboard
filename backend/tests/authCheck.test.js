import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthCheck } from '../middleware/authCheck.js';

const TOKEN = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

function createResponse() {
  return {
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('returns 401 when no authorization token is provided', async () => {
  const checkSession = test.mock.fn();
  const res = createResponse();
  let nextCalls = 0;

  await createAuthCheck(checkSession)({ headers: {} }, res, () => nextCalls++);

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: 'No token provided' });
  assert.equal(checkSession.mock.callCount(), 0);
  assert.equal(nextCalls, 0);
});

test('passes a valid token to the session checker and continues', async () => {
  const checkSession = test.mock.fn(async () => ({ expires_at: new Date(Date.now() + 60_000) }));
  let nextCalls = 0;

  await createAuthCheck(checkSession)({ headers: { authorization: TOKEN } }, createResponse(), () => nextCalls++);

  assert.equal(checkSession.mock.calls[0].arguments[0], TOKEN);
  assert.equal(nextCalls, 1);
});

test('rejects malformed UUID tokens before looking up a session', async () => {
  const checkSession = test.mock.fn();
  const res = createResponse();

  await createAuthCheck(checkSession)({ headers: { authorization: 'not-a-uuid' } }, res, () => {});

  assert.equal(res.statusCode, 401);
  assert.equal(checkSession.mock.callCount(), 0);
});

test('returns 401 for missing, expired, or invalid expiry sessions', async () => {
  for (const session of [null, { expires_at: new Date(Date.now() - 1_000) }, { expires_at: 'bad date' }]) {
    const res = createResponse();
    await createAuthCheck(async () => session)({ headers: { authorization: TOKEN } }, res, () => {});
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: 'Invalid or expired session' });
  }
});

test('maps an invalid session error to a 401 HTTP error', async () => {
  let receivedError;
  await createAuthCheck(async () => { throw new Error('Invalid session'); })(
    { headers: { authorization: TOKEN } }, createResponse(), (error) => { receivedError = error; },
  );

  assert.equal(receivedError.statusCode, 401);
  assert.equal(receivedError.message, 'Invalid or expired session');
});

test('forwards unexpected session checker errors', async () => {
  const failure = new Error('Database unavailable');
  let receivedError;
  await createAuthCheck(async () => { throw failure; })(
    { headers: { authorization: TOKEN } }, createResponse(), (error) => { receivedError = error; },
  );

  assert.equal(receivedError, failure);
});
