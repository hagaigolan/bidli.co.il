import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { setPageMeta } from "@/lib/seo";
import { MapPin, Gavel, ChevronLeft, Flame } from "lucide-react";
import { LANDING_PAGES } from "@/lib/landingContent";

// דף נחיתה לשאילתת חיפוש ממוקדת — מציג את מכרזי הקטגוריה החיים + FAQ עם נתונים מובנים
export default function Landing() {
  const { slug } = useParams();
  const content = LANDING_PAGES[slug];
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!content) return;
    setPageMeta({
      title: content.title,
      description: content.description,
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "FAQPage",
            mainEntity: content.faq.map(f => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "bidli", item: window.location.origin + "/" },
              { "@type": "ListItem", position: 2, name: content.h1 },
            ],
          },
        ],
      },
    });
  }, [slug]);

  useEffect(() => {
    if (!content) return;
    base44.entities.Product.list("-created_date", 200)
      .then(ps => {
        const now = Date.now();
        const active = ps.filter(p =>
          p.status === "active" && p.ends_at && new Date(p.ends_at) > now &&
          content.categories.includes(p.category));
        active.sort((a, b) => new Date(a.ends_at) - new Date(b.ends_at));
        setProducts(active.slice(0, 12));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (!content) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6" dir="rtl">
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900 mb-3">העמוד לא נמצא</h1>
          <Link to="/" className="text-sm font-bold" style={{ color: "#e5893d" }}>חזרה לדף הבית</Link>
        </div>
      </div>
    );
  }

  const hoursLeft = endsAt => {
    const h = Math.max(0, Math.round((new Date(endsAt) - Date.now()) / 3600000));
    return h > 24 ? "מעל יום" : `בעוד ${h} שעות`;
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero */}
      <section className="relative overflow-hidden py-12 sm:py-16" style={{ background: "linear-gradient(180deg, #e5893d0a, #ffffff)" }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4"
            style={{ background: "#e5893d0f", color: "#e5893d", border: "1px solid #e5893d33" }}>
            <Flame className="h-3 w-3" /> מכרזים חיים • מתעדכן כל היום
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 leading-tight">{content.h1}</h1>
          <p className="text-base text-gray-500 mb-6 max-w-xl mx-auto">{content.subtitle}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="#live-auctions" className="text-white text-sm font-bold px-6 py-3 rounded-xl transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              למכרזים החיים עכשיו
            </a>
            <Link to="/auctions" className="text-sm font-bold px-6 py-3 rounded-xl border-2 transition-all hover:bg-orange-50"
              style={{ borderColor: "#e5893d", color: "#e5893d" }}>
              כל המכרזים באתר
            </Link>
          </div>
        </div>
      </section>

      {/* מכרזים חיים בקטגוריה */}
      <section id="live-auctions" className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-black text-gray-900 mb-1">מכרזים חיים עכשיו</h2>
          <p className="text-xs text-gray-400 mb-6">מתעדכן בזמן אמת — המכרזים מסתיימים תוך 24 שעות מפרסומם</p>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => <div key={i} className="aspect-[4/3] rounded-2xl bg-gray-100 animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 text-center">
              <p className="text-sm text-gray-500 mb-3">אין כרגע מכרזים פעילים בקטגוריה זו — חדשים נפתחים כל היום.</p>
              <Link to="/auctions" className="text-sm font-bold" style={{ color: "#e5893d" }}>לצפייה בכל המכרזים</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {products.map(p => (
                <a key={p.id} href={`/auction/${p.id}`}
                  className="block bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:border-transparent transition-all duration-300 card-neon"
                  style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                  <div className="relative overflow-hidden aspect-[4/3] bg-gray-50">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">🏺</div>}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1.5 line-clamp-1">{p.title}</h3>
                    {p.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-1.5">
                        <MapPin className="h-3 w-3" /> <span className="truncate">{p.location}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-black text-sm text-gray-900">₪{(p.current_price || p.starting_price || 0).toLocaleString()}</p>
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-white" style={{ background: "#2d4f68" }}>
                        <Gavel className="h-3 w-3" /> {hoursLeft(p.ends_at)}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ — מוצג גם בתוצאות החיפוש של גוגל דרך נתונים מובנים */}
      <section className="py-10" style={{ background: "linear-gradient(180deg, #fafafa, #fff)" }}>
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-xl font-black text-gray-900 mb-5">שאלות נפוצות</h2>
          <div className="space-y-3">
            {content.faq.map((f, i) => (
              <details key={i} className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <summary className="cursor-pointer text-sm font-bold text-gray-900 list-none">{f.q}</summary>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ניווט בין דפי הנחיתה */}
      <section className="pb-12 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 mb-3">עוד קטגוריות חמות:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(LANDING_PAGES).filter(([s]) => s !== slug).map(([s, c]) => (
              <Link key={s} to={`/landing/${s}`}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold border transition-all hover:bg-orange-50"
                style={{ borderColor: "#e5893d55", color: "#e5893d" }}>
                <ChevronLeft className="h-3 w-3" /> {c.h1.split("—")[0].trim()}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}