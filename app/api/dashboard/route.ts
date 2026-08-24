import { env } from 'cloudflare:workers';

async function init() {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS dashboard_attendance (
    id INTEGER PRIMARY KEY CHECK (id = 1), grade TEXT NOT NULL,
    expected_count INTEGER NOT NULL, actual_count INTEGER NOT NULL, updated_at TEXT NOT NULL
  )`).run();
}

export async function GET() {
  try {
    await init();
    const attendance = await env.DB.prepare('SELECT grade, expected_count as expectedCount, actual_count as actualCount, updated_at as updatedAt FROM dashboard_attendance WHERE id = 1').first();
    const { results } = await env.DB.prepare("SELECT name, class_name as className, detail as reason, record_date as date FROM workspace_records WHERE module = '请假' AND status = '请假中' ORDER BY id DESC LIMIT 20").all();
    return Response.json({ attendance: attendance || { grade: '九年级', expectedCount: 180, actualCount: 178 }, leaves: results });
  } catch { return Response.json({ error: '暂时无法读取首页数据。' }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    await init(); const { grade, expectedCount, actualCount } = await request.json();
    if (!grade || Number(expectedCount) < 0 || Number(actualCount) < 0) return Response.json({ error: '请填写有效的出勤人数。' }, { status: 400 });
    const now = new Date().toISOString();
    await env.DB.prepare('INSERT INTO dashboard_attendance (id,grade,expected_count,actual_count,updated_at) VALUES (1,?,?,?,?) ON CONFLICT(id) DO UPDATE SET grade=excluded.grade, expected_count=excluded.expected_count, actual_count=excluded.actual_count, updated_at=excluded.updated_at').bind(grade,Number(expectedCount),Number(actualCount),now).run();
    return Response.json({ grade, expectedCount:Number(expectedCount), actualCount:Number(actualCount), updatedAt:now });
  } catch { return Response.json({ error: '保存出勤数据失败，请重试。' }, { status: 503 }); }
}
