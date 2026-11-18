import { useParams, Link } from "react-router-dom";
import { ArrowRight, Clock, Calendar, Tag, Share2 } from "lucide-react";
import ArticleContent from "@/components/article/ArticleContent";
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { setPageMeta } from "@/lib/seo";
import { ARTICLES } from "./ArticlesData.jsx";
import ArticleAuctionCta from "@/components/ArticleAuctionCta";
import QuickAnswer from "@/components/seo/QuickAnswer";

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  // טעינה — קודם מהמגזין החי (מאמרים שפורסמו), ואם לא — מהמאמרים ההיסטוריים
  useEffect(() => {
    let done = false;
    setLoading(true);
    setArticle(null);

    base44.entities.Article.get(id)
      .then(a => {
        if (a && a.status === "published") {
          done = true;
          setArticle({
            id: a.id, title: a.title, excerpt: a.excerpt, content: a.content,
            tags: a.tags || [], image: a.cover_image_url, author: a.author,
            readTime: a.read_time, date: a.published_date || a.created_date,
            is_price_guide: a.is_price_guide, price_updated_at: a.price_updated_at,
            updated: a.updated_date, sources: a.sources || [],
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!done) {
          const staticA = ARTICLES.find(a => a.id === id);
          if (staticA) setArticle({ ...staticA, is_price_guide: false });
        }
        setLoading(false);
      });

    base44.entities.Article.filter({ status: "published" }, "-published_date", 5)
      .then(items => setRelated(items.filter(a => a.id !== id).slice(0, 4).map(a => ({
        id: a.id, title: a.title, excerpt: a.excerpt,
      }))))
      .catch(() => {});
  }, [id]);

  // SEO: כותרת, תיאור, תמונה ונתונים מובנים למאמר
  useEffect(() => {
    if (!article) return;
    setPageMeta({
      title: `${article.title} | מאמרי bidli`,
      description: article.excerpt,
      image: article.image,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.excerpt,
        image: article.image ? [article.image] : undefined,
        datePublished: article.date,
        dateModified: article.updated || article.date,
        inLanguage: "he",
        // ייחוס אמיתי: מאמר שנכתב בידי אדם מיוחס לאדם, תוכן מערכתי/סוכני — לארגון
        author: article.author && !/AI|סוכן/i.test(article.author)
          ? { "@type": "Person", name: article.author }
          : { "@type": "Organization", name: "bidli" },
        publisher: { "@type": "Organization", name: "bidli" },
        mainEntityOfPage: window.location.href,
      },
    });
  }, [article?.id, article?.title]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
    </div>
  );

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">המאמר לא נמצא</h2>
          <Link to="/articles" className="text-sm" style={{ color: "#e5893d" }}>חזרה לכל המאמרים</Link>
        </div>
      </div>
    );
  }

  const relatedList = related.length > 0
    ? related
    : ARTICLES.filter(a => a.id !== id).slice(0, 4).map(a => ({ id: a.id, title: a.title, excerpt: a.excerpt }));

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-gray-100 py-6 px-4" style={{ background: "linear-gradient(135deg, #e5893d08, #3e6b8a05)" }}>
        <div className="max-w-4xl mx-auto">
          <Link to="/articles" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" />
            חזרה לכל המאמרים
          </Link>

          <div className="flex items-center gap-2 mb-4">
            {article.is_price_guide && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "#e5893d" }}>📊 מחירון</span>
            )}
            {article.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "#e5893d10", color: "#e5893d" }}>{tag}</span>
            ))}
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-4">{article.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 flex-wrap">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{article.readTime} דק׳ קריאה</span>
            {article.date && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(article.date).toLocaleDateString("he-IL")}</span>}
            <span>✍️ {article.author}</span>
            {article.is_price_guide && article.price_updated_at && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#00a35c10", color: "#007938" }}>
                מחירים עודכנו: {new Date(article.price_updated_at).toLocaleDateString("he-IL")}
              </span>
            )}
          </div>

          <button className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
            <Share2 className="h-4 w-4" />
            שתף מאמר
          </button>
        </div>
      </div>

      {/* Featured Image */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {article.image && (
          <div className="rounded-2xl overflow-hidden mb-8">
            <img src={article.image} alt={article.title} className="w-full h-96 object-cover" />
          </div>
        )}

        {/* תשובה קצרה בראש המאמר — מה שמנועי חיפוש וכלי AI מצטטים */}
        <QuickAnswer text={article.excerpt} />

        {/* Content — מוצג עם היררכיית כותרות, ריווח וטבלאות לקריאה נוחה */}
        <ArticleContent content={article.content} />

        {/* שקיפות: מי כתב, מתי, ומה הבסיס של המידע */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 mt-8" dir="rtl">
          <p className="text-sm font-bold text-gray-800 mb-1.5">על התוכן הזה</p>
          <p className="text-xs leading-relaxed text-gray-500">
            נכתב על ידי {article.author || "מערכת bidli"}
            {article.date ? ` · פורסם ב-${new Date(article.date).toLocaleDateString("he-IL")}` : ""}
            {article.updated ? ` · עודכן ב-${new Date(article.updated).toLocaleDateString("he-IL")}` : ""}.
            {" "}המאמר הוא מידע כללי ואינו תחליף לבדיקה מקצועית של פריט מסוים.
          </p>
          {Array.isArray(article.sources) && article.sources.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-gray-700 mb-1">מקורות</p>
              <ul className="list-disc list-inside space-y-1">
                {article.sources.map((s, i) => (
                  <li key={i} className="text-xs text-gray-500">
                    {typeof s === "string"
                      ? s
                      : s?.url
                        ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "#3e6b8a" }}>{s.title || s.url}</a>
                        : s?.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-3">
            רוצים בדיקה מקצועית של פריט?{" "}
            <Link to="/experts" className="font-semibold hover:underline" style={{ color: "#e5893d" }}>
              מומחים ב-bidli
            </Link>
          </p>
        </div>

        {/* Tags */}
        <div className="border-t border-gray-100 pt-6 mt-8">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">תגיות:</span>
            {article.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#e5893d10", color: "#e5893d" }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Related Articles */}
        {relatedList.length > 0 && (
          <div className="border-t border-gray-100 pt-8 mt-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">מאמרים נוספים</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {relatedList.map(relatedArticle => (
                <Link key={relatedArticle.id} to={`/articles/${relatedArticle.id}`}
                  className="p-4 border border-gray-100 rounded-xl hover:border-[#e5893d33] transition-all group">
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#e5893d] transition-colors">{relatedArticle.title}</h3>
                  <p className="text-sm text-gray-500">{relatedArticle.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* מכרזים פעילים בקטגוריית המאמר — המרת קוראים למציעים */}
        <ArticleAuctionCta category={article.category} />
      </div>
    </div>
  );
}