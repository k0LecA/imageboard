import test from 'node:test';
import assert from 'node:assert/strict';
import createHttpError from '../../utils/httpError.js';

test('creates an Error with the requested HTTP status and message', () => {
  const error = createHttpError(404, 'Thread not found');

  assert.ok(error instanceof Error);
  assert.equal(error.message, 'Thread not found');
  assert.equal(error.statusCode, 404);
});
