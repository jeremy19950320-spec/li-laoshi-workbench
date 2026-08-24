import { env } from "cloudflare:workers";

async function init() {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS teacher_students (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, grade TEXT NOT NULL,
    class_name TEXT NOT NULL, sex TEXT NOT NULL, student_no TEXT NOT NULL UNIQUE,
    phone TEXT, parent_phone TEXT, address TEXT, political TEXT, remark TEXT,
    status TEXT NOT NULL DEFAULT '正常', created_at TEXT NOT NULL
  )`).run();
}

export async function GET() {
  try {
    await init();
    const { results } = await env.DB.prepare("SELECT id,name,grade,class_name as className,sex,student_no as studentNo,phone,parent_phone as parentPhone,address,political,remark,status FROM teacher_students ORDER BY class_name, student_no").all();
    return Response.json(results);
  } catch { return Response.json({ error: "暂时无法读取学生档案。" }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    await init(); const item = await request.json();
    if (!item.name || !item.className || !item.sex) return Response.json({ error: "请填写姓名、班级和性别。" }, { status: 400 });
    const prefix = String(item.className).replace(/\D/g, "");
    if (!/^90[1-8]$/.test(prefix)) return Response.json({ error: "班级须为 901 至 908。" }, { status: 400 });
    const { results } = await env.DB.prepare("SELECT student_no FROM teacher_students WHERE class_name = ? ORDER BY student_no DESC LIMIT 1").bind(prefix).all<{student_no:string}>();
    const next = results[0] ? Number(results[0].student_no.slice(-2)) + 1 : 1;
    if (next > 99) return Response.json({ error: "该班学生序号已超过 99。" }, { status: 400 });
    const studentNo = `${prefix}${String(next).padStart(2, "0")}`;
    const now = new Date().toISOString();
    const result = await env.DB.prepare("INSERT INTO teacher_students (name,grade,class_name,sex,student_no,phone,parent_phone,address,political,remark,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").bind(item.name,"九年级",prefix,item.sex,studentNo,item.phone || "",item.parentPhone || "",item.address || "",item.political || "群众",item.remark || "",item.status || "正常",now).run();
    return Response.json({ id: result.meta.last_row_id, ...item, grade: "九年级", className: prefix, studentNo });
  } catch { return Response.json({ error: "保存失败，请检查网络后重试。" }, { status: 503 }); }
}
