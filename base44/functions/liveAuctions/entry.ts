import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";

const SITE = "https://bidli.co.il";

const absolute = (value: unknown): string => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  if (/^https?:\/\//.test(raw)) return raw;
  return `${SITE}${raw.startsWith("/") ? "" : "/"}${raw}`;
};

async function fetchAll(entity: any, query: any): Promise<any[]> {
  const rows: any[] = [];
  let cursor: string | null = null;
  for (let i = 0; i < 20; i++) {
    const page: any = await entity.filter(query, {
      sort: "-updated_date",
      limit: 500,
      ...(cursor ? { cursor } : {}),
    });
    const items = Array.isArray(page) ? page : page?.items || [];
    rows.push(...items);
    if (Array.isArray(page) || !page?.has_more || !page?.next_cursor) break;
    cursor = page.next_cursor;
  }
  return rows;
}

// רשימת המכרזים הפעילים בפועל — JSON קליל למערכות פרסום וצדדים שלישיים.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const products = await fetchAll(base44.asServiceRole.entities.Product, {
      status: "active",
      ends_at: { $gt: new Date().toISOString() },
    });

    const auctions = products
      .filter((p: any) => p?.id && p?.title)
      .map((p: any) => {
        const currentPrice = Number(p.current_price) || 0;
        const startingPrice = Number(p.starting_price) || 0;
        return {
          id: p.id,
          title: p.title,
          current_price: currentPrice || null,
          starting_price: startingPrice || null,
          price: currentPrice > 0 ? currentPrice : startingPrice,
          image_url: absolute([...(Array.isArray(p.image_urls) ? p.image_urls : []), p.image_url].find(Boolean)),
          url: `${SITE}/auction/${p.id}`,
          category: p.category || null,
          bid_count: Number(p.bid_count) || 0,
          ends_at: p.ends_at || null,
        };
      });

    return new Response(JSON.stringify({ count: auctions.length, auctions }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}