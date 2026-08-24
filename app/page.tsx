"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import "./extra.css";

type Student = {
  id: number;
  name: string;
  grade: string;
  className: string;
  sex: string;
  studentNo: string;
  phone: string;
  parentPhone: string;
  guardian1Name?: string;
  guardian1Relation?: string;
  guardian1Phone?: string;
  guardian2Name?: string;
  guardian2Relation?: string;
  guardian2Phone?: string;
  dormitory?: string;
  address: string;
  political: string;
  remark: string;
  status: string;
};
type RecordItem = {
  id: number;
  name: string;
  className: string;
  status: string;
  detail: string;
  date: string;
};

const nav = [
  ["概览", "首页工作台"],
  ["教务", "课程与备课"],
  ["学生", "学生事务"],
  ["请假", "请假返校"],
  ["团务", "团务工作"],
  ["导入", "数据导入导出"],
  ["设置", "系统设置"],
];
const title: any = {
  概览: "首页工作台",
  教务: "教务工作",
  学生: "学生信息与事务",
  请假: "请假与返校管理",
  团务: "团务工作",
  导入: "数据导入与资料库",
  设置: "系统设置",
};
const seedStudents: Student[] = [
  {
    id: 1,
    name: "张雨桐",
    grade: "九年级",
    className: "901",
    sex: "女",
    studentNo: "90101",
    phone: "13800001231",
    parentPhone: "张女士 13900001231",
    address: "海淀区知春路 88 号",
    political: "共青团员",
    remark: "学习适应情况需跟进",
    status: "需跟进",
  },
  {
    id: 2,
    name: "王子轩",
    grade: "九年级",
    className: "901",
    sex: "男",
    studentNo: "90102",
    phone: "13800001232",
    parentPhone: "王先生 13900001232",
    address: "海淀区学院路 66 号",
    political: "群众",
    remark: "请假中，身体不适",
    status: "请假中",
  },
  {
    id: 3,
    name: "林思琪",
    grade: "九年级",
    className: "903",
    sex: "女",
    studentNo: "90301",
    phone: "13800001233",
    parentPhone: "林女士 13900001233",
    address: "朝阳区望京街 16 号",
    political: "入团积极分子",
    remark: "培训材料齐全",
    status: "积极分子",
  },
  {
    id: 4,
    name: "陈昊",
    grade: "九年级",
    className: "902",
    sex: "男",
    studentNo: "90201",
    phone: "13800001234",
    parentPhone: "陈先生 13900001234",
    address: "海淀区清河路 21 号",
    political: "共青团员",
    remark: "",
    status: "正常",
  },
];
const rows: Record<string, RecordItem[]> = {
  教务: [
    {
      id: 1,
      name: "思想道德与法治",
      className: "九年级 1班",
      status: "已授课",
      detail: "第三章 · 社会主义核心价值观",
      date: "08-24",
    },
    {
      id: 2,
      name: "形势与政策",
      className: "九年级 2班",
      status: "待备课",
      detail: "专题二 · 青年使命担当",
      date: "08-26",
    },
  ],
  请假: [
    {
      id: 2,
      name: "王子轩",
      className: "九年级 1班",
      status: "请假中",
      detail: "身体不适，居家休养",
      date: "预计 08-26",
    },
    {
      id: 5,
      name: "周雨欣",
      className: "九年级 3班",
      status: "请假中",
      detail: "事假，家长已说明",
      date: "预计 08-25",
    },
  ],
  团务: [
    {
      id: 3,
      name: "林思琪",
      className: "九年级 3班",
      status: "考察中",
      detail: "团的基础知识培训（已完成）",
      date: "08-18",
    },
  ],
};

export default function Home() {
  const [active, setActive] = useState("概览");
  const [students] = useState(seedStudents);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [toast, setToast] = useState("");
  const say = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };
  const allResults = useMemo(
    () =>
      [
        ...students.map((s) => ({ ...s, module: "学生", detail: s.remark })),
        ...Object.entries(rows).flatMap(([module, list]) =>
          list.map((x) => ({ ...x, module })),
        ),
      ]
        .filter((x: any) => (x.name + x.className + x.detail).includes(query))
        .slice(0, 10),
    [students, query],
  );
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>李</span>
          <div>
            <b>李老师工作台</b>
            <small>个人教学管理</small>
          </div>
        </div>
        <nav>
          {nav.map(([k, l]) => (
            <button
              key={k}
              className={active === k ? "nav active" : "nav"}
              onClick={() => setActive(k)}
            >
              <i>{k}</i>
              {l}
            </button>
          ))}
        </nav>
        <div className="profile">
          <span>李</span>
          <div>
            <b>李老师</b>
            <small>教师账户</small>
          </div>
        </div>
      </aside>
      <section className="content">
        <header>
          <button className="hamb">☰</button>
          <div>
            工作台 <i>/</i> <b>{title[active]}</b>
          </div>
          <div className="head-right">
            <button onClick={() => setSearchOpen(true)} aria-label="全局搜索">
              ⌕
            </button>
            <button>
              ●<em>3</em>
            </button>
            <span>2026年8月24日 · 周一</span>
          </div>
        </header>
        <div className="page">
          {active === "概览" ? (
            <Dashboard students={students} leaves={rows.请假} go={setActive} />
          ) : active === "教务" ? (
            <Teaching say={say} />
          ) : active === "学生" ? (
            <Students students={students} onSelect={setStudent} say={say} />
          ) : active === "导入" ? (
            <Files say={say} />
          ) : active === "设置" ? (
            <Settings say={say} />
          ) : (
            <Records module={active} items={rows[active] || []} say={say} />
          )}
        </div>
      </section>
      {searchOpen && (
        <Search
          query={query}
          setQuery={setQuery}
          results={allResults}
          close={() => setSearchOpen(false)}
          go={(m: string) => {
            setActive(m);
            setSearchOpen(false);
          }}
          select={setStudent}
        />
      )}{" "}
      {student && (
        <StudentDetail student={student} close={() => setStudent(null)} say={say} />
      )}{" "}
      {toast && <div className="toast">✓　{toast}</div>}
    </main>
  );
}

