import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, RotateCcw } from "lucide-react";

// שלב 13 — חידון אספנות קצר: 3 שאלות, תוצאה מובילה לקטגוריה מתאימה
const QUESTIONS = [
  {
    q: "מה הכי מרתק אותך?",
    options: [
      { text: "ציורים ועבודות אמנות", cat: "אמנות" },
      { text: "פאינים, מטבעות ומהדורות מיוחדות", cat: "נומיסמטיקה" },
      { text: "תכשיטים ושעוני יוקרה", cat: "תכשיטים" },
      { text: "פריטי יודאיקה ומזכרות", cat: "יודאיקה" },
    ],
  },
  {
    q: "מה סגנון הסלון שלך?",
    options: [
      { text: "מינימליסטי ומעוצב", cat: "עיצוב הבית" },
      { text: "קלאסי עם נגיעות וינטג'", cat: "אספנות" },
      { text: "נועז עם פריטים בולטים", cat: "אמנות" },
      { text: "חם ומלא סיפורים אישיים", cat: "יודאיקה" },
    ],
  },
  {
    q: "מה התקציב לפריט מיוחד?",
    options: [
      { text: "עד 500₪ — מציאות שוות", cat: "אספנות" },
      { text: "500-2,000₪ — פריט איכותי", cat: "עיצוב הבית" },
      { text: "2,000-10,000₪ — השקעה אמיתית", cat: "תכשיטים" },
      { text: "השמיים הם הגבול", cat: "אמנות" },
    ],
  },
];

export default function CollectorQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);

  const choose = (cat) => {
    const next = [...answers, cat];
    setAnswers(next);
    setStep(step + 1);
  };

  // קטגוריית התוצאה — הקטגוריה שנבחרה הכי הרבה פעמים
  const result = answers.length === QUESTIONS.length
    ? answers.reduce((a, b, i, arr) => arr.filter(x => x === a).length >= arr.filter(x => x === b).length ? a : b)
    : null;

  return (
    <section className="py-8 sm:py-10" dir="rtl" style={{ background: "linear-gradient(180deg, #fff, #fafafa)" }}>
      <div className="max-w-xl mx-auto px-4">
        <div className="rounded-2xl border p-5 sm:p-7 text-center"
          style={{ borderColor: "#e5893d33", background: "linear-gradient(135deg, #e5893d08, #3e6b8a08)" }}>
          <div className="w-11 h-11 mx-auto rounded-2xl flex items-center justify-center mb-3"
            style={{ background: "#e5893d14", border: "1px solid #e5893d44" }}>
            <Sparkles className="h-5 w-5" style={{ color: "#e5893d" }} />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-1">איזה אספן אתה?</h2>
          <p className="text-xs text-gray-400 mb-5">חידון של 30 שניות — נגלה לך את הקטגוריה שמתאימה לך</p>

          {result ? (
            <div>
              <p className="text-sm text-gray-500 mb-1">הקטגוריה שמתאימה לך:</p>
              <p className="text-2xl font-black gradient-text mb-4">{result}</p>
              <Link to={`/category/${encodeURIComponent(result)}`}
                className="btn-neon inline-block rounded-xl px-8 py-3 text-sm font-bold text-white">
                לצפות במכרזים ב{result}
              </Link>
              <button onClick={() => { setStep(0); setAnswers([]); }}
                className="mt-3 mx-auto flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[#e5893d] transition-colors">
                <RotateCcw className="h-3 w-3" /> התחל מחדש
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-center gap-1.5 mb-4">
                {QUESTIONS.map((_, i) => (
                  <span key={i} className="w-2 h-2 rounded-full transition-all"
                    style={{ background: i <= step ? "#e5893d" : "#e5e7eb", width: i === step ? 20 : 8 }} />
                ))}
              </div>
              <p className="text-sm font-bold text-gray-800 mb-4">{QUESTIONS[step].q}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUESTIONS[step].options.map((opt, i) => (
                  <button key={i} onClick={() => choose(opt.cat)}
                    className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-[#e5893d66] hover:text-[#e5893d] transition-all text-right">
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}