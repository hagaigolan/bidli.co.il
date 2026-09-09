import { useLocation, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Home, Gavel, SearchX } from "lucide-react";

export default function PageNotFound() {
  const location = useLocation();
  const pageName = decodeURIComponent(location.pathname.substring(1)) || "/";

  const { data: authData, isFetched } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        return { user, isAuthenticated: true };
      } catch (error) {
        return { user: null, isAuthenticated: false };
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50" dir="rtl">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          {/* קוד השגיאה */}
          <div className="space-y-2">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: "linear-gradient(135deg, #e5893d22, #3e6b8a11)", border: "1px solid #e5893d33" }}>
              <SearchX className="h-8 w-8" style={{ color: "#e5893d" }} aria-hidden="true" />
            </div>
            <h1 className="text-7xl font-black" dir="ltr"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              404
            </h1>
            <div className="h-0.5 w-16 bg-gray-200 mx-auto"></div>
          </div>

          {/* הודעה ראשית */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-800">העמוד לא נמצא</h2>
            <p className="text-gray-500 leading-relaxed">
              הכתובת{" "}
              <span className="font-semibold text-gray-700" dir="ltr">/{pageName}</span>{" "}
              אינה קיימת באתר. ייתכן שהעמוד הוסר, שהקישור שגוי או שהמכרז כבר הסתיים.
            </p>
          </div>

          {/* הערה למנהלים */}
          {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
            <div className="mt-8 p-4 bg-slate-100 rounded-xl border border-slate-200 text-right">
              <p className="text-sm font-semibold text-slate-700 mb-1">הערה למנהל האתר</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                ייתכן שהעמוד טרם מומש באפליקציה — ניתן לבקש מהעוזר החכם להוסיף אותו בצ'אט.
              </p>
            </div>
          )}

          {/* כפתורי פעולה */}
          <div className="pt-6 flex flex-wrap gap-3 justify-center">
            <Link to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              <Home className="w-4 h-4" aria-hidden="true" /> חזרה לדף הבית
            </Link>
            <Link to="/auctions"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-slate-100 transition-colors">
              <Gavel className="w-4 h-4" aria-hidden="true" /> לכל המכרזים
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}