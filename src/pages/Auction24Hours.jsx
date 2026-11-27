import { useEffect } from "react";
import { Link } from "react-router-dom";
import { setPageMeta } from "@/lib/seo";
import GeoPageHeader from "@/components/geo/GeoPageHeader";
import GeoFaq from "@/components/geo/GeoFaq";
import GeoLinkGrid from "@/components/geo/GeoLinkGrid";
import { PATH, PAGE_NAME, QUICK_ANSWER, STEPS, FAQS, CATEGORY_LINKS, TOOL_LINKS } from "./geo/auction-24-hours";

export default function Auction24Hours() {
  useEffect(() => {
    const origin = window.location.origin;
    setPageMeta({
      title: "מכרז 24 שעות — מכרזים אונליין שנמשכים יום אחד בלבד | בידלי",
      description: "מכרז 24 שעות בבידלי: כל מכרז אונליין נמשך יום אחד בלבד, מהפרסום ועד לסגירה. הפרסום וההשתתפות בחינם, התשלום עובר ישירות למוכר בביט או בהעברה בנקאית, ועמלה של 3% נגבית רק על זכייה.",
      keywords: ["מכרז 24 שעות", "מכרז אונליין", "מכרזים אונליין", "מכרז של 24 שעות", "מכרזים של יום אחד", "מכרזים בישראל"],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "בידלי", item: origin },
            { "@type": "ListItem", position: 2, name: PAGE_NAME, item: `${origin}${encodeURI(PATH)}` },
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
        title="מכרז 24 שעות — כל מכרז נמשך יום אחד בלבד"
        lead="מכרז אונליין של 24 שעות: הפריט מפורסם, עומד להצעות ונסגר בתום יום אחד. הפרסום וההשתתפות חינם, והתשלום עובר ישירות מהזוכה למוכר."
        quickAnswer={QUICK_ANSWER}
        breadcrumb={[{ name: PAGE_NAME }]}
      />

      <div className="mx-auto max-w-4xl px-4 py-10">
        <section>
          <h2 className="mb-4 text-2xl font-black text-gray-900 md:text-3xl">מהו מכרז 24 שעות?</h2>
          <div className="space-y-4 text-[15px] leading-8 text-gray-600">
            <p>
              מכרז 24 שעות הוא מכרז אונליין שנמשך יום אחד בלבד: הפריט מפורסם, עומד להצעות, ונסגר בתום 24 שעות מהפרסום. זהו אינו חלון זמן גמיש — הטווח קבוע וידוע מראש, יום אחד בלבד, מרגע הפרסום ועד הסגירה.
            </p>
            <p>
              הפורמט הזה משנה את אופי ההחלטה משני צדי המכרז. בשוק שבו פריטים מפורסמים לאורך שבועות, יום אחד של מכרז מרכז את כל מי שמתעניין בפריט לנקודת זמן אחת ומוגדרת. מי שרוצה להשתתף יודע שיש לו יום אחד להחליט, ומי שמפרסם יודע שהתקופה שבה הפריט עומד להצעות קצרה ומוגדרת.
            </p>
            <p>
              חשוב להבין מה מכרז 24 שעות אינו קובע: הוא אינו קובע מה יהיה מחיר הפריט, והוא אינו מחייב שאף הצעה תוגש. מה שהוא כן קובע הוא מסגרת הזמן — יום אחד שבו אפשר לקחת חלק, ובסיומו המכרז נסגר.
            </p>
            <p>
              השילוב בין שני הפרטים האלה — יום אחד של מכרז, והשתתפות חינם — הוא מה שהופך את הפורמט לפשוט כל כך. אין צורך להתחייב לתהליך ארוך: נכנסים, רואים את הפריט, ויודעים מתי המכרז נסגר. המוכר מפרסם את הפריט בלי עלות, הקונה משתתף בלי עלות, והתשלום עצמו עובר רק בסוף, ישירות למוכר.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-black text-gray-900 md:text-3xl">מכרז של יום אחד — מה זה אומר לקונים</h2>
          <div className="space-y-4 text-[15px] leading-8 text-gray-600">
            <p>
              בשביל קונה, המשמעות היא שההחלטה מתקבלת בתוך יום. אפשר לקרוא את התיאור, להסתכל בתמונות ולהחליט אם לקחת חלק — אבל כל זה קורה בתוך חלון של 24 שעות, ולא לאורך שבועות. מי שמפספס את היום, מפספס את המכרז הזה.
            </p>
            <p>
              ההשתתפות עצמה חינם. אין תשלום על הכניסה למכרז ואין עלות על הגשת הצעות: הקונה משלם רק אם הוא זוכה, ואז נגבית עמלה של 3% על הזכייה. כל עוד לא זכיתם, לא שילמתם דבר על ההשתתפות.
            </p>
            <p>
              החלון הקצר גם מפשט את התכנון. אין צורך לחזור לעמוד הפריט שוב ושוב במשך שבועות: יש רגע מוגדר שבו המכרז נסגר, וכל עוד לא הגעתם לרגע הזה, אפשר לקחת חלק במכרז.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-black text-gray-900 md:text-3xl">מכרז של יום אחד — מה זה אומר למוכרים</h2>
          <div className="space-y-4 text-[15px] leading-8 text-gray-600">
            <p>
              בשביל מוכר, מכרז 24 שעות הוא דרך להעמיד פריט למכירה בתוך יום אחד של חשיפה מרוכזת. פרסום הפריט למכרז חינם: אין תשלום על פתיחת מכרז. גם אין עמלת מכירה — המוכר אינו משלם אחוז מהזכייה, והעמלה של 3% נגבית רק על הזכייה של הקונה.
            </p>
            <p>
              המשמעות המעשית היא שהמוכר יודע מראש מה העלות שלו: פרסום חינם, וללא עמלת מכירה. מה שנשאר הוא לקבל את סכום הזכייה ישירות מהזוכה, בביט או בהעברה בנקאית.
            </p>
            <p>
              מכרז של יום אחד מתאים במיוחד לפריט שמוכן למכירה עכשיו. במקום להשאיר פריט מפורסם לאורך זמן, המכרז מתרכז ביום אחד, ובתומו ברור אם הפריט נמכר ובאיזה סכום — בלי תקופת המתנה ארוכה.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-black text-gray-900 md:text-3xl">איך עובר התשלום בין הזוכה למוכר</h2>
          <div className="space-y-4 text-[15px] leading-8 text-gray-600">
            <p>
              התשלום במכרז 24 שעות מתבצע ישירות בין הזוכה למוכר, ולא דרך גורם אחר. אמצעי התשלום הם ביט או העברה בנקאית, והזוכה מעביר את סכום הזכייה ישירות למוכר.
            </p>
            <p>
              מעל סכום הזכייה מתווספת עמלה של 3%, והיא נגבית רק על זכייה — כלומר רק כאשר קונה זוכה במכרז. המוכר מקבל את סכום הזכייה ואינו משלם עמלת מכירה, ולכן אין ניכוי של אחוז מהסכום שמגיע אליו.
            </p>
            <p>
              ההפרדה הזו היא לב הפורמט: המכרז, הפריט וחלון 24 השעות מוצגים בבידלי, והתשלום עצמו עובר ישירות מהזוכה למוכר — בביט או בהעברה בנקאית.
            </p>
            <p>
              מבחינת המוכר זה אומר דבר אחד פשוט: סכום הזכייה מגיע אליו במלואו, בלי ניכוי עמלת מכירה ובלי גורם נוסף שמטפל בכסף. מבחינת הקונה זה אומר שהעמלה היחידה היא 3% על זכייה, ורק אם הוא זוכה.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-6 text-2xl font-black text-gray-900 md:text-3xl">איך נראה מכרז של 24 שעות, שלב אחרי שלב</h2>
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

        <GeoFaq items={FAQS} title="מכרז 24 שעות — תשובות מפורטות" intro="כמה זמן נמשך המכרז, מה קורה בסגירה, מה עולה כסף ומה לא, ואיך עובר התשלום למוכר." />

        <GeoLinkGrid title="להמשיך מכאן" links={TOOL_LINKS} />

        <GeoLinkGrid title="מכרזים פעילים לפי קטגוריה" links={CATEGORY_LINKS} />

        <div className="mt-12 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-gray-800">רוצים לראות מכרז 24 שעות בפעולה?</p>
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