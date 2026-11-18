import GeoLinkGrid from "@/components/geo/GeoLinkGrid";

/** קישורים פנימיים לעמודי הידע המרכזיים — לשיפור ניווט וגילוי. */
export default function MainGuidesSection() {
  return (
    <GeoLinkGrid
      title="מדריכים מרכזיים"
      intro="כל מה שצריך לדעת לפני שמציעים, מוכרים או קונים בבידלי."
      links={[
        { label: "מה זה בידלי ואיך זה עובד", to: "/what-is-bidli", desc: "מכרז של 24 שעות, תשלום ישיר למוכר ודמי טיפול 3%." },
        { label: "כמה שווה פריט?", to: "/how-much-is-it-worth", desc: "הערכת שווי לפי קטגוריה, עם מחירי סגירה אמיתיים מהאתר." },
        { label: "בידלי מול יד2 מול eBay", to: "/bidli-vs-yad2-ebay", desc: "השוואת מודל המכירה, העמלות, התשלום וקהל היעד." },
      ]}
    />
  );
}