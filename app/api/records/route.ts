import { env } from 'cloudflare:workers';

async function init() {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS workspace_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT, module TEXT NOT NULL, name TEXT NOT NULL,
    class_name TEXT, status TEXT NOT NULL, detail TEXT, record_date TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_workspace_records_module ON workspace_records(module)').run();
}

export async function GET(request: Request) {
  try {
    await init();
    const module = new URL(request.url).searchParams.get('module');
    if (!module) return Response.json([]);
    const { results } = await env.DB.prepare('SELECT id, name, class_name as className, status, detail, record_date as date FROM workspace_records WHERE module = ? ORDER BY id DESC').bind(module).all();
    return Response.json(results);
  } catch { return Response.json({ error: '暂时无法读取数据，请稍后重试。' }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    await init();
    const r = await request.json();
    if (!r.module || !r.name) return Response.json({ error: '缺少必填字段' }, { status: 400 });
    const now = new Date().toISOString();
    const result = await env.DB.prepare('INSERT INTO workspace_records (module,name,class_name,status,detail,record_date,created_at) VALUES (?,?,?,?,?,?,?)').bind(r.module,r.name,r.className || '',r.status,r.detail || '',r.date || '刚刚',now).run();
    return Response.json({ id: result.meta.last_row_id, ...r });
  } catch { return Response.json({ error: '保存失败，请检查网络后重试。' }, { status: 503 }); }
}
