import { Link } from "react-router-dom";
import { ArrowRight, Clock, Calendar, Tag } from "lucide-react";
import { ARTICLES } from "./ArticlesData.jsx";

export default function Articles() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero */}
      <div className="border-b border-gray-100 py-10 px-4" style={{ background: "linear-gradient(135deg, #f700ff08, #9d00ff05)" }}>
        <div className="max-w-5xl mx-auto">
          <a href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" />
            חזרה לדף הבית
          </a>
          <h1 className="text-3xl font-black text-gray-900 mb-2">מאמרים</h1>
          <p className="text-gray-500 text-sm">מדריכים, טיפים ותובנות לעולם האספנות והמכרזים</p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid gap-8">
          {ARTICLES.map(article => (
            <Link key={article.id} to={`/articles/${article.id}`}
              className="flex flex-col md:flex-row gap-6 bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="w-full md:w-80 h-48 md:h-auto overflow-hidden bg-gray-50 flex-shrink-0">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {article.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#f700ff10", color: "#f700ff" }}>{tag}</span>
                    ))}
                  </div>
                  <h2 className="text-xl font-black text-gray-900 mb-2 group-hover:text-[#f700ff] transition-colors">{article.title}</h2>
                  <p className="text-gray-500 text-sm mb-4">{article.excerpt}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime} דק׳ קריאה</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(article.date).toLocaleDateString("he-IL")}</span>
                  <span className="flex items-center gap-1">✍️ {article.author}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}