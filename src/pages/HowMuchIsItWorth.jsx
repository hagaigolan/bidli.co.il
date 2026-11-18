import { useEffect } from "react";
import { Link } from "react-router-dom";
import { setPageMeta } from "@/lib/seo";
import GeoPageHeader from "@/components/geo/GeoPageHeader";
import GeoFaq from "@/components/geo/GeoFaq";
import GeoLinkGrid from "@/components/geo/GeoLinkGrid";
import ComparisonTable from "@/components/geo/ComparisonTable";
import { PATH, PAGE_NAME, QUICK_ANSWER, SALES_TABLE, FAQS, CATEGORY_LINKS, TOOL_LINKS } from "./geo/how-much-is-it-worth";

export default function HowMuchIsItWorth() {
  useEffect(() => {
    const origin = window.location.origin;
    setPageMeta({
      title: "כמה שווה הפריט שלי? מדריך הערכת שווי לפי קטגוריות",
      description: "איך מעריכים שווי של שעון, תכשיט, אמנות, יודאיקה, יין, אלקטרוניקה, בולים, אופנה ורכב — עם מחירי סגירה אמיתיים ממכרזים שהסתיימו בבידלי.",
      keywords: ["כמה שווה הפריט שלי", "הערכת שווי", "מחירי סגירה", "שווי שעון יד שנייה", "שווי תכשיטים", "שווי אמנות"],
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
        title="כמה שווה הפריט שלי? מדריך הערכת שווי"
        lead="שווי נקבע לפי מחירי סגירה בפועל של פריטים דומים. בעמוד מרוכזים מחירי סגירה אמיתיים ממכרזים שהסתיימו בבידלי, לפי קטגוריה, יחד עם הגורמים שמשפיעים עליהם."
        quickAnswer={QUICK_ANSWER}
        breadcrumb={[{ name: PAGE_NAME }]}
      />

      <div className="mx-auto max-w-4xl px-4 py-10">
        <section id="closed-sales">
          <h2 className="mb-2 text-2xl font-black text-gray-900 md:text-3xl">מחירי סגירה אמיתיים ממכרזים שהסתיימו בבידלי</h2>
          <p className="mb-4 max-w-3xl text-[15px] leading-8 text-gray-600">
            אלה מחירי הסגירה של פריטים שנמכרו בפועל במכרזים שהסתיימו באתר. המחירים מוצגים כפי שנסגרו, בשקלים, עם תאריך הסגירה — בלי הערכות ובלי מחירי מבוקש.
          </p>
          <ComparisonTable columns={SALES_TABLE.columns} rows={SALES_TABLE.rows} />
        </section>

        <GeoFaq items={FAQS} title="הערכת שווי לפי קטגוריה" intro="לכל קטגוריה יש גורמים משלה שקובעים את השווי. התשובות כאן מפרטות אותם, כולל מחירי סגירה אמיתיים היכן שקיימים." />

        <GeoLinkGrid title="לפי קטגוריה" links={CATEGORY_LINKS} />

        <GeoLinkGrid title="כלים להמשך" links={TOOL_LINKS} />

        <div className="mt-12 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-gray-800">רוצים הערכה לפני שמוציאים מכרז?</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/valuation" className="btn-neon rounded-xl px-6 py-3 text-center text-sm font-bold">להערכת שווי</Link>
            <Link to="/auctions" className="rounded-xl border-2 px-6 py-3 text-center text-sm font-bold"
              style={{ borderColor: "#3e6b8a44", color: "#3e6b8a", background: "#3e6b8a08" }}>
              להשוואה למכרזים פעילים
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}