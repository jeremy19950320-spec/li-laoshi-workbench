import { env } from 'cloudflare:workers';

export async function POST(request: Request) {
  try {
    const { module, records } = await request.json();
    if (!module || !Array.isArray(records) || !records.length) return Response.json({ error: 'Excel 中没有可导入的有效记录。' }, { status: 400 });
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS workspace_records (id INTEGER PRIMARY KEY AUTOINCREMENT, module TEXT NOT NULL, name TEXT NOT NULL, class_name TEXT, status TEXT NOT NULL, detail TEXT, record_date TEXT NOT NULL, created_at TEXT NOT NULL)`).run();
    const now = new Date().toISOString();
    const statements = records.slice(0, 1000).filter((r: any) => r.name).map((r: any) => env.DB.prepare('INSERT INTO workspace_records (module,name,class_name,status,detail,record_date,created_at) VALUES (?,?,?,?,?,?,?)').bind(module,r.name,r.className || '',r.status || '正常',r.detail || '',r.date || 'Excel 导入',now));
    if (!statements.length) return Response.json({ error: '没有读取到“姓名”或“名称”列。' }, { status: 400 });
    await env.DB.batch(statements);
    return Response.json({ imported: statements.length });
  } catch { return Response.json({ error: '导入失败，请检查表格格式后重试。' }, { status: 503 }); }
}
