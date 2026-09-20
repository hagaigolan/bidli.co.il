import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// "בידלי" — publishes one realistic fictional auction per invocation.
// Each run picks the site category with the fewest active fictional listings,
// so every category gets covered before any repeats — and always a category
// different from the previous listing. Invoked every 30 minutes by the
// "Bidli Fictional Sales" scheduled workflow, and on demand by the "bidli"
// in-app agent. Publishes only inside the daily 9:00–22:00 window
// (Asia/Jerusalem) and no-ops outside it.

// כל הקטגוריות הרשומות באתר (src/lib/productMeta.js) — שום קטגוריה לא נשארת ריקה
const CATEGORIES = [
  "אמנות", "יודאיקה", "אספנות", "נומיסמטיקה", "מטבעות", "בולים",
  "תכשיטים", "שעונים", "עיצוב הבית", "אופנה", "ספרים", "כלי נגינה",
  "יין ואלכוהול", "אלקטרוניקה", "רכבים", "נדל\"ן", "אחר",
];

const CONDITIONS = ["חדש", "מצב מעולה", "מצב טוב", "מצב בינוני", "לא תקין"];

// קידומת משותפת לכל המוכרים הפיקטיביים — כל שם מוכר מקבל מזהה ייחודי משלו
const SELLER_USER_ID_PREFIX = "bidli-agent";

// שמות מוכרים פיקטיביים וערים — מתחלפים בכל מכרז שמתפרסם
const SELLER_NAMES = [
  "אבי לוי", "מרים כהן", "יוסי ביטון", "נורית שפירא", "דוד אזולאי",
  "רונית בר", "משה פרידמן", "תמר גרוס", "אלי מזרחי", "יעל אלמוג",
  "שלמה דהן", "ליאת בן-דוד", "עומר לוינסון", "הילה צדוק", "אביב מלכה",
];

const CITIES = [
  "תל אביב", "ירושלים", "חיפה", "באר שבע", "ראשון לציון",
  "פתח תקווה", "נתניה", "אשדוד", "רחובות", "הרצליה",
  "כפר סבא", "בת ים", "רמת גן", "חולון", "מודיעין",
];

function localNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const str = (t) => parts.find(p => p.type === t)?.value || "";
  return { dateKey: `${str("year")}-${str("month")}-${str("day")}`, hour: Number(str("hour")), minute: Number(str("minute")) };
}

// חלון יומי קבוע: 9:00 עד 22:00 (כולל), כל יום — עד שמבקשים להפסיק
function inPublishWindow() {
  const { hour, minute } = localNow();
  if (hour < 9) return false;
  if (hour > 22) return false;
  if (hour === 22 && minute > 0) return false;
  return true;
}

