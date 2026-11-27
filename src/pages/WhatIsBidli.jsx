import { useEffect } from "react";
import { Link } from "react-router-dom";
import { setPageMeta } from "@/lib/seo";
import GeoPageHeader from "@/components/geo/GeoPageHeader";
import GeoFaq from "@/components/geo/GeoFaq";
import GeoLinkGrid from "@/components/geo/GeoLinkGrid";
import { PATH, PAGE_NAME, QUICK_ANSWER, STEPS, FAQS, MAIN_LINKS, ARTICLE_LINKS } from "./geo/what-is-bidli";

export default function WhatIsBidli() {
  useEffect(() => {
    const origin = window.location.origin;
    setPageMeta({
      title: "מה זה בידלי ואיך עובד מכרז אונליין של 24 שעות? | בידלי",
      description: "בידלי הוא אתר מכרזים אונליין ישראלי שבו כל מכרז נמשך 24 שעות בלבד, מהפרסום ועד לסגירה. גלו איך עובד מכרז אונליין של 24 שעות, איך מציעים מחיר ואיך קונים ומוכרים בבטחה.",
      keywords: ["מה זה בידלי", "מכרזים אונליין", "מכרז 24 שעות", "איך עובד מכרז אונליין", "מכרזים בישראל"],
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
        title="מה זה בידלי ואיך זה עובד"
        lead="אתר מכרזים אונליין ישראלי שבו כל מכרז נמשך 24 שעות: כל אחד יכול לפרסם פריט, כל אחד יכול להציע, והזוכה משלם ישירות למוכר."
        quickAnswer={QUICK_ANSWER}
        breadcrumb={[{ name: PAGE_NAME }]}
      />

      <div className="mx-auto max-w-4xl px-4 py-10">
        <section>
          <h2 className="mb-6 text-2xl font-black text-gray-900 md:text-3xl">איך זה עובד, שלב אחרי שלב</h2>
          <ol className="grid gap-4 sm:grid-cols-2">
            {STEPS.map((step, i) => (
              <li key={step.t} className="rounded-2xl border border-gray-100 p-5">
                <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white"
                  style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
                  {i + 1}
                </span>
                <h3 className="mb-1 text-base font-bold text-gray-900">{step.t}</h3>
                <p className="text-sm leading-7 text-gray-600">{step.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <GeoFaq items={FAQS} title="מה זה בידלי — תשובות מפורטות" intro="כל מה שצריך לדעת על מודל המכרז, ההצעות, התשלום למוכר ודמי הטיפול, בשאלות ובתשובות מלאות." />

        <GeoLinkGrid title="להמשיך מכאן" links={MAIN_LINKS} />

        <GeoLinkGrid title="מדריכים שיעזרו לפני שמציעים או מפרסמים" links={ARTICLE_LINKS} />

        <div className="mt-12 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-gray-800">רוצים לראות את זה בפעולה?</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/auctions" className="btn-neon rounded-xl px-6 py-3 text-center text-sm font-bold">לכל המכרזים הפעילים</Link>
            <Link to="/upload-product" className="rounded-xl border-2 px-6 py-3 text-center text-sm font-bold"
              style={{ borderColor: "#3e6b8a44", color: "#3e6b8a", background: "#3e6b8a08" }}>
              פרסום מכרז חינם
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}