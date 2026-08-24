import { env } from 'cloudflare:workers';

async function init() {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS stored_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT, object_key TEXT NOT NULL UNIQUE,
    filename TEXT NOT NULL, category TEXT NOT NULL, content_type TEXT,
    size INTEGER NOT NULL, data_blob BLOB, created_at TEXT NOT NULL
  )`).run();
  try { await env.DB.prepare('ALTER TABLE stored_files ADD COLUMN data_blob BLOB').run(); } catch { /* already migrated */ }
}

export async function GET(request: Request) {
  try {
    await init();
    const id = new URL(request.url).searchParams.get('id');
    if (id) {
      const item = await env.DB.prepare('SELECT filename, content_type, data_blob FROM stored_files WHERE id = ?').bind(id).first<{filename:string;content_type:string;data_blob:ArrayBuffer}>();
      if (!item) return Response.json({ error: '文件不存在。' }, { status: 404 });
      if (!item.data_blob) return Response.json({ error: '这是旧版文件记录，请重新上传。' }, { status: 404 });
      return new Response(item.data_blob, { headers: { 'Content-Type': item.content_type || 'application/octet-stream', 'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(item.filename)}` } });
    }
    const { results } = await env.DB.prepare('SELECT id, filename, category, content_type as contentType, size, created_at as createdAt FROM stored_files ORDER BY id DESC').all();
    return Response.json(results);
  } catch { return Response.json({ error: '暂时无法读取文件库。' }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    await init();
    const data = await request.formData();
    const file = data.get('file'); const category = String(data.get('category') || '教学资料');
    if (!(file instanceof File)) return Response.json({ error: '请选择要上传的文件。' }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return Response.json({ error: '免费文件库单个文件请控制在 8MB 以内；大文件请使用网盘链接。' }, { status: 400 });
    const key = `${Date.now()}-${crypto.randomUUID()}-${file.name.replace(/[^\w.\-\u4e00-\u9fa5]/g, '_')}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const now = new Date().toISOString();
    const result = await env.DB.prepare('INSERT INTO stored_files (object_key,filename,category,content_type,size,data_blob,created_at) VALUES (?,?,?,?,?,?,?)').bind(key,file.name,category,file.type,file.size,bytes,now).run();
    return Response.json({ id: result.meta.last_row_id, filename: file.name, category, contentType: file.type, size: file.size, createdAt: now });
  } catch { return Response.json({ error: '上传失败，请检查网络后重试。' }, { status: 503 }); }
}