// נרמול כותרת לצורך זיהוי כפילויות — השוואה ללא תלות בריווח, בסימני פיסוק וברישיות
function normalizeTitle(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[".,:;!()\[\]״׳"׳\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!inPublishWindow()) {
      return Response.json({ ok: true, skipped: "outside_publish_window" });
    }

    // Rotate categories, seller names and cities based on how many fictional sales already exist
    const existing = await base44.asServiceRole.entities.Product.filter({
      seller_user_id: { $regex: `^${SELLER_USER_ID_PREFIX}` },
    });
    const idx = existing.length;
    // הקטגוריה עם הכי מעט מכרזים פיקטיביים פעילים — מבטיח כיסוי של כל הקטגוריות
    const active = existing.filter(p => p.status !== "cancelled");
    const counts = new Map(CATEGORIES.map(c => [c, 0]));
    for (const p of active) {
      if (counts.has(p.category)) counts.set(p.category, counts.get(p.category) + 1);
    }
    const byFewest = [...CATEGORIES].sort((a, b) => counts.get(a) - counts.get(b));
    // הקטגוריה חייבת להיות שונה מזו של המכרז הפיקטיבי הקודם
    const sorted = [...existing].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    const lastCategory = sorted[0]?.category;
    const category = lastCategory && byFewest[0] === lastCategory && byFewest.length > 1
      ? byFewest[1]
      : byFewest[0];
    const nameIdx = idx % SELLER_NAMES.length;
    const sellerName = SELLER_NAMES[nameIdx];
    const sellerUserId = `${SELLER_USER_ID_PREFIX}-${nameIdx}`;
    const city = CITIES[idx % CITIES.length];

    // כפילויות: רשימת הכותרות הקיימות — למניעת פרסום אותו פריט פעמיים (גם בשם מוכר אחר)
    const existingTitles = [...new Set(existing.map(p => normalizeTitle(p.title)).filter(Boolean))];
    const existingTitleSet = new Set(existingTitles);

    // Generate a realistic fictional listing with the LLM
    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `צור מודעת מכרז פיקטיבית ריאליסטית אחת בעברית עבור אתר מכרזים ישראלי, בקטגוריה "${category}".
דרישות:
- כותרת קצרה ומושכת בעברית עם פרט מזהה של הפריט (יצרן/תקופה/סוג).
- הכותרת חייבת להיות פריט שונה ולא דומה לכותרות הבאות שכבר פורסמו באתר: ${existingTitles.slice(-30).join(" | ") || "(אין עדיין)"}.
- תיאור אמין של 2-3 משפטים: מצב, רקע, מה מיוחד בפריט.
- מחיר התחלתי ריאלי בשקלים לפריט כזה בשוק הישראלי (למשל: תכשיטים 300–5,000, אמנות 500–15,000, נומיסמטיקה ומטבעות 200–3,000, ספרים ובולים 100–1,500, עיצוב הבית 200–4,000, אופנה 150–2,500, יודאיקה 300–8,000, אספנות 200–6,000, שעונים 500–20,000, כלי נגינה 500–30,000, יין ואלכוהול 150–3,000, אלקטרוניקה 100–8,000, רכבים 15,000–90,000, נדל"ן 350,000–2,500,000, אחר 100–3,000).
- מחיר "קנה עכשיו" גבוה משמעותית מהמחיר ההתחלתי.
- מצב: חייב להיות בדיוק אחד מהערכים: ${CONDITIONS.join(" / ")}.
- מיקום: העיר חייבת להיות בדיוק "${city}".
- image_prompt: תיאור קצר באנגלית לתמונת מוצר סטודיו של הפריט (בלי טקסט בתמונה).`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          starting_price: { type: "number" },
          buy_now_price: { type: "number" },
          location: { type: "string" },
          condition: { type: "string" },
          image_prompt: { type: "string" },
        },
        required: ["title", "description", "starting_price", "buy_now_price", "location", "condition", "image_prompt"],
      },
    });

    // חסימה קשיחה — אם הכותרת שנוצרה זהה לכותרת קיימת, לא מפרסמים (מניעת כפילויות)
    if (existingTitleSet.has(normalizeTitle(llm.title))) {
      return Response.json({ ok: true, skipped: "duplicate_title" });
    }

    const condition = CONDITIONS.includes(llm.condition) ? llm.condition : "מצב מעולה";
    const startingPrice = Math.max(50, Math.round(Number(llm.starting_price) || 100));
    const buyNowPrice = Math.max(startingPrice + 50, Math.round(Number(llm.buy_now_price) || startingPrice * 1.5));

    // Generate two matching product photos (main shot + alternate angle)
    const imgPrompt = `Professional studio product photograph for an auction listing: ${llm.image_prompt}. Clean neutral background, soft studio lighting, high detail, catalog style, no text or logos in the image.`;
    const img = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt: imgPrompt });
    const img2 = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt: `${imgPrompt} Different composition: an alternate angled view of the same item, closer detail shot from a different perspective.`,
    });

    const endsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const product = await base44.asServiceRole.entities.Product.create({
      title: llm.title,
      description: llm.description,
      category,
      condition,
      starting_price: startingPrice,
      buy_now_price: buyNowPrice,
      image_url: img.url,
      image_urls: [img.url, img2.url],
      seller_name: sellerName,
      seller_user_id: sellerUserId,
      location: city,
      ends_at: endsAt,
      status: "active",
      bid_count: 0,
    });

    return Response.json({
      ok: true,
      published: { id: product.id, title: product.title, category, seller_name: sellerName, location: city, starting_price: startingPrice, image_url: img.url },
      total_fictional: existing.length + 1,
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
});