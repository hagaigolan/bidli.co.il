import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { buildSitemapXml } from "../../shared/sitemap.ts";

// מפת אתר ציבורית: נקראת על ידי סורקים ללא התחברות, ולכן קוראת רק נתוני קטלוג פתוחים.
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

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date().toISOString();

    const [auctions, articles] = await Promise.all([
      fetchAll(base44.asServiceRole.entities.Product, {
        status: "active",
        ends_at: { $gt: now },
      }),
      fetchAll(base44.asServiceRole.entities.Article, { status: "published" }),
    ]);

    const xml = buildSitemapXml({ auctions, articles });

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}