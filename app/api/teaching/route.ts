import { env } from "cloudflare:workers";

async function init() {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS teaching_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL, grade TEXT NOT NULL, class_name TEXT NOT NULL,
    weekday TEXT NOT NULL, start_time TEXT NOT NULL, topic TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT '待备课', created_at TEXT NOT NULL
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS textbook_catalog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL, chapter_no TEXT, title TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
  )`).run();
}

export async function GET(request: Request) {
  try {
    await init();
    const params = new URL(request.url).searchParams;
    const subject = params.get("subject") || "英语";
    const allSubjects = params.get("all") === "1";
    const [tasks, catalog] = await Promise.all([
      allSubjects
        ? env.DB.prepare("SELECT id, subject, grade, class_name as className, weekday, start_time as startTime, topic, status FROM teaching_tasks ORDER BY id DESC").all()
        : env.DB.prepare("SELECT id, subject, grade, class_name as className, weekday, start_time as startTime, topic, status FROM teaching_tasks WHERE subject = ? ORDER BY id DESC").bind(subject).all(),
      env.DB.prepare("SELECT id, subject, chapter_no as chapterNo, title, sort_order as sortOrder FROM textbook_catalog WHERE subject = ? ORDER BY sort_order, id").bind(subject).all(),
    ]);
    return Response.json({ tasks: tasks.results, catalog: catalog.results });
  } catch {
    return Response.json({ error: "暂时无法读取教务数据，请稍后重试。" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    await init();
    const data = await request.json();
    const now = new Date().toISOString();
    if (data.action === "task") {
      const { subject, grade, className, weekday, startTime, topic } = data;
      if (![subject, grade, className, weekday, startTime, topic].every(Boolean)) return Response.json({ error: "请完整填写教学任务。" }, { status: 400 });
      const result = await env.DB.prepare("INSERT INTO teaching_tasks (subject,grade,class_name,weekday,start_time,topic,status,created_at) VALUES (?,?,?,?,?,?,?,?)").bind(subject, grade, className, weekday, startTime, topic, data.status || "待备课", now).run();
      return Response.json({ id: result.meta.last_row_id, ...data });
    }
    if (data.action === "catalog") {
      if (!data.subject || !data.title) return Response.json({ error: "请填写目录名称。" }, { status: 400 });
      const result = await env.DB.prepare("INSERT INTO textbook_catalog (subject,chapter_no,title,sort_order,created_at) VALUES (?,?,?,?,?)").bind(data.subject, data.chapterNo || "", data.title, Number(data.sortOrder) || 0, now).run();
      return Response.json({ id: result.meta.last_row_id });
    }
    if (data.action === "catalog-import") {
      if (!data.subject || !Array.isArray(data.items) || !data.items.length) return Response.json({ error: "未识别到可导入的目录。" }, { status: 400 });
      const stmts = data.items.slice(0, 300).map((item: any, index: number) =>
        env.DB.prepare("INSERT INTO textbook_catalog (subject,chapter_no,title,sort_order,created_at) VALUES (?,?,?,?,?)").bind(data.subject, item.chapterNo || "", item.title, Number(item.sortOrder) || index + 1, now),
      );
      await env.DB.batch(stmts);
      return Response.json({ count: stmts.length });
    }
    return Response.json({ error: "未知操作。" }, { status: 400 });
  } catch {
    return Response.json({ error: "保存失败，请检查网络后重试。" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  try {
    await init(); const data = await request.json();
    if (!data.id || !data.subject || !data.weekday || !data.startTime || !data.topic) return Response.json({ error: "请完整填写课程信息。" }, { status: 400 });
    const result = await env.DB.prepare("UPDATE teaching_tasks SET subject=?, grade=?, class_name=?, weekday=?, start_time=?, topic=?, status=? WHERE id=?").bind(data.subject,data.grade || "九年级",data.className || "901",data.weekday,data.startTime,data.topic,data.status || "待备课",data.id).run();
    if (!result.meta.changes) return Response.json({ error: "未找到该教学任务。" }, { status: 404 });
    return Response.json(data);
  } catch { return Response.json({ error: "保存失败，请检查网络后重试。" }, { status: 503 }); }
}

export async function DELETE(request: Request) {
  try {
    await init(); const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "缺少课程编号。" }, { status: 400 });
    const result = await env.DB.prepare("DELETE FROM teaching_tasks WHERE id=?").bind(id).run();
    if (!result.meta.changes) return Response.json({ error: "课程不存在。" }, { status: 404 });
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "删除失败，请检查网络后重试。" }, { status: 503 }); }
}
