import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { randomUUID } from 'node:crypto';

const publicFields = { _id: 0, order: 0 };

export function createApp(database) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:4200').split(',').map((value) => value.trim());

  app.use('/api', (request, response, next) => {
    response.set('Cache-Control', 'no-store');
    const origin = request.headers.origin;
    if (origin) {
      if (!allowedOrigins.includes(origin)) return response.status(403).json({ message: 'Nguồn truy cập chưa được cấu hình.' });
      response.set('Access-Control-Allow-Origin', origin);
      response.vary('Origin');
      response.set('Access-Control-Allow-Headers', 'Content-Type');
      response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    }
    if (request.method === 'OPTIONS') return response.sendStatus(204);
    next();
  });
  app.use(express.json({ limit: '16kb' }));
  const writeLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'Bạn đã gửi nhiều yêu cầu. Vui lòng thử lại sau ít phút.' },
  });

  app.get('/api/health', async (_request, response) => {
    await database.command({ ping: 1 }, { timeoutMS: 2000 });
    response.json({ status: 'ok', database: 'connected' });
  });

  async function list(name) {
    const collection = database.collection(name);
    const sort = name === 'feedbacks' ? { rating: -1, createdAt: -1 } : { order: 1, id: 1 };
    return collection.find({}, { projection: publicFields }).sort(sort).limit(200).toArray();
  }

  app.get('/api/catalog', async (_request, response) => {
    const names = ['playlists', 'tracks', 'artists', 'feedbacks'];
    const lists = await Promise.all(names.map(list));
    response.json(Object.fromEntries(names.map((name, index) => [name, lists[index]])));
  });

  for (const name of ['playlists', 'tracks', 'artists', 'feedbacks']) {
    app.get(`/api/${name}`, async (_request, response) => response.json(await list(name)));
  }

  for (const name of ['playlists', 'tracks', 'artists']) {
    app.get(`/api/${name}/:id`, async (request, response) => {
      const item = await database.collection(name).findOne({ id: request.params.id }, { projection: publicFields });
      if (!item) return response.status(404).json({ message: 'Không tìm thấy nội dung.' });
      if (name === 'tracks') return response.json(item);
      const filter = name === 'playlists'
        ? { $or: [{ playlistId: item.id }, { playlist: item.title }] }
        : { $or: [{ artistId: item.id }, { artist: item.name }] };
      const tracks = await database.collection('tracks').find(filter, { projection: publicFields }).sort({ order: 1 }).toArray();
      response.json({ ...item, tracks });
    });
  }

  app.post('/api/subscribers', writeLimit, async (request, response) => {
    const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return response.status(400).json({ message: 'Email chưa đúng định dạng.' });
    }
    try {
      await database.collection('subscribers').updateOne(
        { email }, { $setOnInsert: { email, createdAt: new Date() } }, { upsert: true },
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
    response.json({ message: 'Đăng ký nhận tin thành công.' });
  });

  app.post('/api/feedbacks', writeLimit, async (request, response) => {
    const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
    const quote = typeof request.body?.quote === 'string' ? request.body.quote.trim() : '';
    const rating = request.body?.rating;
    if (!name || name.length > 60 || quote.length < 10 || quote.length > 1000 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return response.status(400).json({ message: 'Nhập tên tối đa 60 ký tự, cảm nhận từ 10 đến 1.000 ký tự và đánh giá từ 1 đến 5 sao.' });
    }
    const feedback = {
      id: randomUUID(), name, quote, rating,
      initials: name.split(/\s+/).slice(-2).map((part) => part.charAt(0).toUpperCase()).join(''),
      caption: 'Người nghe spotife',
      createdAt: new Date().toISOString(),
    };
    await database.collection('feedbacks').insertOne({ ...feedback });
    response.status(201).json(feedback);
  });

  app.use((_request, response) => response.status(404).json({ message: 'Không tìm thấy API.' }));
  app.use((error, _request, response, _next) => {
    if (error.type === 'entity.parse.failed') return response.status(400).json({ message: 'Dữ liệu JSON không hợp lệ.' });
    if (error.type === 'entity.too.large') return response.status(413).json({ message: 'Dữ liệu gửi lên quá lớn.' });
    console.error('API request failed:', error.name);
    response.status(503).json({ message: 'Máy chủ tạm thời chưa xử lý được yêu cầu. Bạn hãy thử lại.' });
  });
  return app;
}
