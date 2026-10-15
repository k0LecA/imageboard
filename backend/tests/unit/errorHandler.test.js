import test from 'node:test';
import assert from 'node:assert/strict';
import errorHandler from '../../middleware/errorHandler.js';

function createResponse() {
  return {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('returns the status and message of a client error', () => {
  const error = Object.assign(new Error('Invalid board'), { statusCode: 400 });
  const res = createResponse();

  errorHandler(error, {}, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: 'Invalid board' });
});

test('defaults to status 500 when the error has no status', (t) => {
  t.mock.method(console, 'error', () => {});
  const res = createResponse();

  errorHandler(new Error('Unexpected failure'), {}, res, () => {});

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { error: 'Internal server error' });
});

test('hides internal error details from the client and logs the error', (t) => {
  const log = t.mock.method(console, 'error', () => {});
  const error = Object.assign(new Error('Database connection password: secret'), {
    statusCode: 500,
  });
  const res = createResponse();

  errorHandler(error, {}, res, () => {});

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { error: 'Internal server error' });
  assert.equal(log.mock.callCount(), 1);
  assert.deepEqual(log.mock.calls[0].arguments, [error]);
});
