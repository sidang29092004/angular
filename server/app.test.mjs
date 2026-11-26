import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { MongoClient } from 'mongodb';
import { createApp } from './app.mjs';
import { initializeDatabase } from './database.mjs';
import proxy from '../api/proxy.mjs';

const databaseName = `spotife_test_${randomUUID().replaceAll('-', '')}`;
const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 5000 });
let database;
let server;
let base;

before(async () => {
  await client.connect();
  database = client.db(databaseName);
  await initializeDatabase(database);
  server = createApp(database).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (database) await database.dropDatabase();
  await client.close();
});

function post(path, body) {
  return fetch(`${base}/api/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
}

test('catalog and detail APIs read seeded MongoDB records', async () => {
  const response = await fetch(`${base}/api/catalog`);
  assert.equal(response.status, 200);
  const catalog = await response.json();
  assert.equal(catalog.playlists.length, 4);
  assert.equal(catalog.tracks.length, 4);
  assert.equal(catalog.artists.length, 4);
  assert.equal(catalog.playlists[0]._id, undefined);
  const playlist = await fetch(`${base}/api/playlists/chill`).then((result) => result.json());
  assert.equal(playlist.tracks[0].id, 'binh-yen');
  const artist = await fetch(`${base}/api/artists/june`).then((result) => result.json());
  assert.equal(artist.tracks[0].id, 'ngay-mua');
  assert.equal((await fetch(`${base}/api/tracks/unknown`)).status, 404);
  assert.equal((await fetch(`${base}/api/unknown`)).status, 404);
});

test('repeated and concurrent initialization preserves edited records', async () => {
  await database.collection('tracks').updateOne({ id: 'binh-yen' }, { $set: { description: 'Edited in MongoDB' } });
  await Promise.all([initializeDatabase(database), initializeDatabase(database)]);
  assert.equal(await database.collection('tracks').countDocuments(), 4);
  assert.equal((await database.collection('tracks').findOne({ id: 'binh-yen' })).description, 'Edited in MongoDB');
});

test('newsletter normalizes email and handles concurrent duplicate submissions', async () => {
  const results = await Promise.all(Array.from({ length: 4 }, () => post('subscribers', { email: '  Listener@Example.com  ' })));
  assert.ok(results.every((response) => response.status === 200));
  assert.equal(await database.collection('subscribers').countDocuments({ email: 'listener@example.com' }), 1);
  assert.equal((await post('subscribers', { email: { $ne: null } })).status, 400);
  assert.equal((await post('subscribers', { email: 'bad@email' })).status, 400);
  assert.equal((await fetch(`${base}/api/subscribers`)).status, 404);
});

test('feedback validation and persistence use public fields', async () => {
  assert.equal((await post('feedbacks', { name: ' ', rating: 5, quote: 'A valid comment here.' })).status, 400);
  assert.equal((await post('feedbacks', { name: 'Listener', rating: 6, quote: 'A valid comment here.' })).status, 400);
  const response = await post('feedbacks', { name: 'Người Nghe', rating: 5, quote: 'Giao diện dễ dùng và tìm bài hát rất nhanh.' });
  assert.equal(response.status, 201);
  const feedback = await response.json();
  assert.equal(feedback.initials, 'NN');
  assert.equal(feedback._id, undefined);
  assert.ok(await database.collection('feedbacks').findOne({ id: feedback.id }));
  const list = await fetch(`${base}/api/feedbacks`).then((result) => result.json());
  assert.equal(list[0].id, feedback.id);
});

test('health, CORS and malformed JSON return the correct status', async () => {
  assert.equal((await fetch(`${base}/api/health`)).status, 200);
  assert.equal((await fetch(`${base}/api/catalog`, { headers: { Origin: 'https://unconfigured.example' } })).status, 403);
  const allowedOrigin = (process.env.FRONTEND_URL || 'http://localhost:4200').split(',')[0].trim();
  const allowed = await fetch(`${base}/api/catalog`, { headers: { Origin: allowedOrigin } });
  assert.equal(allowed.headers.get('access-control-allow-origin'), allowedOrigin);
  const invalid = await fetch(`${base}/api/subscribers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' });
  assert.equal(invalid.status, 400);
});

test('Vercel proxy forwards reads, writes and upstream errors', async () => {
  const previous = process.env.API_URL;
  process.env.API_URL = base;
  async function invoke(path, method = 'GET', body) {
    const result = { code: 200, headers: {} };
    const response = {
      status(code) { result.code = code; return this; },
      setHeader(key, value) { result.headers[key] = value; },
      json(value) { result.body = value; },
      send(value) { result.body = JSON.parse(value); },
    };
    await proxy({ query: { path }, method, body }, response);
    return result;
  }
  try {
    assert.equal((await invoke('catalog')).body.tracks.length, 4);
    assert.equal((await invoke('subscribers', 'POST', { email: 'proxy@example.com' })).code, 200);
    assert.equal((await invoke('tracks/missing')).code, 404);
    assert.equal((await invoke('../admin')).code, 400);
    delete process.env.API_URL;
    assert.equal((await invoke('catalog')).code, 503);
  } finally {
    if (previous === undefined) delete process.env.API_URL;
    else process.env.API_URL = previous;
  }
});
