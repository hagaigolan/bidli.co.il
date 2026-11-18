import { useEffect } from "react";
import { Link } from "react-router-dom";
import { setPageMeta } from "@/lib/seo";
import GeoPageHeader from "@/components/geo/GeoPageHeader";
import GeoFaq from "@/components/geo/GeoFaq";
import GeoLinkGrid from "@/components/geo/GeoLinkGrid";
import ComparisonTable from "@/components/geo/ComparisonTable";
import { PATH, PAGE_NAME, QUICK_ANSWER, TABLE_COLUMNS, TABLE_ROWS, FAQS, LINKS } from "./geo/bidli-vs-yad2-ebay";

export default function BidliVsYad2Ebay() {
  useEffect(() => {
    const origin = window.location.origin;
    setPageMeta({
      title: "בידלי מול יד2 מול eBay — השוואת פלטפורמות מכירה",
      description: "השוואה בין בידלי, יד2 ו-eBay: משך מכרז או מודעה, עמלות, אופן התשלום, קהל היעד, יתרונות וחסרונות — לפני שבוחרים איפה למכור או לקנות.",
      keywords: ["בידלי מול יד2", "בידלי מול eBay", "השוואת אתרי מכרזים", "איפה למכור יד שנייה", "עמלות מכירה"],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "בידלי", item: origin },
            { "@type": "ListItem", position: 2, name: PAGE_NAME, item: `${origin}${PATH}` },
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map(f => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        },
      ],
    });
  }, []);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <GeoPageHeader
        title="בידלי מול יד2 מול eBay"
        lead="שלוש דרכים שונות למכור או לקנות פריט: מכרז קצר בעברית, לוח מודעות מקומי וזירת מסחר עולמית. ההשוואה כאן מציגה את המודל, העמלות, התשלום והקהל של כל אחת."
        quickAnswer={QUICK_ANSWER}
        breadcrumb={[{ name: PAGE_NAME }]}
      />

      <div className="mx-auto max-w-4xl px-4 py-10">
        <section>
          <h2 className="mb-2 text-2xl font-black text-gray-900 md:text-3xl">טבלת השוואה מלאה</h2>
          <p className="mb-4 max-w-3xl text-[15px] leading-8 text-gray-600">
            הנתונים על בידלי הם הנתונים בפועל של הפלטפורמה. הנתונים על יד2 ועל eBay מתארים את המודל המוכר של כל פלטפורמה; עמלות ומחירונים משתנים מעת לעת, ולכן יש לבדוק את המחירון העדכני באתר של כל פלטפורמה לפני פרסום.
          </p>
          <ComparisonTable columns={TABLE_COLUMNS} rows={TABLE_ROWS} highlightColumn={1} />
        </section>

        <GeoFaq items={FAQS} title="שאלות ותשובות על בחירת פלטפורמה" intro="ההבדלים בין הפלטפורמות בפועל — מבחינת מוכר שקובע מחיר, וקונה שמחפש פריט." />

        <GeoLinkGrid title="קישורים רלוונטיים" links={LINKS} />

        <div className="mt-12 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-gray-800">מוכנים לנסות מכרז של 24 שעות?</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/upload-product" className="btn-neon rounded-xl px-6 py-3 text-center text-sm font-bold">פרסום מכרז חינם</Link>
            <Link to="/auctions" className="rounded-xl border-2 px-6 py-3 text-center text-sm font-bold"
              style={{ borderColor: "#3e6b8a44", color: "#3e6b8a", background: "#3e6b8a08" }}>
              לכל המכרזים
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}