import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

// לוכד הפניה של "הזמן חבר" — שומר את מקור ההגעה במכשיר ומדווח על ביקור ממוקד
export default function ReferralCapture() {
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("ref");
    if (!raw) return;
    const ref = decodeURIComponent(raw).trim().slice(0, 120);
    if (!ref) return;
    if (localStorage.getItem("bidli_ref")) return;
    try {
      localStorage.setItem("bidli_ref", ref);
      base44.analytics.track({ eventName: "referral_visit" });
    } catch {}
  }, []);

  return null;
}