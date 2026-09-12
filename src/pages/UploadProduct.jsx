import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Upload, ArrowRight, Image, DollarSign, CheckCircle, Plus, X } from "lucide-react";
import { SellerFomoBanner, SellerFomoBlock } from "@/components/SellerFomo";

import { CATEGORIES, CONDITIONS } from "@/lib/productMeta";
const PAYMENT_METHOD_LABELS = { kashcash: "קשקאש", bit: "ביט", bank: "העברה בנקאית" };

export default function UploadProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", category: "", condition: "מצב מעולה",
    starting_price: "", location: "", seller_name: "", seller_email: "", seller_phone: "",
    seller_payment_method: "", seller_payme_phone: "", seller_bank_details: "",
    is_stock: false,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isRepublish, setIsRepublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [agreedCopyright, setAgreedCopyright] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then((isAuth) => {
      if (!isAuth) {
        navigate("/login");
      } else {
        setAuthChecked(true);
      }
    });
  }, []);

  // פרסום חוזר — טעינת פרטי מכרז קודם לעריכה מחדש
  useEffect(() => {
    const draft = localStorage.getItem("republish_draft");
    if (!draft) return;
    localStorage.removeItem("republish_draft");
    try {
      const d = JSON.parse(draft);
      setForm(f => ({
        ...f,
        title: d.title || "",
        description: d.description || "",
        category: d.category || "",
        condition: d.condition || f.condition,
        location: d.location || "",
        starting_price: d.starting_price != null ? String(d.starting_price) : "",
        ...(d.seller_name ? { seller_name: d.seller_name, seller_email: d.seller_email, seller_phone: d.seller_phone } : {}),
      }));
      const urls = (Array.isArray(d.image_urls) && d.image_urls.length ? d.image_urls : (d.image_url ? [d.image_url] : [])).filter(Boolean);
      setExistingImages(urls);
      setIsRepublish(true);
    } catch {}
  }, []);

  if (!authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#e5893d] rounded-full animate-spin" />
      </div>
    );
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImageFiles(prev => [...prev, ...files].slice(0, 8));
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))].slice(0, 8));
    e.target.value = "";
  };

  const removeImage = (i) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.starting_price) { setError("יש למלא כותרת ומחיר התחלתי"); return; }
    if (!form.seller_name || !form.seller_email || !form.seller_phone) {
      setError("לצורך פרסום חובה להירשם עם שם, אימייל וטלפון"); return;
    }
    if (!form.seller_payment_method) {
      setError("יש לבחור אמצעי תשלום לקבלת הכסף מהזוכה"); return;
    }
    if (["kashcash", "bit"].includes(form.seller_payment_method) && !form.seller_payme_phone) {
      setError("יש להזין מספר טלפון לקבלת ההעברה"); return;
    }
    if (form.seller_payment_method === "bank" && !form.seller_bank_details) {
      setError("יש להזין פרטי חשבון בנק לקבלת ההעברה"); return;
    }
    if (!agreedCopyright) {
      setError("יש לאשר את ההצהרה על זכויות יוצרים בתמונות ובתיאור המוצר"); return;
    }
    if (!agreedTerms) {
      setError("יש לאשר את תנאי השימוש ומדיניות הפרטיות"); return;
    }
    setLoading(true);
    setError("");
    try {
      let image_urls = [...existingImages];
      for (const f of imageFiles) {
        const res = await base44.integrations.Core.UploadFile({ file: f });
        image_urls.push(res.file_url);
      }
      const image_url = image_urls[0] || "";
      const ends_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      if (form.seller_email) localStorage.setItem("seller_email", form.seller_email);
      const startingPrice = parseFloat(form.starting_price);
      let sellerUserId = "";
      try { sellerUserId = (await base44.auth.me()).id || ""; } catch {}
      await base44.entities.Product.create({
        ...form,
        seller_user_id: sellerUserId,
        starting_price: startingPrice,
        current_price: startingPrice,
        image_url,
        image_urls,
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
        <div className="max-w-md w-full">
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #e5893d22, #3e6b8a11)", border: "2px solid #e5893d44" }}>
              <CheckCircle className="h-8 w-8" style={{ color: "#e5893d" }} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">המוצר פורסם!</h2>
            <p className="text-gray-500 text-sm mb-5">המכרז יפתח מיידית ויסתיים בעוד 24 שעות. ההצעה הגבוהה ביותר תזכה.</p>
          </div>

          {/* קבלת התשלום בהעברה ישירה */}
          <div className="mb-5 p-4 rounded-2xl border border-green-200" style={{ background: "#00c85308" }} dir="rtl">
            <h3 className="text-sm font-bold text-green-800 mb-1">התשלום יתקבל בהעברה ישירה</h3>
            <p className="text-xs text-green-700">הזוכה יעביר אליך את סכום הזכייה דרך {PAYMENT_METHOD_LABELS[form.seller_payment_method] || "האמצעי שהגדרת"}, וההזמנה תסומן כשולמה לאחר שתאשר את קבלת הכסף באזור האישי. הכל ללא כרטיס אשראי וללא עמלות.</p>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate("/auctions")}
              className="text-white text-sm px-6 py-2.5 rounded-xl font-semibold"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              לכל המכרזים
            </button>
            <button onClick={() => { setDone(false); setForm({ title:"",description:"",category:"",condition:"מצב מעולה",starting_price:"",location:"",seller_name:"",seller_email:"",seller_phone:"",seller_payment_method:"",seller_payme_phone:"",seller_bank_details:"",is_stock:false }); setImageFiles([]); setImagePreviews([]); setExistingImages([]); setIsRepublish(false); }}
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
          <button onClick={() => navigate(-1)} aria-label="חזרה לעמוד הקודם" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900">העלאת מוצר למכרז</h1>
            <p className="text-xs text-gray-400 mt-0.5">המוצר יפורסם ל-24 שעות — ההצעה הגבוהה ביותר תזכה</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <SellerFomoBanner />
        {isRepublish && (
          <div className="p-4 rounded-2xl" style={{ background: "#e5893d08", border: "1px solid #e5893d33" }} dir="rtl">
            <p className="text-sm font-bold text-gray-800 mb-0.5">🔄 מכרז חוזר</p>
            <p className="text-xs text-gray-500">כל פרטי המכרז הקודם הועתקו לטופס — ערוך את הפרטים ופרסם מחדש.</p>
          </div>
        )}
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            תמונות המוצר
            <span className="text-xs text-gray-400 font-normal"> — עד 8 תמונות. תמונות נוספות מגדילות את סיכויי המכירה</span>
          </label>
          {imagePreviews.length + existingImages.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {existingImages.map((src, i) => (
                <div key={`ex-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={src} alt={`תמונה קיימת ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))}
                    aria-label={`הסר תמונה ${i + 1}`}
                    className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 right-1 text-xs px-1.5 py-0.5 rounded-full text-white font-bold"
                      style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>ראשית</span>
                  )}
                </div>
              ))}
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={src} alt={`preview ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)}
                    aria-label={`הסר preview ${i + 1}`}
                    className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  {existingImages.length === 0 && i === 0 && (
                    <span className="absolute bottom-1 right-1 text-xs px-1.5 py-0.5 rounded-full text-white font-bold"
                      style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>ראשית</span>
                  )}
                </div>
              ))}
              {imageFiles.length + existingImages.length < 8 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 cursor-pointer hover:border-[#e5893d66] hover:text-[#e5893d] transition-all bg-gray-50">
                  <Plus className="h-6 w-6" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImage} />
                </label>
              )}
            </div>
          ) : (
            <label className="relative flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#e5893d66] transition-all bg-gray-50 overflow-hidden">
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Image className="h-10 w-10" />
                <p className="text-sm">לחץ להעלאת תמונות</p>
                <p className="text-xs">JPG, PNG — אפשר לבחור כמה תמונות ביחד</p>
              </div>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImage} />
            </label>
          )}
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">כותרת המוצר *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="לדוגמה: ציור שמן מקורי של אמן ישראלי"
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] focus:ring-2 focus:ring-[#e5893d22] transition-all text-right" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">תיאור המוצר</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="תאר את המוצר בפירוט — מצב, גיל, מידות, היסטוריה..."
              rows={4}
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] focus:ring-2 focus:ring-[#e5893d22] transition-all text-right resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">קטגוריה</label>
              <select value={form.category} onChange={e => set("category", e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] transition-all text-right">
                <option value="">בחר קטגוריה</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">מצב המוצר</label>
              <select value={form.condition} onChange={e => set("condition", e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] transition-all text-right">
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* סימון כסטוק */}
          <button type="button" onClick={() => set("is_stock", !form.is_stock)} aria-pressed={form.is_stock}
            className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all"
            style={form.is_stock
              ? { borderColor: "#e5893d", background: "#e5893d0f" }
              : { borderColor: "#e5e7eb", background: "white" }}>
            <span className="text-right">
              <span className="block text-sm font-semibold text-gray-700">פרסום בעמוד הסטוקים</span>
              <span className="block text-xs text-gray-400 mt-0.5">המוצר יוצג בעמוד הסטוקים למכירה מהירה</span>
            </span>
            <span className="w-10 h-6 rounded-full flex items-center flex-shrink-0 transition-all p-0.5"
              style={{ background: form.is_stock ? "#e5893d" : "#d1d5db", justifyContent: form.is_stock ? "flex-end" : "flex-start" }}>
              <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </span>
          </button>
        </div>

        {/* Price */}
        <div className="p-4 rounded-2xl" style={{ background: "linear-gradient(135deg, #e5893d08, #3e6b8a05)", border: "1px solid #e5893d22" }}>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
            <DollarSign className="h-4 w-4" style={{ color: "#e5893d" }} />
            מחיר התחלתי (₪) *
          </label>
          <input type="number" min="1" value={form.starting_price} onChange={e => set("starting_price", e.target.value)}
            placeholder="0"
            className="w-full px-4 py-3 text-lg font-bold bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] focus:ring-2 focus:ring-[#e5893d22] transition-all text-right" />
          <p className="text-xs text-gray-400 mt-2">המכרז יפתח במחיר זה ויימשך 24 שעות. ההצעה הגבוהה ביותר בסיום תזכה.</p>
        </div>

        {/* Seller Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            פרטי המוכר <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#e5893d15", color: "#e5893d" }}>חובה לפרסום</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">שם מלא *</label>
              <input value={form.seller_name} onChange={e => set("seller_name", e.target.value)}
                placeholder="שם מלא"
                className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] transition-all text-right" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">אימייל *</label>
              <input type="email" value={form.seller_email} onChange={e => set("seller_email", e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] transition-all text-right" dir="ltr" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">טלפון *</label>
            <input type="tel" value={form.seller_phone} onChange={e => set("seller_phone", e.target.value)}
              placeholder="050-1234567"
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] transition-all text-right" dir="ltr" />
          </div>
          {/* אמצעי תשלום לקבלת הכסף */}
          <div className="p-4 rounded-2xl" style={{ background: "linear-gradient(135deg, #00c85308, #00e67605)", border: "1px solid #00c85322" }}>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">אמצעי תשלום לקבלת הכסף *</label>
            <p className="text-xs text-gray-400 mb-3">הזוכה יעביר אליך את סכום הזכייה ישירות — ללא כרטיס אשראי וללא עמלות.</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[["kashcash", "קשקאש"], ["bit", "ביט"], ["bank", "העברה בנקאית"]].map(([value, label]) => (
                <button key={value} type="button" onClick={() => set("seller_payment_method", value)}
                  className="py-2.5 rounded-xl text-xs font-bold border transition-all"
                  style={form.seller_payment_method === value
                    ? { borderColor: "#00c853", color: "#00c853", background: "#00c85310" }
                    : { borderColor: "#e5e7eb", color: "#6b7280", background: "white" }}>
                  {label}
                </button>
              ))}
            </div>
            {["kashcash", "bit"].includes(form.seller_payment_method) && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">מספר הטלפון לקבלת ההעברה *</label>
                <input type="tel" value={form.seller_payme_phone} onChange={e => set("seller_payme_phone", e.target.value)}
                  placeholder="050-1234567"
                  className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#00c85388] transition-all" dir="ltr" />
              </div>
            )}
            {form.seller_payment_method === "bank" && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">פרטי חשבון בנק *</label>
                <textarea value={form.seller_bank_details} onChange={e => set("seller_bank_details", e.target.value)}
                  placeholder="שם בנק, מספר סניף, מספר חשבון, שם החשבון" rows={3}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#00c85388] transition-all text-right resize-none" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">מיקום</label>
            <input value={form.location} onChange={e => set("location", e.target.value)}
              placeholder="עיר / אזור"
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] transition-all text-right" />
          </div>
        </div>

        {/* Free publishing */}
        <div className="p-4 rounded-2xl" style={{ background: "linear-gradient(135deg, #00c85308, #00e67605)", border: "1px solid #00c85322" }}>
          <p className="text-sm font-semibold text-gray-800 mb-1">✅ פרסום בחינם</p>
          <p className="text-xs text-gray-500">פרסום המכרז והמכירה ללא עלות עבור המוכר</p>
        </div>

        {/* Timer info */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "linear-gradient(135deg, #6aa3cd, #2d4f68)" }}>
            <span className="text-white text-xs font-bold">24</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">טיימר 24 שעות</p>
            <p className="text-xs text-gray-500 mt-0.5">המכרז יתחיל מיד עם הפרסום ויסתיים בדיוק 24 שעות לאחר מכן. כל המציעים יוכלו לראות את הטיימר בזמן אמת.</p>
          </div>
        </div>

        <SellerFomoBlock />

        {/* הצהרות הסכמה חובה לפרסום */}
        <div className="space-y-3">
          <label className="flex items-start gap-2.5 text-xs text-gray-500 leading-relaxed cursor-pointer">
            <input type="checkbox" checked={agreedCopyright} onChange={e => setAgreedCopyright(e.target.checked)}
              className="mt-0.5 accent-[#e5893d]" />
            <span>אני מצהיר/ה כי התמונות ותיאור המוצר הינם שלי או שברשותי הזכויות לפרסומם, וכי פרסומם אינו מפר זכויות יוצרים של צד שלישי.</span>
          </label>
          <label className="flex items-start gap-2.5 text-xs text-gray-500 leading-relaxed cursor-pointer">
            <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)}
              className="mt-0.5 accent-[#e5893d]" />
            <span>קראתי ואני מסכים/ה ל{" "}
              <Link to="/terms?tab=terms" className="underline font-semibold" style={{ color: "#e5893d" }}>תנאי השימוש</Link>
              {" "}ול{" "}
              <Link to="/terms?tab=privacy" className="underline font-semibold" style={{ color: "#e5893d" }}>מדיניות הפרטיות</Link> של bidli.</span>
          </label>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm text-red-600 bg-red-50 border border-red-100" role="alert">{error}</div>
        )}

        <button type="submit" disabled={loading}
          className="w-full text-white text-sm py-3.5 rounded-xl font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 20px #e5893d44" }}>
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