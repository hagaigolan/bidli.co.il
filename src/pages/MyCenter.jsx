import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { isLiveAuction } from "@/lib/countdown";
import CenterItem from "@/components/center/CenterItem";
import CenterSection from "@/components/center/CenterSection";
import { Trophy, AlertTriangle, Heart, Sparkles, LayoutDashboard, ArrowLeft } from "lucide-react";

const DAY = 24 * 60 * 60 * 1000;

export default function MyCenter() {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [data, setData] = useState({ leading: [], outbid: [], ending: [], matches: [], myAmounts: {} });

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!isAuthenticated || !user?.email) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const email = String(user.email).toLowerCase();

      const [bidsPage, favPage, alerts] = await Promise.all([
        base44.entities.Bid.filter({ bidder_email: user.email }, { sort: "-created_date", limit: 100 }),
        base44.entities.Favorite.filter({ owner_key: user.email }, { sort: "-created_date", limit: 100 }),
        base44.entities.InterestAlert.filter({ owner_email: user.email, active: true }),
      ]);

      const myBids = bidsPage?.items || [];
      const favorites = favPage?.items || [];
      const ids = [...new Set([...myBids, ...favorites].map((x) => x.product_id).filter(Boolean))];

      const myAmounts = {};
      myBids.forEach((b) => {
        const prev = myAmounts[b.product_id] || 0;
        if (Number(b.amount) > prev) myAmounts[b.product_id] = Number(b.amount);
      });

      // שליפת הפריטים לפי מזהה — כל פריט בנפרד, כדי שלא לאבד פריטים בשאילתת רשימה
      const products = ids.length
        ? await Promise.all(ids.slice(0, 40).map((id) => base44.entities.Product.get(id).catch(() => null)))
        : [];
      const byId = new Map(products.filter(Boolean).map((p) => [p.id, p]));

      const leading = [];
      const outbid = [];
      ids.forEach((id) => {
        const product = byId.get(id);
        if (!isLiveAuction(product)) return;
        const isLeading = String(product.highest_bidder_email || "").toLowerCase() === email;
        if (isLeading) leading.push(product);
        else if (myAmounts[id]) outbid.push(product);
      });

      const ending = favorites
        .map((f) => byId.get(f.product_id))
        .filter((p) => isLiveAuction(p) && new Date(p.ends_at).getTime() - Date.now() < DAY)
        .sort((a, b) => new Date(a.ends_at) - new Date(b.ends_at));

      const categories = [...new Set((alerts || []).flatMap((a) => a.categories || []))];
      let matches = [];
      if (categories.length) {
        const found = await base44.entities.Product.filter(
          { status: "active", category: { $in: categories } },
          { sort: "-created_date", limit: 6 }
        );
        matches = (found?.items || []).filter((p) => isLiveAuction(p) && !ids.includes(p.id)).slice(0, 4);
      }

      if (cancelled) return;
      setData({ leading, outbid, ending: ending.slice(0, 4), matches, myAmounts });
      setLoading(false);
    };
    load().catch(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.email]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md text-center">
          <LayoutDashboard className="h-10 w-10 mx-auto mb-3" style={{ color: "#e5893d" }} aria-hidden="true" />
          <h1 className="text-xl font-black text-gray-900 mb-1">המרכז שלי</h1>
          <p className="text-sm text-gray-500 mb-4">התחברו כדי לראות את המכרזים שאתם מובילים, פריטים שנגמרים בקרוב והתאמות לתחומי העניין שלכם.</p>
          <Link to="/login" className="inline-block text-white text-sm font-bold px-5 py-2.5 rounded-xl" style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
            התחברות
          </Link>
        </div>
      </div>
    );
  }

  const isEmpty = !loading && !data.leading.length && !data.outbid.length && !data.ending.length && !data.matches.length;

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard className="h-5 w-5" style={{ color: "#e5893d" }} aria-hidden="true" />
          <h1 className="text-xl font-black text-gray-900">המרכז שלי</h1>
        </div>
        <p className="text-sm text-gray-400 mb-6">כל מה שדורש את תשומת הלב שלך עכשיו, במקום אחד.</p>

        {loading ? (
          <div className="space-y-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[88px] rounded-2xl bg-gray-50 animate-pulse" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="p-6 rounded-2xl text-center" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
            <Sparkles className="h-8 w-8 mx-auto mb-2" style={{ color: "#e5893d" }} aria-hidden="true" />
            <p className="text-sm font-bold text-gray-800 mb-1">עוד אין מכרזים פעילים שלך</p>
            <p className="text-xs text-gray-500 mb-4">התחילו במכרז שמסתיים בקרוב — כאן יופיעו הפריטים שאתם מובילים עליהם.</p>
            <Link to="/auctions" className="inline-flex items-center gap-1.5 text-white text-sm font-bold px-4 py-2 rounded-xl" style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              למכרזים הפעילים
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <>
            {data.outbid.length > 0 && (
              <CenterSection icon={AlertTriangle} title="עקפו אותך" subtitle="ההצעה שלך כבר לא הגבוהה — אפשר לחזור ולהוביל" accent="#dc2626">
                {data.outbid.slice(0, 3).map((p) => (
                  <CenterItem key={p.id} product={p} tone="outbid" myAmount={data.myAmounts[p.id]} now={now} />
                ))}
              </CenterSection>
            )}

            {data.leading.length > 0 && (
              <CenterSection icon={Trophy} title="אתה מוביל" subtitle="שמרו על ההובלה עד סיום המכרז" accent="#047857">
                {data.leading.slice(0, 3).map((p) => (
                  <CenterItem key={p.id} product={p} tone="leading" myAmount={data.myAmounts[p.id]} now={now} />
                ))}
              </CenterSection>
            )}

            {data.ending.length > 0 && (
              <CenterSection icon={Heart} title="מהמועדפים שלך נגמר היום" subtitle="פריטים ששמרת שמסתיימים ב-24 השעות הקרובות" accent="#1d4ed8">
                {data.ending.map((p) => (
                  <CenterItem key={p.id} product={p} tone="watch" myAmount={data.myAmounts[p.id]} now={now} />
                ))}
              </CenterSection>
            )}

            {data.matches.length > 0 && (
              <CenterSection icon={Sparkles} title="חדש בתחומי העניין שלך" subtitle="מכרזים שנפתחו בקטגוריות שאתה עוקב אחריהן" accent="#c2410c">
                {data.matches.map((p) => (
                  <CenterItem key={p.id} product={p} tone="match" now={now} />
                ))}
              </CenterSection>
            )}

            <Link to="/auctions" className="inline-flex items-center gap-1.5 text-sm font-bold mt-2" style={{ color: "#e5893d" }}>
              לכל המכרזים הפעילים
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}