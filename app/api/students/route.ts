import { env } from "cloudflare:workers";

async function init() {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS teacher_students (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, grade TEXT NOT NULL,
    class_name TEXT NOT NULL, sex TEXT NOT NULL, student_no TEXT NOT NULL UNIQUE,
    phone TEXT, parent_phone TEXT, address TEXT, political TEXT, remark TEXT,
    status TEXT NOT NULL DEFAULT '正常', guardian1_name TEXT, guardian1_relation TEXT,
    guardian1_phone TEXT, guardian2_name TEXT, guardian2_relation TEXT, guardian2_phone TEXT, dormitory TEXT,
    created_at TEXT NOT NULL
  )`).run();
  for (const statement of [
    "ALTER TABLE teacher_students ADD COLUMN guardian1_name TEXT",
    "ALTER TABLE teacher_students ADD COLUMN guardian1_relation TEXT",
    "ALTER TABLE teacher_students ADD COLUMN guardian1_phone TEXT",
    "ALTER TABLE teacher_students ADD COLUMN guardian2_name TEXT",
    "ALTER TABLE teacher_students ADD COLUMN guardian2_relation TEXT",
    "ALTER TABLE teacher_students ADD COLUMN guardian2_phone TEXT",
  ]) try { await env.DB.prepare(statement).run(); } catch { /* already migrated */ }
  try { await env.DB.prepare("ALTER TABLE teacher_students ADD COLUMN dormitory TEXT").run(); } catch { /* already migrated */ }
}

async function seed() {
  const count = await env.DB.prepare("SELECT COUNT(*) as count FROM teacher_students").first<{count:number}>();
  if (count?.count) return;
  const now = new Date().toISOString();
  await env.DB.batch([
    ["张雨桐","901","女","90101","张女士","妈妈","13900001231","","","","海淀区知春路 88 号","共青团员","学习适应情况需跟进","需跟进"],
    ["王子轩","901","男","90102","王先生","爸爸","13900001232","","","","海淀区学院路 66 号","群众","请假中，身体不适","请假中"],
    ["林思琪","903","女","90301","林女士","妈妈","13900001233","","","","朝阳区望京街 16 号","入团积极分子","培训材料齐全","积极分子"],
    ["陈昊","902","男","90201","陈先生","爸爸","13900001234","","","","海淀区清河路 21 号","共青团员","","正常"],
  ].map((x) => env.DB.prepare("INSERT INTO teacher_students (name,grade,class_name,sex,student_no,guardian1_name,guardian1_relation,guardian1_phone,guardian2_name,guardian2_relation,guardian2_phone,address,political,remark,status,created_at) VALUES (?, '九年级', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(...x, now)));
}

export async function GET() {
  try {
    await init(); await seed();
    const { results } = await env.DB.prepare("SELECT id,name,grade,class_name as className,sex,student_no as studentNo,address,political,remark,status,dormitory,guardian1_name as guardian1Name,guardian1_relation as guardian1Relation,guardian1_phone as guardian1Phone,guardian2_name as guardian2Name,guardian2_relation as guardian2Relation,guardian2_phone as guardian2Phone FROM teacher_students ORDER BY class_name, student_no").all();
    return Response.json(results);
  } catch { return Response.json({ error: "暂时无法读取学生档案。" }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    await init(); const item = await request.json();
    if (item.action === "import") {
      if (!Array.isArray(item.items) || !item.items.length) return Response.json({ error: "未识别到学生数据。" }, { status: 400 });
      const existing = await env.DB.prepare("SELECT class_name, student_no FROM teacher_students").all<{class_name:string;student_no:string}>();
      const nextByClass = new Map<string, number>();
      for (const row of existing.results) nextByClass.set(row.class_name, Math.max(nextByClass.get(row.class_name) || 0, Number(row.student_no.slice(-2)) || 0));
      const now = new Date().toISOString(); const invalid: number[] = []; const statements = [];
      for (const [index, row] of item.items.slice(0, 500).entries()) {
        const className = String(row.className || "").replace(/\D/g, "");
        if (!row.name || !/^90[1-8]$/.test(className)) { invalid.push(index + 2); continue; }
        const no = (nextByClass.get(className) || 0) + 1; nextByClass.set(className, no);
        statements.push(env.DB.prepare("INSERT INTO teacher_students (name,grade,class_name,sex,student_no,address,political,remark,status,guardian1_name,guardian1_relation,guardian1_phone,guardian2_name,guardian2_relation,guardian2_phone,dormitory,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(row.name,"九年级",className,row.sex || "未填写",`${className}${String(no).padStart(2,"0")}`,row.address || "",row.political || "群众",row.remark || "",row.status || "正常",row.guardian1Name || "",row.guardian1Relation || "",row.guardian1Phone || "",row.guardian2Name || "",row.guardian2Relation || "",row.guardian2Phone || "",row.dormitory || "",now));
      }
      if (!statements.length) return Response.json({ error: "没有可导入的数据。班级须为 901 至 908，且姓名不能为空。" }, { status: 400 });
      await env.DB.batch(statements);
      return Response.json({ count: statements.length, invalid });
    }
    if (!item.name || !item.className || !item.sex) return Response.json({ error: "请填写姓名、班级和性别。" }, { status: 400 });
    const prefix = String(item.className).replace(/\D/g, "");
    if (!/^90[1-8]$/.test(prefix)) return Response.json({ error: "班级须为 901 至 908。" }, { status: 400 });
    const { results } = await env.DB.prepare("SELECT student_no FROM teacher_students WHERE class_name = ? ORDER BY student_no DESC LIMIT 1").bind(prefix).all<{student_no:string}>();
    const next = results[0] ? Number(results[0].student_no.slice(-2)) + 1 : 1;
    if (next > 99) return Response.json({ error: "该班学生序号已超过 99。" }, { status: 400 });
    const studentNo = `${prefix}${String(next).padStart(2, "0")}`;
    const now = new Date().toISOString();
    const result = await env.DB.prepare("INSERT INTO teacher_students (name,grade,class_name,sex,student_no,address,political,remark,status,guardian1_name,guardian1_relation,guardian1_phone,guardian2_name,guardian2_relation,guardian2_phone,dormitory,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(item.name,"九年级",prefix,item.sex,studentNo,item.address || "",item.political || "群众",item.remark || "",item.status || "正常",item.guardian1Name || "",item.guardian1Relation || "",item.guardian1Phone || "",item.guardian2Name || "",item.guardian2Relation || "",item.guardian2Phone || "",item.dormitory || "",now).run();
    return Response.json({ id: result.meta.last_row_id, ...item, grade: "九年级", className: prefix, studentNo });
  } catch { return Response.json({ error: "保存失败，请检查网络后重试。" }, { status: 503 }); }
}

export async function PUT(request: Request) {
  try {
    await init(); await seed(); const item = await request.json();
    if (!item.id || !item.name) return Response.json({ error: "学生档案信息不完整。" }, { status: 400 });
    const result = await env.DB.prepare("UPDATE teacher_students SET name=?, sex=?, address=?, political=?, remark=?, status=?, guardian1_name=?, guardian1_relation=?, guardian1_phone=?, guardian2_name=?, guardian2_relation=?, guardian2_phone=?, dormitory=? WHERE id=?").bind(item.name,item.sex,item.address || "",item.political || "群众",item.remark || "",item.status || "正常",item.guardian1Name || "",item.guardian1Relation || "",item.guardian1Phone || "",item.guardian2Name || "",item.guardian2Relation || "",item.guardian2Phone || "",item.dormitory || "",item.id).run();
    if (!result.meta.changes) return Response.json({ error: "未找到该学生档案。" }, { status: 404 });
    return Response.json(item);
  } catch { return Response.json({ error: "保存失败，请检查网络后重试。" }, { status: 503 }); }
}
