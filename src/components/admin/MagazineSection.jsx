import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Check, X, Pencil, Sparkles, RefreshCw, Eye, EyeOff } from "lucide-react";

// ממשק ניהול המגזין — טיוטות שנוצרו על ידי סוכן ה-AI ממתינות לאישור,
// פרסום/דחייה/עריכה/הורדה מפרסום, ויצירת טיוטה חדשה בלחיצת כפתור.

const TABS = [
  { key: "draft", label: "ממתינות לאישור" },
  { key: "published", label: "מפורסמות" },
  { key: "rejected", label: "נדחו" },
];

function DraftEditor({ article, onSave, onCancel }) {
  const [title, setTitle] = useState(article.title || "");
  const [excerpt, setExcerpt] = useState(article.excerpt || "");
  const [content, setContent] = useState(article.content || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Article.update(article.id, { title, excerpt, content });
      onSave();
    } catch { setSaving(false); }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 mb-4" dir="rtl">
      <div className="space-y-3">
        <input value={title} onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2.5 text-sm font-bold border border-gray-200 rounded-xl text-right" placeholder="כותרת" />
        <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl text-right" placeholder="תקציר" />
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={12}
          className="w-full px-3 py-2.5 text-sm font-mono border border-gray-200 rounded-xl text-right leading-relaxed" placeholder="גוף המאמר (Markdown)" />
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={save} disabled={saving || !title.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
          <Check className="h-4 w-4" /> {saving ? "שומר..." : "שמור שינויים"}
        </button>
        <button onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 bg-white">
          ביטול
        </button>
      </div>
    </div>
  );
}

export default function MagazineSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("draft");
  const [editing, setEditing] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const load = () => {
    setLoading(true);
    base44.entities.Article.list("-created_date", 100)
      .then(setArticles)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setArticleStatus = async (id, status, extra = {}) => {
    try {
      await base44.entities.Article.update(id, { status, ...extra });
      load();
    } catch { setMessage("השמירה נכשלה, נסה שנית"); }
  };

  const approve = (a) => setArticleStatus(a.id, "published", { published_date: new Date().toISOString() });
  const reject = (a) => setArticleStatus(a.id, "rejected");
  const unpublish = (a) => setArticleStatus(a.id, "draft");

  const generateDraft = async () => {
    setGenerating(true); setMessage("");
    try {
      const res = await base44.functions.invoke("generateMagazineDrafts", {});
      if (res?.error) setMessage("היצירה נכשלה: " + res.error);
      else setMessage("טיוטה חדשה נוצרה וממתינה לאישור" + (res?.email_failed ? " (שליחת המייל נכשלה)" : ""));
      setTab("draft");
      load();
    } catch {
      setMessage("היצירה נכשלה — נסה שוב בעוד רגע");
    } finally { setGenerating(false); }
  };

  const filtered = articles.filter(a => a.status === tab);
  const draftsCount = articles.filter(a => a.status === "draft").length;

  return (
    <div dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
            <BookOpen className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900">מגזין bidli</h2>
            <p className="text-xs text-gray-400">טיוטות מסוכן ה-AI ממתינות כאן לסקירתך לפני פרסום</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50">
            <RefreshCw className="h-3.5 w-3.5" /> רענון
          </button>
          <button onClick={generateDraft} disabled={generating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
            {generating
              ? <><Sparkles className="h-3.5 w-3.5 animate-pulse" /> יוצר טיוטה... (עד דקה)</>
              : <><Sparkles className="h-3.5 w-3.5" /> צור טיוטה עכשיו</>}
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 px-4 py-2.5 rounded-xl text-sm font-semibold border"
          style={{ background: "#00c85308", borderColor: "#00c85333", color: "#007938" }}>
          {message}
        </div>
      )}

      <div className="flex gap-2 mb-5">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.key ? "text-white" : "text-gray-600 border border-gray-200 bg-white"}`}
            style={tab === t.key ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)" } : undefined}>
            {t.label}
            {t.key === "draft" && draftsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs font-black"
                style={{ background: tab === "draft" ? "#ffffff33" : "#e5893d15", color: tab === "draft" ? "white" : "#e5893d" }}>
                {draftsCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-10 rounded-2xl border border-dashed border-gray-200 bg-white">
          <p className="text-3xl mb-3">📝</p>
          <p className="font-bold text-gray-700 mb-1">
            {tab === "draft" ? "אין טיוטות ממתינות" : tab === "published" ? "אין מאמרים מפורסמים" : "אין מאמרים נדחים"}
          </p>
          <p className="text-sm text-gray-400">
            {tab === "draft" ? "הטיוטה האוטומטית נוצרת כל יום ראשון ב-09:00, או לחץ ״צור טיוטה עכשיו״" : ""}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(a => (
            <div key={a.id}>
              {editing === a.id ? (
                <DraftEditor article={a}
                  onCancel={() => setEditing(null)}
                  onSave={() => { setEditing(null); load(); }} />
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col sm:flex-row gap-4">
                  {a.cover_image_url && (
                    <img src={a.cover_image_url} alt={a.title}
                      className="w-full sm:w-40 h-28 sm:h-24 rounded-xl object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#3e6b8a10", color: "#3e6b8a" }}>{a.category || "כללי"}</span>
                      {a.is_price_guide && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "#e5893d" }}>📊 מחירון</span>
                      )}
                      {a.source === "ai" && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "#6aa3cd10", color: "#6aa3cd" }}>AI</span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 truncate mb-1">{a.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{a.excerpt}</p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      ✍️ {a.author} · {a.read_time || 7} דק׳ קריאה
                      {a.published_date && ` · ${new Date(a.published_date).toLocaleDateString("he-IL")}`}
                    </p>
                  </div>
                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    {a.status === "draft" && (
                      <>
                        <button onClick={() => approve(a)} title="אישור ופרסום"
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
                          style={{ background: "linear-gradient(135deg, #00c853, #00a35c)" }}>
                          <Check className="h-3.5 w-3.5" /> אישור ופרסום
                        </button>
                        <button onClick={() => reject(a)} title="דחייה"
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">
                          <X className="h-3.5 w-3.5" /> דחייה
                        </button>
                      </>
                    )}
                    {a.status === "published" && (
                      <button onClick={() => unpublish(a)} title="הורדה מפרסום"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">
                        <EyeOff className="h-3.5 w-3.5" /> הורדה מפרסום
                      </button>
                    )}
                    <button onClick={() => setEditing(a.id)} title="עריכה"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">
                      <Pencil className="h-3.5 w-3.5" /> עריכה
                    </button>
                    {a.status === "published" && (
                      <a href={`/articles/${a.id}`} target="_blank" rel="noreferrer" title="צפייה באתר"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">
                        <Eye className="h-3.5 w-3.5" /> צפייה
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}