function Dashboard({
  students,
  leaves,
  go,
}: {
  students: Student[];
  leaves: RecordItem[];
  go: (s: string) => void;
}) {
  const [edit, setEdit] = useState(false);
  const [att, setAtt] = useState({
    expected: 180,
    actual: 180 - leaves.length,
  });
  return (
    <>
      <section className="welcome">
        <div>
          <p>上午好，李老师</p>
          <h1>今天，把重要的事安排清楚</h1>
          <span>2026年秋季学期 · 第 1 周</span>
        </div>
        <button className="primary" onClick={() => go("教务")}>
          ＋ 新增备课
        </button>
      </section>
      <HomeSchedule go={go} />
      <section className="home-summary">
        <div className="card schedules">
          <Title label="今日资料" title="校历与课程表" />
          <div className="schedule-links">
            <button onClick={() => go("导入")}>
              <i>日</i>
              <div>
                <b>本学期校历</b>
                <small>上传或查看教学周安排</small>
              </div>
              <span>→</span>
            </button>
            <button onClick={() => go("导入")}>
              <i>课</i>
              <div>
                <b>今日课程表</b>
                <small>上传课程表，快速查看授课安排</small>
              </div>
              <span>→</span>
            </button>
            <button onClick={() => go("导入")}>
              <i>值</i>
              <div>
                <b>九年级值日表</b>
                <small>上传班级值日安排</small>
              </div>
              <span>→</span>
            </button>
          </div>
        </div>
        <div className="card attendance">
          <div className="card-title">
            <div>
              <small>每日出勤</small>
              <h2>九年级到校情况</h2>
            </div>
            <button onClick={() => setEdit(!edit)}>
              {edit ? "完成" : "编辑人数"}
            </button>
          </div>
          {edit ? (
            <div className="attendance-edit">
              <label>
                应到
                <input
                  type="number"
                  value={att.expected}
                  onChange={(e) =>
                    setAtt({ ...att, expected: +e.target.value })
                  }
                />
              </label>
              <label>
                实到
                <input
                  type="number"
                  value={att.actual}
                  onChange={(e) => setAtt({ ...att, actual: +e.target.value })}
                />
              </label>
            </div>
          ) : (
            <div className="attendance-numbers">
              <div>
                <b>{att.expected}</b>
                <span>应到人数</span>
              </div>
              <div>
                <b>{att.actual}</b>
                <span>实到人数</span>
              </div>
              <div className="leave-total">
                <b>{Math.max(0, att.expected - att.actual)}</b>
                <span>请假人数</span>
              </div>
            </div>
          )}
          <div className="leave-roster">
            <div>
              <b>请假名单与原因</b>
              <button onClick={() => go("请假")}>查看全部 →</button>
            </div>
            {leaves.map((l) => (
              <div className="leave-row" key={l.id}>
                <span>{l.name[0]}</span>
                <div>
                  <b>
                    {l.name} <small>{l.className}</small>
                  </b>
                  <p>{l.detail}</p>
                </div>
                <em>{l.date}</em>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="dash-grid">
        <div className="card reminder">
          <Title
            label="日程"
            title="今日提醒"
            btn="查看全部 →"
            onClick={() => go("请假")}
          />
          <Event
            time="09:40"
            title="思想道德与法治"
            sub="九年级 1班 · 笃行楼 301"
            type="blue"
          />
          <Event
            time="返校"
            title="王子轩预计返校"
            sub="请假记录 · 请确认实际返校时间"
            type="red"
          />
        </div>
        <div className="card quick">
          <Title label="快捷操作" title="快速开始" />
          <button onClick={() => go("学生")}>
            <i>人</i>学生档案与筛选 <span>→</span>
          </button>
          <button onClick={() => go("请假")}>
            <i>假</i>登记请假 <span>→</span>
          </button>
          <button onClick={() => go("导入")}>
            <i>⇅</i>导入 / 上传资料 <span>→</span>
          </button>
        </div>
      </section>
    </>
  );
}
type HomeTask = { id: number; subject: string; grade: string; className: string; weekday: string; startTime: string; topic: string; status: string };
function HomeSchedule({ go }: { go: (s: string) => void }) {
  const [tasks, setTasks] = useState<HomeTask[]>([]);
  const [image, setImage] = useState<StoredFile | null>(null);
  const [showImage, setShowImage] = useState(false);
  const [editor, setEditor] = useState<{ weekday: string; time: string; task?: HomeTask } | null>(null);
  const [notice, setNotice] = useState("");
  const weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const periods = [
    { label: "早自习", time: "07:20" }, { label: "上午 1", time: "08:00" }, { label: "上午 2", time: "08:55" }, { label: "上午 3", time: "10:00" }, { label: "上午 4", time: "10:55" },
    { label: "下午 5", time: "14:00" }, { label: "下午 6", time: "14:55" }, { label: "下午 7", time: "16:00" }, { label: "下午 8", time: "16:55" },
    { label: "晚自习 1", time: "19:00" }, { label: "晚自习 2", time: "19:45" }, { label: "晚自习 3", time: "20:35" }, { label: "晚自习 4", time: "21:20" },
  ];
  useEffect(() => {
    Promise.all([fetch("/api/teaching?all=1").then(r => r.json()), fetch("/api/files").then(r => r.json())]).then(([t, f]) => {
      setTasks(t.tasks || []);
      if (Array.isArray(f)) setImage(f.find((x: StoredFile) => x.category === "课程表" && (x.contentType || "").startsWith("image/")) || null);
    }).catch(() => undefined);
  }, []);
  const reload = async () => { try { const t = await fetch("/api/teaching?all=1").then(r => r.json()); setTasks(t.tasks || []); } catch { setNotice("课程表读取失败，请刷新后重试。"); } };
  const save = async (data: HomeTask) => { try { const method = data.id ? "PUT" : "POST"; const body = data.id ? data : { action: "task", ...data }; const r = await fetch("/api/teaching", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const result = await r.json(); if (!r.ok) throw new Error(result.error); setEditor(null); setNotice("课程表已保存"); reload(); } catch (e: any) { setNotice(e.message || "保存失败，请重试。"); } };
  const remove = async (id: number) => { if (!window.confirm("确定删除这节课吗？")) return; try { const r = await fetch(`/api/teaching?id=${id}`, { method: "DELETE" }); const data = await r.json(); if (!r.ok) throw new Error(data.error); setEditor(null); setNotice("课程已删除"); reload(); } catch (e: any) { setNotice(e.message || "删除失败，请重试。"); } };
  const today = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][new Date().getDay()];
  return <section className="card home-schedule">
    <div className="card-title"><div><small>本周安排</small><h2>课程表</h2></div><div className="schedule-actions">{image && <button onClick={() => setShowImage(!showImage)}>{showImage ? "收起原图" : "查看上传原图"}</button>}<button onClick={() => go("教务")}>管理课表 →</button></div></div>
    {showImage && image && <img className="schedule-image" src={`/api/files?id=${image.id}&inline=1`} alt="已上传课程表原图" />}
    <div className="timetable compact"><div className="time-head">节次</div>{weekdays.map(day => <div className={day === today ? "day-head today" : "day-head"} key={day}>{day}</div>)}{periods.map((period) => <div className="time-row" key={period.time}><div className="time-label"><b>{period.label}</b><small>{period.time}</small></div>{weekdays.map(day => { const item = tasks.find(t => t.weekday === day && t.startTime === period.time); return <button onClick={() => setEditor({ weekday: day, time: period.time, task: item })} className={`${item ? `lesson lesson-${item.subject}` : "lesson empty-slot"}${day === today ? " today" : ""}`} key={`${day}-${period.time}`}>{item && <><b>{item.subject}</b><span>{item.topic}</span><small>{item.grade}{item.className}</small></>}</button>; })}</div>)}</div>
    {!tasks.length && <p className="empty schedule-empty">暂无课程安排。请进入“教务工作”，选择学科后按课表新增教学任务；这里会自动生成课程表。</p>}
    {!!notice && <p className="schedule-notice">{notice}</p>}
    {editor && <ScheduleEditor entry={editor} close={() => setEditor(null)} save={save} remove={remove} />}
  </section>;
}
function ScheduleEditor({ entry, close, save, remove }: { entry: { weekday: string; time: string; task?: HomeTask }; close: () => void; save: (x: HomeTask) => void; remove: (id: number) => void }) {
  const [form, setForm] = useState<HomeTask>(entry.task || { id: 0, subject: "英语", grade: "九年级", className: "901", weekday: entry.weekday, startTime: entry.time, topic: "", status: "待备课" });
  return <div className="backdrop" onMouseDown={close}><form className="modal schedule-editor" onMouseDown={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); save(form); }}><div className="modal-title"><div><small>{form.weekday} · {form.startTime}</small><h2>{entry.task ? "编辑课程" : "添加课程"}</h2></div><button type="button" onClick={close}>×</button></div><label>学科<select value={form.subject} onChange={e => setForm({...form,subject:e.target.value})}>{["英语","历史","地理","数学","物理","语文","化学","生物","体育","美术","音乐","班会","政治"].map(x => <option key={x}>{x}</option>)}</select></label><label>班级<select value={form.className} onChange={e => setForm({...form,className:e.target.value})}>{["901","902","903","904","905","906","907","908"].map(x => <option key={x}>{x}</option>)}</select></label><label>教学内容<input required value={form.topic} onChange={e => setForm({...form,topic:e.target.value})} placeholder="例如：Unit 1 词汇" /></label><label>状态<select value={form.status} onChange={e => setForm({...form,status:e.target.value})}><option>待备课</option><option>已完成</option><option>已授课</option></select></label><div className="modal-actions">{entry.task && <button type="button" className="danger" onClick={() => remove(entry.task!.id)}>删除</button>}<button type="button" className="secondary" onClick={close}>取消</button><button className="primary">保存课程</button></div></form></div>;
}
function Students({
  students,
  onSelect,
  say,
}: {
  students: Student[];
  onSelect: (s: Student) => void;
  say: (x: string) => void;
}) {
  const [grade, setGrade] = useState("全部"),
    [cls, setCls] = useState("全部"),
    [sex, setSex] = useState("全部"),
    [q, setQ] = useState("");
  const [saved, setSaved] = useState<Student[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", className: "901", sex: "男", guardian1Name: "", guardian1Relation: "妈妈", guardian1Phone: "", guardian2Name: "", guardian2Relation: "爸爸", guardian2Phone: "", dormitory: "", address: "", political: "群众", remark: "" });
  useEffect(() => { fetch("/api/students").then(r => r.json()).then(x => Array.isArray(x) && setSaved(x)).catch(() => undefined); }, []);
  const allStudents = saved.length ? saved : students;
  const list = allStudents.filter(
    (s) =>
      (grade === "全部" || s.grade === grade) &&
      (cls === "全部" || s.className === cls) &&
      (sex === "全部" || s.sex === sex) &&
      (s.name + s.studentNo).includes(q),
  );
  return (
    <>
      <section className="section-head">
        <div>
          <p>按年级、班级和性别快速查询；点击姓名查看完整档案</p>
          <h1>学生信息与事务</h1>
        </div>
        <div className="head-actions"><label className="secondary">导入学生 Excel<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={e => { importStudents(e.target.files?.[0], setSaved, say); e.currentTarget.value = ""; }} /></label><button className="primary" onClick={() => setAddOpen(true)}>＋ 新增学生</button></div>
      </section>
      <section className="filters card">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索姓名或学号…"
        />
        {[
          ["年级", grade, setGrade, ["全部", "九年级"]],
          ["班级", cls, setCls, ["全部", "901", "902", "903", "904", "905", "906", "907", "908"]],
          ["性别", sex, setSex, ["全部", "男", "女"]],
        ].map(([label, value, set, opts]: any) => (
          <label key={label}>
            {label}
            <select value={value} onChange={(e) => set(e.target.value)}>
              {opts.map((x: string) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        ))}
      </section>
      <section className="card table-card">
        <div className="table-title">
          <b>学生档案</b>
          <small>共 {list.length} 人</small>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>姓名</th>
                <th>年级班级</th>
                <th>性别</th>
                <th>政治面貌</th>
                <th>状态</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id}>
                  <td>
                    <button className="name-link" onClick={() => onSelect(s)}>
                      {s.name}
                    </button>
                    <small>{s.studentNo}</small>
                  </td>
                  <td>
                    {s.grade} {s.className}
                  </td>
                  <td>{s.sex}</td>
                  <td>{s.political}</td>
                  <td>
                    <span className="tag blue">{s.status}</span>
                  </td>
                  <td>{s.remark || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {addOpen && <StudentForm form={form} setForm={setForm} close={() => setAddOpen(false)} saved={(item: Student) => { setSaved(old => [...old, item]); setAddOpen(false); say(`学生已保存，自动学号为 ${item.studentNo}`); }} say={say} />}
    </>
  );
}
async function importStudents(file: File | undefined, setSaved: (v: Student[]) => void, say: (x: string) => void) {
  if (!file) return; try {
    const book = XLSX.read(await file.arrayBuffer(), { type: "array" }); const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(book.Sheets[book.SheetNames[0]], { defval: "" });
    const value = (row: Record<string, unknown>, ...keys: string[]) => String(keys.map(k => row[k]).find(v => v !== undefined && v !== "") || "").trim();
    const items = rows.map(row => ({ name: value(row,"姓名","学生姓名"), sex: value(row,"性别"), className: value(row,"班级","班号"), dormitory: value(row,"寝室号","宿舍号"), guardian1Name: value(row,"家长姓名1","监护人1姓名","家长1姓名"), guardian1Relation: value(row,"亲属关系1","监护人1关系","家长1关系"), guardian1Phone: value(row,"家长手机1","家长电话1","监护人1电话","家长1手机号"), guardian2Name: value(row,"家长姓名2","监护人2姓名","家长2姓名"), guardian2Relation: value(row,"亲属关系2","监护人2关系","家长2关系"), guardian2Phone: value(row,"家长手机2","家长电话2","监护人2电话","家长2手机号"), address: value(row,"家庭住址","住址"), political: value(row,"政治面貌"), remark: value(row,"备注") })).filter(x => x.name || x.className);
    const r = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "import", items }) }); const data = await r.json(); if (!r.ok) throw new Error(data.error); const latest = await fetch("/api/students").then(x => x.json()); if (Array.isArray(latest)) setSaved(latest); say(`已导入 ${data.count} 名学生${data.invalid?.length ? `，跳过 ${data.invalid.length} 行无效数据` : ""}`);
  } catch (e: any) { say(e.message || "导入失败，请检查 Excel 表头与数据后重试。"); }
}
function StudentForm({ form, setForm, close, saved, say }: any) {
  const submit = async (e: React.FormEvent) => { e.preventDefault(); try { const r = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const d = await r.json(); if (!r.ok) throw new Error(d.error); saved(d); } catch (e: any) { say(e.message || "保存失败，请重试。"); } };
  return <div className="backdrop" onMouseDown={close}><form className="modal record-form" onMouseDown={e => e.stopPropagation()} onSubmit={submit}><div className="modal-title"><div><small>新增学生档案</small><h2>九年级学生</h2></div><button type="button" onClick={close}>×</button></div><label>姓名<input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></label><label>班级<select value={form.className} onChange={e => setForm({...form,className:e.target.value})}>{["901","902","903","904","905","906","907","908"].map(x => <option key={x}>{x}</option>)}</select><small>学号会自动生成，如 901 班第 1 人为 90101。</small></label><label>性别<select value={form.sex} onChange={e => setForm({...form,sex:e.target.value})}><option>男</option><option>女</option></select></label><label>寝室号<input value={form.dormitory} onChange={e => setForm({...form,dormitory:e.target.value})} placeholder="例如：3-502" /></label><label>家长 / 监护人 1 姓名<input value={form.guardian1Name} onChange={e => setForm({...form,guardian1Name:e.target.value})} /></label><label>亲属关系<select value={form.guardian1Relation} onChange={e => setForm({...form,guardian1Relation:e.target.value})}>{["爸爸","妈妈","爷爷","奶奶","外公","外婆","其他"].map(x => <option key={x}>{x}</option>)}</select></label><label>家长 / 监护人 1 手机号<input value={form.guardian1Phone} onChange={e => setForm({...form,guardian1Phone:e.target.value})} /></label><label>家长 / 监护人 2 姓名<input value={form.guardian2Name} onChange={e => setForm({...form,guardian2Name:e.target.value})} /></label><label>亲属关系<select value={form.guardian2Relation} onChange={e => setForm({...form,guardian2Relation:e.target.value})}>{["爸爸","妈妈","爷爷","奶奶","外公","外婆","其他"].map(x => <option key={x}>{x}</option>)}</select></label><label>家长 / 监护人 2 手机号<input value={form.guardian2Phone} onChange={e => setForm({...form,guardian2Phone:e.target.value})} /></label><label>家庭住址<input value={form.address} onChange={e => setForm({...form,address:e.target.value})} /></label><label>备注<textarea value={form.remark} onChange={e => setForm({...form,remark:e.target.value})} /></label><div className="modal-actions"><button type="button" className="secondary" onClick={close}>取消</button><button className="primary">保存并生成学号</button></div></form></div>;
}
type TeachingTask = { id: number; grade: string; className: string; weekday: string; startTime: string; topic: string; status: string };
type Chapter = { id: number; chapterNo: string; title: string; sortOrder: number };
type StoredFile = { id: number; filename: string; category: string; contentType?: string; size: number };
const subjects = ["英语", "历史", "地理", "数学", "物理", "语文", "化学", "生物", "体育", "美术", "音乐", "班会", "政治"];

