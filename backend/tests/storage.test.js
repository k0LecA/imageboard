import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorageService } from '../services/storage.js';

function createFakeClient() {
  return {
    calls: [],
    async putObject(...args) { this.calls.push(['putObject', ...args]); },
    async removeObject(...args) { this.calls.push(['removeObject', ...args]); },
    async getObject(...args) { this.calls.push(['getObject', ...args]); return 'stream'; },
  };
}

test('uploads file bytes with a unique key and returns stored metadata', async () => {
  const client = createFakeClient();
  const storage = createStorageService(client, () => 'test-images');
  const buffer = Buffer.from('image bytes');
  const file = { originalname: 'picture.png', mimetype: 'image/png', size: buffer.length, buffer };

  const result = await storage.uploadFile(file);
  const [method, bucket, key, uploadedBuffer, size, headers] = client.calls[0];

  assert.equal(method, 'putObject');
  assert.equal(bucket, 'test-images');
  assert.match(key, /^[0-9a-f-]{36}-picture\.png$/);
  assert.equal(uploadedBuffer, buffer);
  assert.equal(size, buffer.length);
  assert.deepEqual(headers, { 'Content-Type': 'image/png' });
  assert.deepEqual(result, {
    s3Key: key,
    originalName: 'picture.png',
    size: buffer.length,
    mimeType: 'image/png',
  });
});

test('strips client supplied path components from Windows and POSIX filenames', async () => {
  const client = createFakeClient();
  const storage = createStorageService(client, () => 'test-images');

  const windows = await storage.uploadFile({ originalname: '..\\private\\video.mp4', mimetype: 'video/mp4', size: 1, buffer: Buffer.from('x') });
  const posix = await storage.uploadFile({ originalname: '../private/photo.png', mimetype: 'image/png', size: 1, buffer: Buffer.from('x') });

  assert.equal(windows.originalName, 'video.mp4');
  assert.equal(posix.originalName, 'photo.png');
  assert.notEqual(windows.s3Key, posix.s3Key);
});

test('uses the configured bucket for retrieval and deletion', async () => {
  const client = createFakeClient();
  const storage = createStorageService(client, () => 'test-images');

  assert.equal(await storage.getFile('object-key'), 'stream');
  await storage.deleteFile('object-key');

  assert.deepEqual(client.calls, [
    ['getObject', 'test-images', 'object-key'],
    ['removeObject', 'test-images', 'object-key'],
  ]);
});

test('propagates MinIO upload errors', async () => {
  const failure = new Error('MinIO unavailable');
  const client = createFakeClient();
  client.putObject = async () => { throw failure; };
  const storage = createStorageService(client, () => 'test-images');

  await assert.rejects(
    storage.uploadFile({ originalname: 'photo.png', mimetype: 'image/png', size: 1, buffer: Buffer.from('x') }),
    (error) => error === failure,
  );
});
