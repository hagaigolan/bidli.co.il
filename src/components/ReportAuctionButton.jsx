import { useState } from "react";
import { Flag, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const REASONS = ["חשוד", "מזויף", "תוכן פוגעני", "אחר"];

// דיווח על מכרז — כפתור קטן ליד אזור הפעולות, פותח מודאל עם סיבה ותיאור
export default function ReportAuctionButton({ product, user }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const close = () => {
    setOpen(false);
    setReason("");
    setDetails("");
    setError("");
    setSent(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError("יש לבחור סיבת דיווח");
      return;
    }
    setSending(true);
    setError("");
    try {
      await base44.entities.AuctionReport.create({
        auctionId: product.id,
        auctionTitle: product.title || "",
        reporterId: user?.id || "",
        reason,
        details: details.trim().slice(0, 1000),
        createdDate: new Date().toISOString(),
        status: "new",
      });
      setSent(true);
    } catch {
      setError("שליחת הדיווח נכשלה, נסה שנית");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full flex-col sm:w-auto sm:inline-flex sm:flex-shrink-0 sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold leading-tight text-center border transition-all hover:scale-[1.02]"
        style={{ background: "white", borderColor: "#e5e7eb", color: "#9ca3af" }}
      >
        <Flag className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        דווח על מכרז
      </button>

      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
        <DialogContent dir="rtl" className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-right text-base font-black">דיווח על מכרז</DialogTitle>
          </DialogHeader>

          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="h-9 w-9 mx-auto mb-2" style={{ color: "#00a35c" }} aria-hidden="true" />
              <p className="text-sm font-bold text-gray-800">תודה, הדיווח נשלח לבדיקה</p>
              <p className="text-xs text-gray-400 mt-1">בעל האתר יבדוק את הפנייה בהקדם</p>
              <button
                type="button"
                onClick={close}
                className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}
              >
                סגירה
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <p className="text-xs text-gray-400">{product.title}</p>

              <fieldset>
                <legend className="block text-sm font-semibold text-gray-700 mb-2">סיבת הדיווח</legend>
                <div className="grid grid-cols-2 gap-2">
                  {REASONS.map((r) => {
                    const active = reason === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReason(r)}
                        aria-pressed={active}
                        className="py-2 px-3 rounded-xl text-xs font-bold border transition-all"
                        style={active
                          ? { background: "#e5893d15", borderColor: "#e5893d", color: "#e5893d" }
                          : { background: "white", borderColor: "#e5e7eb", color: "#6b7280" }}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <label htmlFor="report-details" className="block text-sm font-semibold text-gray-700 mb-1">
                  תיאור (אופציונלי)
                </label>
                <textarea
                  id="report-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="פרט מה עורר את החשד"
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] text-right resize-none"
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}
              >
                {sending ? "שולח..." : "שליחת דיווח"}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}