function Teaching({ say }: { say: (x: string) => void }) {
  const [subject, setSubject] = useState("英语");
  const [tasks, setTasks] = useState<TeachingTask[]>([]);
  const [catalog, setCatalog] = useState<Chapter[]>([]);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState({ grade: "九年级", className: "901", weekday: "周一", startTime: "09:40", topic: "", status: "待备课" });
  const [chapter, setChapter] = useState({ chapterNo: "", title: "" });

  const refresh = async () => {
    setLoading(true);
    try {
      const [teaching, library] = await Promise.all([
        fetch(`/api/teaching?subject=${encodeURIComponent(subject)}`).then((r) => r.json()),
        fetch("/api/files").then((r) => r.json()),
      ]);
      if (teaching.error) throw new Error(teaching.error);
      setTasks(teaching.tasks || []);
      setCatalog(teaching.catalog || []);
      setFiles(Array.isArray(library) ? library : []);
    } catch (e: any) {
      say(e.message || "读取教务数据失败，请重试。");
    } finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, [subject]);
  const saveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await fetch("/api/teaching", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "task", subject, ...task }) });
      const data = await r.json(); if (!r.ok) throw new Error(data.error);
      setTask({ ...task, topic: "" }); say("教学任务已保存"); refresh();
    } catch (e: any) { say(e.message || "保存失败，请重试。"); }
  };
  const saveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await fetch("/api/teaching", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "catalog", subject, ...chapter, sortOrder: catalog.length + 1 }) });
      const data = await r.json(); if (!r.ok) throw new Error(data.error);
      setChapter({ chapterNo: "", title: "" }); say("教材目录已保存"); refresh();
    } catch (e: any) { say(e.message || "保存失败，请重试。"); }
  };
  const importCatalog = async (file?: File) => {
    if (!file) return;
    try {
      const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const first = book.Sheets[book.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(first, { defval: "" });
      const items = raw.map((row, i) => ({
        chapterNo: String(row["序号"] || row["章节编号"] || row["章节"] || ""),
        title: String(row["目录"] || row["章节名称"] || row["名称"] || row["课题"] || Object.values(row)[1] || Object.values(row)[0] || "").trim(),
        sortOrder: i + 1,
      })).filter((x) => x.title);
      if (!items.length) throw new Error("未识别目录。请使用“序号、目录（或章节名称）”两列。");
      const r = await fetch("/api/teaching", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "catalog-import", subject, items }) });
      const data = await r.json(); if (!r.ok) throw new Error(data.error);
      say(`已导入 ${data.count} 条${subject}教材目录`); refresh();
    } catch (e: any) { say(e.message || "目录导入失败，请检查文件后重试。"); }
  };
  const upload = async (file: File | undefined, chapterName: string) => {
    if (!file) return;
    try {
      const body = new FormData(); body.append("file", file); body.append("category", `教材资料 · ${subject} · ${chapterName}`);
      const r = await fetch("/api/files", { method: "POST", body }); const data = await r.json();
      if (!r.ok) throw new Error(data.error); say(`${file.name} 已上传并保存`); refresh();
    } catch (e: any) { say(e.message || "上传失败，请检查网络后重试。"); }
  };
  const removeFile = async (file: StoredFile) => {
    if (!window.confirm(`确定删除“${file.filename}”吗？删除后无法恢复。`)) return;
    try { const r = await fetch(`/api/files?id=${file.id}`, { method: "DELETE" }); const data = await r.json(); if (!r.ok) throw new Error(data.error); setFiles(old => old.filter(x => x.id !== file.id)); say("资料已删除"); } catch (e: any) { say(e.message || "删除失败，请重试。"); }
  };
  const materials = (name: string) => files.filter((f) => f.category === `教材资料 · ${subject} · ${name}`);
  return <>
    <section className="section-head"><div><p>按学科管理课表任务、教材目录与章节资料</p><h1>教务工作</h1></div></section>
    <section className="subject-tabs card">{subjects.map((x) => <button key={x} className={subject === x ? "selected" : ""} onClick={() => setSubject(x)}>{x}</button>)}</section>
    <section className="teaching-grid">
      <div className="card"><Title label="课表安排" title={`${subject}教学任务`} />
        <form className="task-form" onSubmit={saveTask}>
          <select value={task.grade} onChange={(e) => setTask({ ...task, grade: e.target.value })}><option>九年级</option></select>
          <select value={task.className} onChange={(e) => setTask({ ...task, className: e.target.value })}>{["901","902","903","904","905","906","907","908"].map(x => <option key={x}>{x}</option>)}</select>
          <select value={task.weekday} onChange={(e) => setTask({ ...task, weekday: e.target.value })}>{["周一","周二","周三","周四","周五","周六","周日"].map(x => <option key={x}>{x}</option>)}</select>
          <input type="time" value={task.startTime} onChange={(e) => setTask({ ...task, startTime: e.target.value })} />
          <input required value={task.topic} onChange={(e) => setTask({ ...task, topic: e.target.value })} placeholder="教学内容 / 课题" />
          <select value={task.status} onChange={(e) => setTask({ ...task, status: e.target.value })}><option>待备课</option><option>已完成</option><option>已授课</option></select>
          <button className="primary">保存任务</button>
        </form>
        <div className="task-list">{loading ? <p>正在读取…</p> : tasks.length ? tasks.map(t => <div key={t.id}><b>{t.weekday} {t.startTime}</b><span>{t.grade}{t.className} · {t.topic}</span><em>{t.status}</em></div>) : <p className="empty">暂未安排任务；请按课程表新增一条。</p>}</div>
      </div>
      <div className="card"><Title label="教材目录" title={`${subject} · 本学期课本`} />
        <form className="catalog-form" onSubmit={saveChapter}><input value={chapter.chapterNo} onChange={(e) => setChapter({ ...chapter, chapterNo: e.target.value })} placeholder="章节，如 第一单元" /><input required value={chapter.title} onChange={(e) => setChapter({ ...chapter, title: e.target.value })} placeholder="目录名称" /><button className="secondary">添加目录</button></form>
        <label className="import-catalog">▤ 导入教材目录 Excel<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={(e) => { importCatalog(e.target.files?.[0]); e.currentTarget.value = ""; }} /></label>
        <small className="hint">表头建议使用：序号、目录（或章节名称）。导入后自动生成目录。</small>
        <div className="catalog-list">{catalog.length ? catalog.map(c => <div className="catalog-row" key={c.id}><div><b>{c.chapterNo || "第" + c.sortOrder + "节"}　{c.title}</b>{materials(c.title).map(f => <span className="material-item" key={f.id}><a href={`/api/files?id=${f.id}`}>↓ {f.filename}</a><button onClick={() => removeFile(f)}>删除</button></span>)}</div><label className="secondary">上传资料<input hidden type="file" onChange={(e) => { upload(e.target.files?.[0], c.title); e.currentTarget.value = ""; }} /></label></div>) : <p className="empty">尚未添加目录。可手动添加，或导入教材目录 Excel。</p>}</div>
      </div>
    </section>
  </>;
}
function Records({
  module,
  items,
  say,
}: {
  module: string;
  items: RecordItem[];
  say: (x: string) => void;
}) {
  const [list, setList] = useState(items);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", className: "九年级 1班", status: module === "请假" ? "请假中" : "待处理", detail: "", date: "" });
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await fetch("/api/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ module, ...form, date: form.date || "刚刚" }) });
      const data = await r.json(); if (!r.ok) throw new Error(data.error);
      setList([{ id: data.id, ...form, date: form.date || "刚刚" }, ...list]); setOpen(false); setForm({ name: "", className: "九年级 1班", status: module === "请假" ? "请假中" : "待处理", detail: "", date: "" }); say("记录已保存，刷新页面后仍会保留");
    } catch (e: any) { say(e.message || "保存失败，请检查网络后重试。"); }
  };
  return (
    <>
      <section className="section-head">
        <div>
          <p>
            {module === "教务"
              ? "课程、备课与授课进度"
              : module === "请假"
                ? "请假名单、返校时间与原因"
                : "团员、积极分子、培训与考核"}
          </p>
          <h1>{title[module]}</h1>
        </div>
        <button
          className="primary"
          onClick={() => setOpen(true)}
        >
          ＋ 新增记录
        </button>
      </section>
      <section className="card table-card">
        <div className="table-title">
          <b>全部记录</b>
          <small>共 {list.length} 条</small>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>名称</th>
                <th>班级</th>
                <th>状态</th>
                <th>内容 / 原因</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              {list.map((i) => (
                <tr key={i.id}>
                  <td>
                    <b>{i.name}</b>
                  </td>
                  <td>{i.className}</td>
                  <td>
                    <span className="tag blue">{i.status}</span>
                  </td>
                  <td>{i.detail}</td>
                  <td>{i.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {open && <div className="backdrop" onMouseDown={() => setOpen(false)}><form className="modal record-form" onMouseDown={(e) => e.stopPropagation()} onSubmit={save}><div className="modal-title"><div><small>新增{title[module]}</small><h2>填写记录</h2></div><button type="button" onClick={() => setOpen(false)}>×</button></div><label>名称<input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder={module === "请假" ? "学生姓名" : "名称"} /></label><label>班级<input value={form.className} onChange={e => setForm({...form,className:e.target.value})} /></label><label>状态<input value={form.status} onChange={e => setForm({...form,status:e.target.value})} /></label><label>时间<input value={form.date} onChange={e => setForm({...form,date:e.target.value})} placeholder="例如 2026-08-24" /></label><label>内容 / 原因<textarea value={form.detail} onChange={e => setForm({...form,detail:e.target.value})} /></label><div className="modal-actions"><button type="button" className="secondary" onClick={() => setOpen(false)}>取消</button><button className="primary">保存记录</button></div></form></div>}
    </>
  );
}
function Files({ say }: { say: (x: string) => void }) {
  const [stored, setStored] = useState<StoredFile[]>([]);
  const remove = async (file: StoredFile) => {
    if (!window.confirm(`确定删除“${file.filename}”吗？删除后无法恢复。`)) return;
    try { const r = await fetch(`/api/files?id=${file.id}`, { method: "DELETE" }); const d = await r.json(); if (!r.ok) throw new Error(d.error); setStored(old => old.filter(x => x.id !== file.id)); say("文件已删除"); } catch (e: any) { say(e.message || "删除失败，请重试。"); }
  };
  const upload = async (file: File | undefined, category: string) => {
    if (!file) return;
    try {
      const body = new FormData(); body.append("file", file); body.append("category", category);
      const r = await fetch("/api/files", { method: "POST", body }); const data = await r.json();
      if (!r.ok) throw new Error(data.error); setStored((old) => [data, ...old]); say(`${file.name} 已上传并保存`);
    } catch (e: any) { say(e.message || "上传失败，请检查网络后重试。"); }
  };
  useEffect(() => { fetch("/api/files").then(r => r.json()).then(x => Array.isArray(x) && setStored(x)).catch(() => undefined); }, []);
  return (
    <>
      <section className="section-head">
        <div>
          <p>上传校历、课程表和值日表，或导入 Excel 数据</p>
          <h1>数据导入与资料库</h1>
        </div>
      </section>
      <section className="imports">
        {["学生信息 Excel", "请假返校 Excel", "团务档案 Excel"].map((x) => (
          <div className="card import" key={x}>
            <span>▤</span>
            <h2>{x}</h2>
            <p>支持 .xlsx、.xls、.csv 格式，导入前会校验姓名与班级字段。</p>
            <div>
              <button
                className="secondary"
                onClick={() => say("模板下载已开始")}
              >
                下载模板
              </button>
              <label className="primary">
                选择文件
                <input
                  hidden
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, `${x}原始导入文件`); e.currentTarget.value = ""; }}
                />
              </label>
            </div>
          </div>
        ))}
      </section>
      <section className="card file-library">
        <Title label="文件存储" title="校历、课程表和值日表" />
        <p>资料上传后将显示在此处，并可在首页快速打开。</p>
        <div className="file-actions">
          {["校历", "课程表", "值日表"].map((x) => (
            <label className="secondary" key={x}>
              ＋ 上传{x}
              <input
                hidden
                type="file"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, x); e.currentTarget.value = ""; }}
              />
            </label>
          ))}
        </div>
        {!!stored.length && <div className="stored-list">{stored.slice(0, 12).map(f => <div key={f.id}><a href={`/api/files?id=${f.id}`}>↓ {f.filename} <small>{f.category}</small></a><button onClick={() => remove(f)}>删除</button></div>)}</div>}
      </section>
    </>
  );
}
function Settings({ say }: { say: (x: string) => void }) {
  return (
    <section className="card settings">
      <h2>系统设置</h2>
      <label>
        显示名称
        <input defaultValue="李老师" />
      </label>
      <button className="primary" onClick={() => say("设置已保存")}>
        保存设置
      </button>
    </section>
  );
}
function Search({ query, setQuery, results, close, go, select }: any) {
  return (
    <div className="backdrop" onMouseDown={close}>
      <div
        className="modal search-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-title">
          <div>
            <small>全局搜索</small>
            <h2>查找工作台记录</h2>
          </div>
          <button onClick={close}>×</button>
        </div>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索学生、课程、请假原因或团务记录…"
        />
        {results.map((r: any) => (
          <button
            className="search-result"
            key={r.module + r.id}
            onClick={() => {
              if (r.module === "学生") select(r);
              else go(r.module);
            }}
          >
            <span>{title[r.module]}</span>
            <div>
              <b>{r.name}</b>
              <small>
                {r.className} · {r.detail}
              </small>
            </div>
          </button>
        ))}
        {query && !results.length && <p className="empty">没有找到匹配记录</p>}
      </div>
    </div>
  );
}
function StudentDetail({ student, close, say }: { student: Student; close: () => void; say: (x: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(student);
  const change = (key: keyof Student, value: string) => setDraft({ ...draft, [key]: value });
  const save = async () => {
    try { const r = await fetch("/api/students", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) }); const data = await r.json(); if (!r.ok) throw new Error(data.error); setDraft(data); setEditing(false); say("学生档案已保存"); } catch (e: any) { say(e.message || "保存失败，请重试。"); }
  };
  const field = (label: string, key: keyof Student, placeholder = "") => editing ? <label className="profile-field"><small>{label}</small><input value={String(draft[key] || "")} placeholder={placeholder} onChange={e => change(key, e.target.value)} /></label> : <Detail l={label} v={String(draft[key] || "未填写")} />;
  return (
    <div className="backdrop" onMouseDown={close}>
      <div
        className="modal student-detail"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-title">
          <div>
            <small>学生完整档案</small>
            <h2>{draft.name}</h2>
          </div>
          <button onClick={close}>×</button>
        </div>
        <div className="student-profile">
          <div className="student-photo">{draft.name[0]}</div>
          <div>
            {editing ? <input className="profile-name" value={draft.name} onChange={e => change("name", e.target.value)} /> : <b>{draft.name}</b>}
            <p>
              {draft.grade}{draft.className} · {editing ? <select value={draft.sex} onChange={e => change("sex", e.target.value)}><option>男</option><option>女</option></select> : draft.sex} · 学号 {draft.studentNo}
            </p>
          </div>
        </div>
        <div className="detail-grid">
          {field("家长 / 监护人 1 姓名", "guardian1Name", "例如：张女士")}
          {field("亲属关系", "guardian1Relation", "例如：妈妈")}
          {field("家长 / 监护人 1 手机号", "guardian1Phone")}
          {field("家长 / 监护人 2 姓名", "guardian2Name", "例如：李先生")}
          {field("亲属关系", "guardian2Relation", "例如：爸爸、爷爷、奶奶")}
          {field("家长 / 监护人 2 手机号", "guardian2Phone")}
          {field("寝室号", "dormitory", "例如：3-502")}
          {field("家庭住址", "address")}
          {field("政治面貌", "political")}
          {field("状态", "status")}
          {field("备注", "remark")}
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={close}>
            关闭
          </button>
          {editing ? <button className="primary" onClick={save}>保存修改</button> : <button className="primary" onClick={() => setEditing(true)}>编辑档案</button>}
        </div>
      </div>
    </div>
  );
}
function Detail({ l, v }: { l: string; v: string }) {
  return (
    <div>
      <small>{l}</small>
      <b>{v}</b>
    </div>
  );
}
function Stat({ n, l, t, a }: any) {
  return (
    <div className={"stat " + (a ? "alert" : "")}>
      <small>{l}</small>
      <b>{n}</b>
      <p>{t}</p>
    </div>
  );
}
function Title({ label, title: tt, btn, onClick }: any) {
  return (
    <div className="card-title">
      <div>
        <small>{label}</small>
        <h2>{tt}</h2>
      </div>
      {btn && <button onClick={onClick}>{btn}</button>}
    </div>
  );
}
function Event({ time, title, sub, type }: any) {
  return (
    <div className="event">
      <time>{time}</time>
      <i className={type} />
      <div>
        <b>{title}</b>
        <small>{sub}</small>
      </div>
      <button>···</button>
    </div>
  );
}
