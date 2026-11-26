import { connectDatabase } from './database.mjs';
import { createApp } from './app.mjs';

try {
  const { client, database } = await connectDatabase();
  const server = createApp(database).listen(Number(process.env.PORT || 3000), '0.0.0.0', () => {
    console.log(`spotife API listening on port ${server.address().port}`);
  });
  server.on('error', async (error) => {
    console.error('API could not start:', error.code);
    await client.close();
    process.exitCode = 1;
  });
  function shutdown() {
    server.close(async () => {
      await client.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  }
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
} catch (error) {
  console.error(process.env.MONGODB_URI ? `Không kết nối được MongoDB (${error.name}). Kiểm tra cấu hình kết nối.` : error.message);
  process.exitCode = 1;
}
