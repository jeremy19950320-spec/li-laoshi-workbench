import { env } from 'cloudflare:workers';

async function init() {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS stored_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT, object_key TEXT NOT NULL UNIQUE,
    filename TEXT NOT NULL, category TEXT NOT NULL, content_type TEXT,
    size INTEGER NOT NULL, created_at TEXT NOT NULL
  )`).run();
}

export async function GET() {
  try {
    await init();
    const { results } = await env.DB.prepare('SELECT id, filename, category, content_type as contentType, size, created_at as createdAt FROM stored_files ORDER BY id DESC').all();
    return Response.json(results);
  } catch { return Response.json({ error: '暂时无法读取文件库。' }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    await init();
    if (!env.FILES) return Response.json({ error: '文件存储尚未绑定，请先配置 R2 文件库。' }, { status: 503 });
    const data = await request.formData();
    const file = data.get('file'); const category = String(data.get('category') || '教学资料');
    if (!(file instanceof File)) return Response.json({ error: '请选择要上传的文件。' }, { status: 400 });
    const key = `${Date.now()}-${crypto.randomUUID()}-${file.name.replace(/[^\w.\-\u4e00-\u9fa5]/g, '_')}`;
    await env.FILES.put(key, file.stream(), { httpMetadata: { contentType: file.type || 'application/octet-stream' } });
    const now = new Date().toISOString();
    const result = await env.DB.prepare('INSERT INTO stored_files (object_key,filename,category,content_type,size,created_at) VALUES (?,?,?,?,?,?)').bind(key,file.name,category,file.type,file.size,now).run();
    return Response.json({ id: result.meta.last_row_id, filename: file.name, category, contentType: file.type, size: file.size, createdAt: now });
  } catch { return Response.json({ error: '上传失败，请检查网络后重试。' }, { status: 503 }); }
}
