import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// "בידלי" — publishes one realistic fictional auction per invocation, rotating
// categories. Invoked hourly by the "Bidli Fictional Sales" scheduled workflow,
// and on demand by the "bidli" in-app agent. Publishes only inside the
// requested 3-day window (Asia/Jerusalem) and no-ops outside it.

const CATEGORIES = [
  "אמנות", "יודאיקה", "אספנות", "נומיסמטיקה", "תכשיטים",
  "עיצוב הבית", "אופנה", "רכבים", "נדל\"ן", "ספרים", "בולים",
];

const CONDITIONS = ["חדש", "מצב מעולה", "מצב טוב", "מצב בינוני", "לא תקין"];

const SELLER_USER_ID = "bidli-agent";

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
    hour: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const str = (t) => parts.find(p => p.type === t)?.value || "";
  return { dateKey: `${str("year")}-${str("month")}-${str("day")}`, hour: Number(str("hour")) };
}

function inPublishWindow() {
  const { dateKey, hour } = localNow();
  if (dateKey === "2026-09-18") return hour >= 14 && hour <= 20;
  if (dateKey === "2026-09-19") return hour >= 8 && hour <= 16;
  if (dateKey === "2026-09-20") return hour >= 8 && hour <= 20;
  return false;
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
    const existing = await base44.asServiceRole.entities.Product.filter({ seller_user_id: SELLER_USER_ID });
    const idx = existing.length;
    const category = CATEGORIES[idx % CATEGORIES.length];
    const sellerName = SELLER_NAMES[idx % SELLER_NAMES.length];
    const city = CITIES[idx % CITIES.length];

    // Generate a realistic fictional listing with the LLM
    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `צור מודעת מכרז פיקטיבית ריאליסטית אחת בעברית עבור אתר מכרזים ישראלי, בקטגוריה "${category}".
דרישות:
- כותרת קצרה ומושכת בעברית עם פרט מזהה של הפריט (יצרן/תקופה/סוג).
- תיאור אמין של 2-3 משפטים: מצב, רקע, מה מיוחד בפריט.
- מחיר התחלתי ריאלי בשקלים לפריט כזה בשוק הישראלי (למשל: תכשיטים 300–5,000, אמנות 500–15,000, נומיסמטיקה 200–3,000, ספרים ובולים 100–1,500, עיצוב הבית 200–4,000, אופנה 150–2,500, יודאיקה 300–8,000, אספנות 200–6,000, רכבים 15,000–90,000, נדל"ן 350,000–2,500,000).
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

    const condition = CONDITIONS.includes(llm.condition) ? llm.condition : "מצב מעולה";
    const startingPrice = Math.max(50, Math.round(Number(llm.starting_price) || 100));
    const buyNowPrice = Math.max(startingPrice + 50, Math.round(Number(llm.buy_now_price) || startingPrice * 1.5));

    // Generate a matching product photo
    const img = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt: `Professional studio product photograph for an auction listing: ${llm.image_prompt}. Clean neutral background, soft studio lighting, high detail, catalog style, no text or logos in the image.`,
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
      image_urls: [img.url],
      seller_name: sellerName,
      seller_user_id: SELLER_USER_ID,
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