export default async function handler(request, response) {
  const path = request.query?.path;
  if (typeof path !== 'string' || !/^[a-zA-Z0-9/_-]+$/.test(path)) {
    return response.status(400).json({ message: 'Đường dẫn API không hợp lệ.' });
  }
  const base = process.env.API_URL;
  if (!base) return response.status(503).json({ message: 'Cần cấu hình API_URL trên Vercel.' });
  try {
    const target = new URL(`/api/${path}`, base);
    const options = {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(55000),
      redirect: 'error',
    };
    if (request.method !== 'GET' && request.method !== 'HEAD') options.body = JSON.stringify(request.body ?? {});
    const upstream = await fetch(target, options);
    response.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    response.setHeader('Cache-Control', 'no-store');
    return response.status(upstream.status).send(await upstream.text());
  } catch {
    return response.status(503).json({ message: 'Chưa kết nối được máy chủ. Bạn hãy thử lại sau ít phút.' });
  }
}
