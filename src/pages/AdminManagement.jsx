import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Users, Gavel, BookOpen, Lock, ShieldCheck, GraduationCap } from "lucide-react";
import UsersSection from "@/components/admin/UsersSection";
import AdminAuctionsSection from "@/components/admin/AdminAuctionsSection";
import MagazineSection from "@/components/admin/MagazineSection";
import ExpertsSection from "@/components/admin/ExpertsSection";
import SendEmailModal from "@/components/admin/SendEmailModal";

// עמוד ניהול משתמשים ומכרזים — נגיש לאדמינים בלבד
export default function AdminManagement() {
  const { user } = useAuth();
  const [status, setStatus] = useState("checking"); // checking | allowed | denied
  const [tab, setTab] = useState("users");
  const [emailTo, setEmailTo] = useState(null);

  useEffect(() => {
    if (!user) { setStatus("denied"); return; }
    base44.entities.User.filter({ email: user.email })
      .then(us => setStatus(us.length > 0 && us[0].role === "admin" ? "allowed" : "denied"))
      .catch(() => setStatus("denied"));
  }, [user?.email]);

  if (status === "checking") return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
    </div>
  );

  if (status === "denied") return (
    <div className="min-h-[60vh] flex items-center justify-center px-4" dir="rtl">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "#ef444408", border: "1px solid #ef444433" }}>
          <Lock className="h-7 w-7 text-red-500" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-black text-gray-900 mb-2">אין הרשאה</h1>
        <p className="text-sm text-gray-400 mb-5">
          {user
            ? "עמוד זה נגיש למנהלי המערכת בלבד."
            : "עמוד זה נגיש למנהלי המערכת בלבד. יש להתחבר לחשבון אדמין."}
        </p>
        {!user && (
          <Link to="/login" className="inline-block text-white text-sm px-6 py-2.5 rounded-xl font-bold"
            style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
            התחברות
          </Link>
        )}
      </div>
    </div>
  );

  const openEmail = (to) => setEmailTo(to);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
            <ShieldCheck className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900">ניהול משתמשים ומכרזים</h1>
            <p className="text-xs text-gray-400">מחובר: {user?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("users")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "users" ? "text-white" : "text-gray-600 border border-gray-200 bg-white"}`}
            style={tab === "users" ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)" } : undefined}>
            <Users className="h-4 w-4" aria-hidden="true" /> משתמשים
          </button>
          <button onClick={() => setTab("auctions")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "auctions" ? "text-white" : "text-gray-600 border border-gray-200 bg-white"}`}
            style={tab === "auctions" ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)" } : undefined}>
            <Gavel className="h-4 w-4" aria-hidden="true" /> מכרזים
          </button>
          <button onClick={() => setTab("magazine")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "magazine" ? "text-white" : "text-gray-600 border border-gray-200 bg-white"}`}
            style={tab === "magazine" ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)" } : undefined}>
            <BookOpen className="h-4 w-4" aria-hidden="true" /> מגזין
          </button>
          <button onClick={() => setTab("experts")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "experts" ? "text-white" : "text-gray-600 border border-gray-200 bg-white"}`}
            style={tab === "experts" ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)" } : undefined}>
            <GraduationCap className="h-4 w-4" aria-hidden="true" /> מומחים
          </button>
        </div>

        {tab === "users"
          ? <UsersSection onSendEmail={openEmail} />
          : tab === "magazine"
          ? <MagazineSection />
          : tab === "experts"
          ? <ExpertsSection />
          : <AdminAuctionsSection onSendEmail={openEmail} />}
      </div>

      {emailTo && <SendEmailModal to={emailTo} onClose={() => setEmailTo(null)} />}
    </div>
  );
}