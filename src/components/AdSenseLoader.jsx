import { useEffect } from "react";
import { CONSENT_EVENT, readConsent } from "@/components/CookieConsent";

const SCRIPT_ID = "adsbygoogle-js";
const ADSENSE_CLIENT = "ca-pub-3045986264515445";

// טעינת קוד AdSense — רק לאחר הסכמה לעוגיות פרסום, ופעם אחת בלבד
function loadAds() {
  if (document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  document.head.appendChild(script);
}

export default function AdSenseLoader() {
  useEffect(() => {
    if (readConsent() === "granted") loadAds();

    const onConsent = (event) => {
      if (event.detail?.granted) loadAds();
    };
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  return null;
}