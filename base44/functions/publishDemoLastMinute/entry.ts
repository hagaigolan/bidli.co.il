import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// מפרסם 5 מכרזים הפוכים לדוגמה (is_demo) בכל ריצה — נקרא מוורקפלואו יומי.
// המכרזים מסומנים כ"פרסומת לדוגמה" בדף ובכרטיס, והשרת חוסם רכישה שלהם
// (claimLastMinuteDeal מחזיר demo_deal).

const BUSINESS_TYPES = [
  "אולפן הקלטות",
  "מספרה / ספר",
  "קליניקה וטיפולים",
  "קוסמטיקה וציפורניים",
  "צילום",
  "כושר ואימון אישי",
  "שיעורים פרטיים",
  "אחר",
];

const CITIES = [
  "תל אביב", "ירושלים", "חיפה", "באר שבע", "ראשון לציון",
  "פתח תקווה", "נתניה", "אשדוד", "רחובות", "הרצליה",
  "כשר סבא", "רמת גן", "חולון", "מודיעין", "כפר סבא",
];

const normalizeTitle = (title) =>
  String(title || "")
    .toLowerCase()
    .replace(/[".,:;!()\[\]״׳"׳\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// היסט שעון ישראל מול UTC בדקות (כולל שעון קיץ)
function israelOffsetMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(date);
  const get = (t) => Number(parts.find((p) => p.type === t)?.value || 0);
  const asUTC = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUTC - date.getTime()) / 60000);
}

// מועד בשעון ישראל: daysAhead ימים קדימה, בשעה עגולה
function israelDateAt(daysAhead, hour) {
  const offset = israelOffsetMinutes();
  const shifted = new Date(Date.now() + offset * 60000 + daysAhead * 86400000);
  shifted.setUTCHours(hour, 0, 0, 0);
  return new Date(shifted.getTime() - offset * 60000);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // כותרות של מכרזי הדגמה מהשבוע האחרון — למניעת כפילויות
    const recent = await base44.asServiceRole.entities.LastMinuteDeal.filter({ is_demo: true });
    const recentRows = (Array.isArray(recent) ? recent : (recent?.items || []))
      .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
      .slice(0, 40);
    const existingTitles = [...new Set(recentRows.map((r) => normalizeTitle(r.title)).filter(Boolean))];

    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `צור בדיוק 5 חלונות שירות שהתפנו ברגע האחרון, עבור אתר מכרזים הפוכים ישראלי (המחיר יורד עם הזמן).
כל חלון הוא שירות אמיתי שנקבע מראש והתבטל — ולכן נמכר בזול למי שתופס אותו.
דרישות:
- 5 שירותים שונים לחלוטין זה מזה, מסוגים שונים מתוך: ${BUSINESS_TYPES.join(" / ")}.
- business_type חייב להיות בדיוק אחד מהערכים שלמעלה.
- title: שם השירות + מה כלול, קצר ומושך (לדוגמה: "תספורת גברים + עיצוב זקן").
- business_name: שם עסק ישראלי אמין וקצר.
- description: 2 משפטים — מה כלול, כמה זמן, ולמה כדאי לתפוס.
- city: עיר בישראל (הגוון בין הערים).
- list_price: המחיר הרגיל הריאלי של השירות בשקלים (בין 150 ל-2500).
- floor_percent: אחוז ההנחה המקסימלי מרצפת המחיר (בין 25 ל-45).
- duration_minutes: 30 עד 180.
אין להשתמש בכותרת מהרשימה הבאה (כבר פורסמו): ${existingTitles.slice(-40).join(" | ") || "(אין עדיין)"}.`,
      response_json_schema: {
        type: "object",
        properties: {
          deals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                business_name: { type: "string" },
                business_type: { type: "string" },
                description: { type: "string" },
                city: { type: "string" },
                list_price: { type: "number" },
                floor_percent: { type: "number" },
                duration_minutes: { type: "number" },
              },
              required: ["title", "business_name", "business_type", "description", "city", "list_price", "floor_percent", "duration_minutes"],
            },
          },
        },
        required: ["deals"],
      },
    });

    const generated = Array.isArray(llm?.deals) ? llm.deals.slice(0, 5) : [];
    if (!generated.length) {
      return Response.json({ ok: true, skipped: "no_deals_generated" });
    }

    const now = Date.now();
    const seen = new Set(existingTitles);
    const records = [];

    generated.forEach((d, i) => {
      const key = normalizeTitle(d.title);
      if (!key || seen.has(key)) return;
      seen.add(key);

      const listPrice = Math.max(80, Math.round(Number(d.list_price) || 400));
      const discount = Math.min(45, Math.max(25, Math.round(Number(d.floor_percent) || 35)));
      const floorPrice = Math.max(50, Math.round(listPrice * (1 - discount / 100)));

      // סגירת מכרזים מדורגת לאורך היום, ומועד השירות — מחר בבוקר והצהריים
      const auctionEnds = new Date(now + (2 + i * 1.5) * 3600000);
      const slot = israelDateAt(1, 9 + i * 2);

      records.push({
        title: d.title,
        business_name: d.business_name,
        business_type: BUSINESS_TYPES.includes(d.business_type) ? d.business_type : "אחר",
        description: d.description,
        city: CITIES[i % CITIES.length],
        duration_minutes: Math.min(180, Math.max(30, Math.round(Number(d.duration_minutes) || 60))),
        auction_starts_at: new Date(now).toISOString(),
        auction_ends_at: auctionEnds.toISOString(),
        slot_start: slot.toISOString(),
        list_price: listPrice,
        floor_price: floorPrice,
        status: "active",
        is_demo: true,
      });
    });

    if (!records.length) {
      return Response.json({ ok: true, skipped: "duplicate_titles" });
    }

    const created = await base44.asServiceRole.entities.LastMinuteDeal.bulkCreate(records);
    return Response.json({
      ok: true,
      published: records.length,
      ids: (Array.isArray(created) ? created : []).map((r) => r.id),
      titles: records.map((r) => r.title),
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
});