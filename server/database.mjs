import { readFile } from 'node:fs/promises';
import { MongoClient } from 'mongodb';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Cần cấu hình MONGODB_URI trong .env hoặc trên Render.');

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    waitQueueTimeoutMS: 5000,
  });
  try {
    await client.connect();
    const database = client.db(process.env.MONGODB_DB || 'spotife');
    await database.command({ ping: 1 });
    await initializeDatabase(database);
    return { client, database };
  } catch (error) {
    await client.close();
    throw error;
  }
}

export async function initializeDatabase(database) {
  const catalog = JSON.parse(await readFile(new URL('../src/app/data/catalog.json', import.meta.url), 'utf8'));
  await database.collection('subscribers').createIndex({ email: 1 }, { unique: true });
  for (const name of ['playlists', 'tracks', 'artists', 'feedbacks']) {
    const collection = database.collection(name);
    await collection.createIndex({ id: 1 }, { unique: true });
    try {
      await collection.bulkWrite(catalog[name].map((item, order) => ({
        updateOne: {
          filter: { id: item.id },
          update: { $setOnInsert: { ...item, order } },
          upsert: true,
        },
      })), { ordered: false });
    } catch (error) {
      // Concurrent starts may insert the same seed. Existing records are retained.
      if (!error.writeErrors?.length || error.writeErrors.some((item) => item.code !== 11000)) throw error;
    }
  }
  await database.collection('feedbacks').createIndex({ rating: -1, createdAt: -1 });
}
