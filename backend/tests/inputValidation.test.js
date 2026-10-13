import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePositiveId,
  validateBoardInput,
  validateThreadInput,
  validatePostInput,
  validateImageFile,
  validateReportTarget,
} from '../utils/inputValidation.js';

test('parses strict positive IDs without losing BIGINT precision', () => {
  assert.equal(parsePositiveId('1'), 1n);
  assert.equal(parsePositiveId('9223372036854775807'), 9223372036854775807n);
  for (const value of ['0', '-1', '1.2', '1e2', '12abc', ' 1', '9223372036854775808', 1]) {
    assert.equal(parsePositiveId(value), null, `reject ${String(value)}`);
  }
  assert.equal(parsePositiveId('2147483648', 2147483647n), null);
});

test('validates board fields and positive integer limits', () => {
  assert.deepEqual(validateBoardInput({ slug: 'a', name: 'Board' }), []);
  assert.deepEqual(validateBoardInput({
    slug: 'a'.repeat(17), name: ' '.repeat(1), bumpLimit: 0, maxThreads: 1.5,
  }).length, 4);
  assert.equal(validateBoardInput({ slug: 'x', name: 'Ж'.repeat(101) }).length, 1);
  assert.deepEqual(validateBoardInput({ slug: 'x', name: 'Board', bumpLimit: 2147483648 }), [
    'bumpLimit must be a positive 32-bit integer',
  ]);
});

test('requires a non-blank thread message and permits up to four attachments', () => {
  assert.deepEqual(validateThreadInput({ message: ' hello ' }, [{}, {}, {}, {}]), []);
  assert.ok(validateThreadInput({ message: ' \n ' }).includes('message must be a non-empty string'));
  assert.ok(validateThreadInput({ message: 'ok', subject: 's'.repeat(201) }).includes(
    'subject must be at most 200 characters',
  ));
  assert.ok(validateThreadInput({ message: 'ok' }, [{}, {}, {}, {}, {}]).length > 0);
  assert.ok(validateThreadInput({ message: 'ok', board_id: '1e2' }).length > 0);
});

test('requires a non-blank post message and permits at most one attachment', () => {
  assert.deepEqual(validatePostInput({ message: 'reply' }, [{}]), []);
  assert.ok(validatePostInput({ message: '' }).length > 0);
  assert.ok(validatePostInput({ message: 'reply' }, [{}, {}]).length > 0);
  assert.ok(validatePostInput({ message: 'reply', boardId: '12abc' }).length > 0);
});

test('checks image MIME allowlist, non-empty matching buffer size, and safe original name', () => {
  const valid = {
    mimetype: 'image/png',
    buffer: Buffer.from([137, 80, 78, 71]),
    size: 4,
    originalname: 'picture.png',
  };
  assert.deepEqual(validateImageFile(valid), []);
  assert.ok(validateImageFile({ ...valid, mimetype: 'text/html' }).includes('unsupported image type'));
  assert.ok(validateImageFile({ ...valid, size: 5 }).length > 0);
  assert.ok(validateImageFile({ ...valid, originalname: '../\nsecret' }).length > 0);
  assert.ok(validateImageFile({ ...valid, buffer: Buffer.alloc(0), size: 0 }).length > 0);
});

test('requires exactly one report target', () => {
  assert.equal(validateReportTarget({ threadId: '1' }), true);
  assert.equal(validateReportTarget({ postId: '1' }), true);
  assert.equal(validateReportTarget({ threadId: '1', postId: '2' }), false);
  assert.equal(validateReportTarget({}), false);
});
