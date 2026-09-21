import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { setPageMeta } from "@/lib/seo";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { ARTICLES } from "./ArticlesData.jsx";

const staticArticles = ARTICLES.map(a => ({
  id: a.id, title: a.title, excerpt: a.excerpt, tags: a.tags || [],
  image: a.image, author: a.author, readTime: a.readTime, date: a.date,
  is_price_guide: false,
}));

export default function Articles() {
  const [live, setLive] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageMeta({
      title: "מאמרים ומדריכים על מכרזים, אמנות ואספנות | bidli",
      description: "מדריכי קנייה, מחירונים, טיפים לזיהוי והערכת שווי ותובנות מעולם המכרזים והאספנות — מהמומחים של bidli, פורטל המכרזים בישראל.",
    });
  }, []);

  useEffect(() => {
    base44.entities.Article.filter({ status: "published" }, "-published_date", 50)
      .then(items => setLive(items.map(a => ({
        id: a.id, title: a.title, excerpt: a.excerpt, tags: a.tags || [],
        image: a.cover_image_url, author: a.author, readTime: a.read_time,
        date: a.published_date || a.created_date,
        is_price_guide: a.is_price_guide,
      }))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const articles = [...live, ...staticArticles];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero */}
      <div className="border-b border-gray-100 py-10 px-4" style={{ background: "linear-gradient(135deg, #e5893d08, #3e6b8a05)" }}>
        <div className="max-w-5xl mx-auto">
          <a href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" />
            חזרה לדף הבית
          </a>
          <h1 className="text-3xl font-black text-gray-900 mb-2">מאמרים</h1>
          <p className="text-gray-500 text-sm">מדריכים, מחירונים, טיפים ותובנות לעולם האספנות והמכרזים</p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center p-10 rounded-2xl border border-dashed border-gray-200">
            <p className="text-4xl mb-3">📰</p>
            <p className="font-bold text-gray-700 mb-1">אין מאמרים כרגע</p>
            <p className="text-sm text-gray-400">מאמרים חדשים מתפרסמים כל שבוע</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {articles.map(article => (
              <Link key={article.id} to={`/articles/${article.id}`}
                className="flex flex-col md:flex-row gap-6 bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="w-full md:w-80 h-48 md:h-auto overflow-hidden bg-gray-50 flex-shrink-0">
                  {article.image
                    ? <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">📰</div>}
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      {article.is_price_guide && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "#e5893d" }}>📊 מחירון</span>
                      )}
                      {article.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "#e5893d10", color: "#e5893d" }}>{tag}</span>
                      ))}
                    </div>
                    <h2 className="text-xl font-black text-gray-900 mb-2 group-hover:text-[#e5893d] transition-colors">{article.title}</h2>
                    <p className="text-gray-500 text-sm mb-4">{article.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime} דק׳ קריאה</span>
                    {article.date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(article.date).toLocaleDateString("he-IL")}</span>}
                    <span className="flex items-center gap-1">✍️ {article.author}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}