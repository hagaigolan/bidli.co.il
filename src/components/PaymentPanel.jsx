import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createPayment } from "@/functions/createPayment";
import { CreditCard, Lock, Loader2, ShieldCheck } from "lucide-react";

function PaymentForm({ amountLabel, onAuthorized }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");
    const { error: err } = await stripe.confirmPayment({ elements, redirect: "if_required" });
    setLoading(false);
    if (err) {
      setError(err.message || "שגיאה בתשלום");
      return;
    }
    setDone(true);
    onAuthorized?.();
  };

  if (done) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-green-700 bg-green-50 rounded-xl">
        <ShieldCheck className="h-4 w-4" /> תשלום אושר — ממתין לעדכון סטטוס…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
        style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> מעבד…
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" /> אישור תשלום {amountLabel}
          </>
        )}
      </button>
      <p className="text-xs text-gray-400 text-center">
        הסכום מוחזק באסקרו. החיוב הסופי יתבצע רק לאחר קבלת המוצר או תוך 3 ימים.
      </p>
    </form>
  );
}

export default function PaymentPanel({ product, bidderEmail, onPaid }) {
  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [publishable, setPublishable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [iframeBlocked, setIframeBlocked] = useState(false);

  const start = async () => {
    if (window.self !== window.top) {
      setIframeBlocked(true);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await createPayment({ product_id: product.id, bidder_email: bidderEmail });
      const data = res?.data ?? res;
      setClientSecret(data.client_secret);
      setPublishable(data.publishable_key);
      setOpen(true);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "שגיאה בפתיחת תשלום");
    }
    setLoading(false);
  };

  if (iframeBlocked) {
    return (
      <div className="px-3 pb-3 pt-2 border-t border-gray-50 text-xs text-gray-500 text-center" dir="rtl">
        🔒 התשלום זמין רק באפליקציה המפורסמת.
        <a
          href="https://bidli.co.il/profile"
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

  if (open && clientSecret && publishable) {
    const stripePromise = loadStripe(publishable);
    return (
      <div className="px-3 pb-3 pt-2 border-t border-gray-50" dir="rtl">
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm
            amountLabel={`₪${(product.current_price || product.starting_price || 0).toLocaleString()}`}
            onAuthorized={onPaid}
          />
        </Elements>
      </div>
    );
  }

  return (
    <div className="px-3 pb-3 pt-2 border-t border-gray-50" dir="rtl">
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <button
        onClick={start}
        disabled={loading}
        className="w-full text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
        style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> מכין…
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" /> רישום כרטיס ואישור ₪
            {(product.current_price || product.starting_price || 0).toLocaleString()}
          </>
        )}
      </button>
      <p className="text-xs text-gray-400 text-center mt-1">
        נדרש כרטיס לאישור הזכייה. החיוב יתבצע רק לאחר קבלת המוצר.
      </p>
    </div>
  );
}