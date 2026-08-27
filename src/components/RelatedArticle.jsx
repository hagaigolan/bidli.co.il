import { Link } from "react-router-dom";
import { ARTICLES } from "@/pages/ArticlesData";
import { BookOpen, ArrowLeft } from "lucide-react";

// מיפוי קטגוריה -> מזהה מאמר מומלץ
const CATEGORY_ARTICLE_MAP = {
  "אמנות": "art-collecting-guide",
  "תכשיטים": "jewelry-authentication",
  "בולים": "stamps-collecting",
  "מטבעות": "coins-guide",
  "נומיסמטיקה": "coins-guide",
  "עיצוב הבית": "vintage-furniture",
  "יין ואלכוהול": "wine-collecting",
  "שעונים": "watch-collecting",
  "אספנות": "investment-guide",
  "יודאיקה": "spot-fakes",
  "אופנה": "spot-fakes",
  "רכבים": "auction-guide",
  'נדל"ן': "investment-guide",
  "ספרים": "auction-guide",
  "כלי נגינה": "auction-guide",
  "אלקטרוניקה": "auction-guide",
};

export default function RelatedArticle({ category }) {
  if (!category) return null;
  const articleId = CATEGORY_ARTICLE_MAP[category];
  const article = ARTICLES.find(a => a.id === articleId);
  if (!article) return null;

  return (
    <div className="mt-6" dir="rtl">
      <Link to={`/articles/${article.id}`}
        className="block rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-md group"
        style={{ background: "linear-gradient(135deg, #9d00ff08, #00f7ff05)", borderColor: "#9d00ff33" }}>
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-40 h-32 sm:h-auto flex-shrink-0 overflow-hidden bg-gray-100">
            <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="p-4 flex flex-col justify-center flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <BookOpen className="h-3.5 w-3.5" style={{ color: "#9d00ff" }} />
              <span className="text-xs font-bold" style={{ color: "#9d00ff" }}>מאמר מומלץ לקטגוריית {category}</span>
            </div>
            <h3 className="font-black text-gray-900 text-sm mb-1 group-hover:text-[#9d00ff] transition-colors">{article.title}</h3>
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{article.excerpt}</p>
            <span className="text-xs font-bold flex items-center gap-1" style={{ color: "#9d00ff" }}>
              קרא עכשיו <ArrowLeft className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}