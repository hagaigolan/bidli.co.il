import { useParams, Link } from "react-router-dom";
import { ArrowRight, Clock, Calendar, Tag, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ARTICLES } from "./ArticlesData.jsx";

export default function ArticleDetail() {
  const { id } = useParams();
  const article = ARTICLES.find(a => a.id === id);

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">המאמר לא נמצא</h2>
          <Link to="/articles" className="text-sm" style={{ color: "#f700ff" }}>חזרה לכל המאמרים</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-gray-100 py-6 px-4" style={{ background: "linear-gradient(135deg, #f700ff08, #9d00ff05)" }}>
        <div className="max-w-4xl mx-auto">
          <Link to="/articles" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" />
            חזרה לכל המאמרים
          </Link>
          
          <div className="flex items-center gap-2 mb-4">
            {article.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "#f700ff10", color: "#f700ff" }}>{tag}</span>
            ))}
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 mb-4">{article.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{article.readTime} דק׳ קריאה</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(article.date).toLocaleDateString("he-IL")}</span>
            <span>✍️ {article.author}</span>
          </div>

          <button className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
            <Share2 className="h-4 w-4" />
            שתף מאמר
          </button>
        </div>
      </div>

      {/* Featured Image */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-2xl overflow-hidden mb-8">
          <img src={article.image} alt={article.title} className="w-full h-96 object-cover" />
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-black text-gray-900 mt-8 mb-4" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2" {...props} />,
              p: ({node, ...props}) => <p className="text-gray-600 leading-relaxed mb-4" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-600 mb-4 mr-4" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-600 mb-4 mr-4" {...props} />,
              li: ({node, ...props}) => <li className="mb-1" {...props} />,
              a: ({node, ...props}) => <a className="text-[#f700ff] hover:underline" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        <div className="border-t border-gray-100 pt-6 mt-8">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">תגיות:</span>
            {article.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#f700ff10", color: "#f700ff" }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Related Articles */}
        <div className="border-t border-gray-100 pt-8 mt-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">מאמרים נוספים</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {ARTICLES.filter(a => a.id !== id).slice(0, 4).map(related => (
              <Link key={related.id} to={`/articles/${related.id}`}
                className="p-4 border border-gray-100 rounded-xl hover:border-[#f700ff33] transition-all group">
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#f700ff] transition-colors">{related.title}</h3>
                <p className="text-sm text-gray-500">{related.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}