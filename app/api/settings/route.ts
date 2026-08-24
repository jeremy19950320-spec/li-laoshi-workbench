import { env } from "cloudflare:workers";

async function init() {
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS teacher_settings (setting_key TEXT PRIMARY KEY, setting_value TEXT NOT NULL, updated_at TEXT NOT NULL)").run();
}

export async function GET() {
  try {
    await init();
    const row = await env.DB.prepare("SELECT setting_value as className FROM teacher_settings WHERE setting_key='current_class'").first<{className:string}>();
    return Response.json({ className: row?.className || "908" });
  } catch { return Response.json({ error: "暂时无法读取系统设置。" }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    await init(); const { className } = await request.json();
    if (!/^90[1-8]$/.test(String(className))) return Response.json({ error: "请选择 901 至 908 班。" }, { status: 400 });
    await env.DB.prepare("INSERT INTO teacher_settings (setting_key,setting_value,updated_at) VALUES ('current_class',?,?) ON CONFLICT(setting_key) DO UPDATE SET setting_value=excluded.setting_value,updated_at=excluded.updated_at").bind(className,new Date().toISOString()).run();
    return Response.json({ className });
  } catch { return Response.json({ error: "保存设置失败，请重试。" }, { status: 503 }); }
}
