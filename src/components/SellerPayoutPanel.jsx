import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createSellerSetup } from "@/functions/createSellerSetup";
import { confirmSellerPayout } from "@/functions/confirmSellerPayout";
import { CreditCard, Lock, Loader2, ShieldCheck, CheckCircle } from "lucide-react";

function PayoutForm({ sellerEmail, setupIntentId, onRegistered }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");
    const { error: err } = await stripe.confirmSetup({ elements, redirect: "if_required" });
    if (err) {
      setError(err.message || "שגיאה בשמירת הכרטיס");
      setLoading(false);
      return;
    }
    try {
      const res = await confirmSellerPayout({ seller_email: sellerEmail, setup_intent_id: setupIntentId });
      const data = res?.data ?? res;
      onRegistered?.({ last4: data.last4, brand: data.brand, saved: data.saved });
    } catch (e2) {
      setError(e2?.response?.data?.error || e2?.message || "שגיאה בשמירת הכרטיס");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" dir="rtl">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
        style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> שומר כרטיס…</>
        ) : (
          <><Lock className="h-4 w-4" /> שמור כרטיס לקבלת התשלום</>
        )}
      </button>
      <p className="text-xs text-gray-400 text-center">
        הכרטיס נשמר באופן מאובטח אצל Stripe. החיוב לקבלת הכסף יתבצע רק לאחר שהקונה יאשר קבלת המוצר.
      </p>
    </form>
  );
}

export default function SellerPayoutPanel({ sellerEmail, onRegistered }) {
  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [setupIntentId, setSetupIntentId] = useState(null);
  const [publishable, setPublishable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [iframeBlocked, setIframeBlocked] = useState(false);

  const start = async () => {
    if (window.self !== window.top) {
      setIframeBlocked(true);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await createSellerSetup({ seller_email: sellerEmail });
      const data = res?.data ?? res;
      setClientSecret(data.client_secret);
      setSetupIntentId(data.setup_intent_id);
      setPublishable(data.publishable_key);
      setOpen(true);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "שגיאה בפתיחת טופס הכרטיס");
    }
    setLoading(false);
  };

  if (iframeBlocked) {
    return (
      <div className="text-xs text-gray-500 text-center" dir="rtl">
        🔒 הזנת כרטיס זמינה רק באפליקציה המפורסמת.
        <a
          href="https://bid-it-now-app.base44.app/seller-payout"
          target="_blank"
          rel="noreferrer"
          className="block mt-1 font-bold"
          style={{ color: "#f700ff" }}
        >
          פתח בחלון חדש →
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl text-sm font-bold text-green-700 bg-green-50" dir="rtl">
        <CheckCircle className="h-4 w-4" /> כרטיס נשמר ({done.brand} ···· {done.last4}) — הופנה ל-{done.saved} מכירות
      </div>
    );
  }

  if (open && clientSecret && publishable) {
    const stripePromise = loadStripe(publishable);
    return (
      <div className="p-4 rounded-2xl border border-gray-100" dir="rtl">
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PayoutForm
            sellerEmail={sellerEmail}
            setupIntentId={setupIntentId}
            onRegistered={(info) => { setDone(info); onRegistered?.(info); }}
          />
        </Elements>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl border border-gray-100 text-center" dir="rtl">
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <button
        onClick={start}
        disabled={loading}
        className="w-full text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
        style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> מכין טופס…</>
        ) : (
          <><CreditCard className="h-4 w-4" /> הזן כרטיס לקבלת התשלום</>
        )}
      </button>
    </div>
  );
}