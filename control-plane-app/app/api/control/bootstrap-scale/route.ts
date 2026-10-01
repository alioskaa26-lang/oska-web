import { getSql } from "@/lib/db";

const seeds = [
  ["tr-925-retail","Türkiye","925 silver",["premium retailer","multibrand","stockist","e-commerce"],"Find 6 NEW Turkey-first premium retailers, multibrand stores, stockists or e-commerce buyers with current 925 sterling silver fit, strong retail pricing, stock/replenishment and B2B buying potential."],
  ["tr-brass","Türkiye","brass bronze",["retailer","wholesaler","importer","private-label buyer"],"Find 6 NEW Turkey-first brass/bronze jewelry buyers, wholesalers, importers or private-label prospects with active commerce and repeat-order potential."],
  ["tr-distribution","Türkiye","925 silver and brass bronze",["distributor","wholesaler","importer","direct buyer"],"Find 6 NEW Turkish distributors, wholesalers, importers or direct B2B jewelry buyers suitable for OSKA manufacturing."],
  ["global-925-retail","Global","925 silver",["premium retailer","menswear retailer","multibrand","stockist"],"Find 6 NEW global premium retailers or stockists with current 925 sterling silver jewelry assortment, high retail pricing and international e-commerce strength."],
  ["global-brass","Global","brass bronze",["brand","retailer","private-label buyer","wholesaler"],"Find 6 NEW global brass/bronze jewelry brands, retailers, wholesalers or private-label buyers with external sourcing or replenishment signals."],
  ["global-sourcing","Global","925 silver and brass bronze",["sourcing office","RFQ buyer","agent","showroom","distributor"],"Find 6 NEW global sourcing offices, RFQ buyers, agents, showrooms or distributors open to external jewelry supply."]
] as const;

export async function GET() {
  const sql = getSql();
  const inserted: string[] = [];

  for (const [lane, geography, material, customerTypes, goal] of seeds) {
    const id = `bootstrap-20261002-${lane}`;
    const payload = {
      lane,
      geography,
      material,
      customerTypes,
      limit: 6,
      goal,
      bootstrap: true,
      rules: {
        turkeyFirst: true,
        excludeGrandBazaarFirms: true,
        requireEvidenceUrls: true,
        noInventedContacts: true,
        whatsappMustBeExplicitlyVerified: true,
      },
    };

    const rows = await sql`
      INSERT INTO oska_jobs (
        id, type, payload, status, priority,
        preferred_providers, max_attempts, approval_status
      )
      VALUES (
        ${id},
        'lead_discovery',
        ${JSON.stringify(payload)}::jsonb,
        'pending',
        900,
        '[]'::jsonb,
        3,
        'not_required'
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `;

    if (rows[0]) {
      inserted.push(id);
      await sql`
        INSERT INTO oska_job_events (job_id, event_type, detail)
        VALUES (
          ${id},
          'bootstrap_scale',
          '{"batchSize":6}'::jsonb
        )
      `;
    }
  }

  return Response.json({
    ok: true,
    requested: seeds.length,
    inserted: inserted.length,
    jobIds: inserted,
  });
}
