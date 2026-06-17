import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Upload, ArrowRight, Image, Tag, MapPin, DollarSign, FileText, CheckCircle } from "lucide-react";

const CATEGORIES = ["אמנות", "יודאיקה", "אספנות", "נומיסמטיקה", "תכשיטים", "עיצוב הבית", "אופנה", "רכבים", 'נדל"ן', "אחר"];
const CONDITIONS = ["חדש", "מצב מעולה", "מצב טוב", "מצב בינוני"];

export default function UploadProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", category: "", condition: "מצב מעולה",
    starting_price: "", location: "", seller_name: "", seller_email: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.starting_price) { setError("יש למלא כותרת ומחיר התחלתי"); return; }
    setLoading(true);
    setError("");
    try {
      let image_url = "";
      if (imageFile) {
        const res = await base44.integrations.Core.UploadFile({ file: imageFile });
        image_url = res.file_url;
      }
      const ends_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const startingPrice = parseFloat(form.starting_price);
      await base44.entities.Product.create({
        ...form,
        starting_price: startingPrice,
        current_price: startingPrice,
        image_url,
        ends_at,
        status: "active",
        bid_count: 0,
      });
      setDone(true);
    } catch (err) {
      setError("שגיאה בהעלאה, נסה שנית");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6" dir="rtl">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #f700ff22, #9d00ff11)", border: "2px solid #f700ff44" }}>
            <CheckCircle className="h-8 w-8" style={{ color: "#f700ff" }} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">המוצר פורסם!</h2>
          <p className="text-gray-500 text-sm mb-6">המכרז יפתח מיידית ויסתיים בעוד 24 שעות. ההצעה הגבוהה ביותר תזכה.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate("/auctions")}
              className="text-white text-sm px-6 py-2.5 rounded-xl font-semibold"
              style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
              לכל המכרזים
            </button>
            <button onClick={() => { setDone(false); setForm({ title:"",description:"",category:"",condition:"מצב מעולה",starting_price:"",location:"",seller_name:"",seller_email:"" }); setImageFile(null); setImagePreview(null); }}
              className="text-gray-600 text-sm px-6 py-2.5 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50">
              העלה מוצר נוסף
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900">העלאת מוצר למכרז</h1>
            <p className="text-xs text-gray-400 mt-0.5">המוצר יפורסם ל-24 שעות — ההצעה הגבוהה ביותר תזכה</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">תמונת המוצר</label>
          <label className="relative flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#f700ff66] transition-all bg-gray-50 overflow-hidden">
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Image className="h-10 w-10" />
                <p className="text-sm">לחץ להעלאת תמונה</p>
                <p className="text-xs">JPG, PNG עד 10MB</p>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </label>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">כותרת המוצר *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="לדוגמה: ציור שמן מקורי של אמן ישראלי"
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] focus:ring-2 focus:ring-[#f700ff22] transition-all text-right" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">תיאור המוצר</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="תאר את המוצר בפירוט — מצב, גיל, מידות, היסטוריה..."
              rows={4}
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] focus:ring-2 focus:ring-[#f700ff22] transition-all text-right resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">קטגוריה</label>
              <select value={form.category} onChange={e => set("category", e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] transition-all text-right">
                <option value="">בחר קטגוריה</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">מצב המוצר</label>
              <select value={form.condition} onChange={e => set("condition", e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] transition-all text-right">
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="p-4 rounded-2xl" style={{ background: "linear-gradient(135deg, #f700ff08, #9d00ff05)", border: "1px solid #f700ff22" }}>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
            <DollarSign className="h-4 w-4" style={{ color: "#f700ff" }} />
            מחיר התחלתי (₪) *
          </label>
          <input type="number" min="1" value={form.starting_price} onChange={e => set("starting_price", e.target.value)}
            placeholder="0"
            className="w-full px-4 py-3 text-lg font-bold bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] focus:ring-2 focus:ring-[#f700ff22] transition-all text-right" />
          <p className="text-xs text-gray-400 mt-2">המכרז יפתח במחיר זה ויימשך 24 שעות. ההצעה הגבוהה ביותר בסיום תזכה.</p>
        </div>

        {/* Seller Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">פרטי המוכר</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">שם</label>
              <input value={form.seller_name} onChange={e => set("seller_name", e.target.value)}
                placeholder="שם מלא"
                className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] transition-all text-right" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">אימייל</label>
              <input type="email" value={form.seller_email} onChange={e => set("seller_email", e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] transition-all text-right" dir="ltr" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">מיקום</label>
            <input value={form.location} onChange={e => set("location", e.target.value)}
              placeholder="עיר / אזור"
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] transition-all text-right" />
          </div>
        </div>

        {/* Timer info */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "linear-gradient(135deg, #00f7ff, #0088ff)" }}>
            <span className="text-white text-xs font-bold">24</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">טיימר 24 שעות</p>
            <p className="text-xs text-gray-500 mt-0.5">המכרז יתחיל מיד עם הפרסום ויסתיים בדיוק 24 שעות לאחר מכן. כל המציעים יוכלו לראות את הטיימר בזמן אמת.</p>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm text-red-600 bg-red-50 border border-red-100">{error}</div>
        )}

        <button type="submit" disabled={loading}
          className="w-full text-white text-sm py-3.5 rounded-xl font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)", boxShadow: "0 0 20px #f700ff44" }}>
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> מפרסם...</>
          ) : (
            <><Upload className="h-4 w-4" /> פרסם מכרז</>
          )}
        </button>
      </form>
    </div>
  );
}