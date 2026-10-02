import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { inPublishWindow, normalizeTitle } from '../../shared/fictionalPublish.ts';

// "בידלי" — publishes one realistic fictional STOCK item per invocation
// (is_stock: true — appears in the עמוד הסטוקים). Invoked twice a day at
// different hours by the "Bidli Fictional Stocks" scheduled workflow.
// Publishes only inside the daily 9:00–22:00 window (Asia/Jerusalem)
// and no-ops outside it. Each run picks the stock category with the fewest
// active fictional stock listings and always a category different from the
// previous fictional stock item, so the two daily items are always different.

const CATEGORIES = [
  "אמנות", "יודאיקה", "אספנות", "נומיסמטיקה", "מטבעות", "בולים",
  "תכשיטים", "שעונים", "עיצוב הבית", "אופנה", "ספרים", "כלי נגינה",
  "יין ואלכוהול", "אלקטרוניקה", "רכבים", "נדל\"ן", "אחר",
];

const CONDITIONS = ["חדש", "מצב מעולה", "מצב טוב", "מצב בינוני", "לא תקין"];

const SELLER_USER_ID_PREFIX = "bidli-agent";

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

    // רק פריטי הסטוק הפיקטיביים — הרוטציה של קטגוריות ומוכרים עצמאית מהמכרזים הפיקטיביים הרגילים
    const existing = await base44.asServiceRole.entities.Product.filter({
      seller_user_id: { $regex: `^${SELLER_USER_ID_PREFIX}` },
      is_stock: true,
    });
    const idx = existing.length;
    const active = existing.filter(p => p.status !== "cancelled");
    const counts = new Map(CATEGORIES.map(c => [c, 0]));
    for (const p of active) {
      if (counts.has(p.category)) counts.set(p.category, counts.get(p.category) + 1);
    }
    const byFewest = [...CATEGORIES].sort((a, b) => counts.get(a) - counts.get(b));
    const sorted = [...existing].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    const lastCategory = sorted[0]?.category;
    const category = lastCategory && byFewest[0] === lastCategory && byFewest.length > 1
      ? byFewest[1]
      : byFewest[0];
    const nameIdx = idx % SELLER_NAMES.length;
    const sellerName = SELLER_NAMES[nameIdx];
    const sellerUserId = `${SELLER_USER_ID_PREFIX}-stock-${nameIdx}`;
    const city = CITIES[idx % CITIES.length];

    // מניעת כפילויות — מול כל הפריטים הפיקטיביים שפורסמו
    const allFictional = await base44.asServiceRole.entities.Product.filter({
      seller_user_id: { $regex: `^${SELLER_USER_ID_PREFIX}` },
    });
    const existingTitleSet = new Set(allFictional.map(p => normalizeTitle(p.title)).filter(Boolean));

    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `צור מודעת סטוק פיקטיבית ריאליסטית אחת בעברית עבור אתר מכרזים ישראלי, בקטגוריה "${category}".
דרישות:
- כותרת קצרה ומושכת בעברית עם פרט מזהה של הפריט (יצרן/תקופה/סוג).
- פריט סטוק מבוקש בשוק הישראלי בחודש האחרון, מותאם לקטגוריה "${category}" — מוצר זמין בכמות ומתאים למכירה מהירה.
- הכותרת חייבת להיות פריט שונה ולא דומה לכותרות הבאות שכבר פורסמו באתר: ${[...existingTitleSet].slice(-30).join(" | ") || "(אין עדיין)"}.
- תיאור אמין של 2-3 משפטים: מצב, רקע, מה מיוחד בפריט.
- מחיר התחלתי ריאלי בשקלים לפריט כזה בשוק הישראלי (למשל: תכשיטים 200–4,000, אמנות 300–8,000, ספרים ובולים 100–1,200, עיצוב הבית 150–3,000, אופנה 100–2,000, שעונים 400–15,000, כלי נגינה 400–20,000, יין ואלכוהול 120–2,500, אלקטרוניקה 100–6,000, אחר 100–2,500).
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

    if (existingTitleSet.has(normalizeTitle(llm.title))) {
      return Response.json({ ok: true, skipped: "duplicate_title" });
    }

    const condition = CONDITIONS.includes(llm.condition) ? llm.condition : "מצב מעולה";
    const startingPrice = Math.max(50, Math.round(Number(llm.starting_price) || 100));
    const buyNowPrice = Math.max(startingPrice + 50, Math.round(Number(llm.buy_now_price) || startingPrice * 1.5));

    const imgPrompt = `Professional studio product photograph for a stock sale listing: ${llm.image_prompt}. Clean neutral background, soft studio lighting, high detail, catalog style, no text or logos in the image.`;
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
      is_stock: true,
      starting_price: startingPrice,
      buy_now_price: buyNowPrice,
      current_price: startingPrice,
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
      published: { id: product.id, title: product.title, category, seller_name: sellerName, location: city, starting_price: startingPrice, is_stock: true },
      total_fictional_stock: existing.length + 1,
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
});