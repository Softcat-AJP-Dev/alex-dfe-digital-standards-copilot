import { Hono } from "hono";
import { cors } from "hono/cors";
import { DefaultAzureCredential } from "@azure/identity";
import { Client } from "pg";
import { recordActivity } from "./_aip/activity";

const app = new Hono().basePath("/alex/dfe-digital-standards-copilot/api");

app.use("*", cors());

// --- DB helper ---

async function getDbClient(): Promise<Client> {
  const cred = new DefaultAzureCredential();
  const token = await cred.getToken(
    "https://ossrdbms-aad.database.windows.net/.default",
  );
  const client = new Client({
    host: process.env.AIP_PG_HOST,
    database: process.env.AIP_PG_DATABASE,
    user: process.env.AIP_PG_USER,
    password: token!.token,
    port: 5432,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

// --- Membership middleware ---

async function requireMember(
  client: Client,
  email: string | undefined,
): Promise<boolean> {
  if (!email) return false;
  const r = await client.query(
    "SELECT 1 FROM app.members WHERE email = $1",
    [email],
  );
  return (r.rowCount ?? 0) > 0;
}

// --- Health ---

app.get("/health", async (c) => {
  const client = await getDbClient();
  try {
    const r = await client.query("SELECT NOW()");
    return c.json({ ok: true, now: r.rows[0].now });
  } finally {
    await client.end();
  }
});

// --- Standards (read-only, public to authenticated users) ---

app.get("/standards", async (c) => {
  const client = await getDbClient();
  try {
    const categories = await client.query(
      `SELECT id, slug, name, description, is_core as "isCore", sort_order as "sortOrder"
       FROM app."StandardCategory" ORDER BY sort_order`,
    );
    const criteria = await client.query(
      `SELECT id, category_id as "categoryId", slug, title, description, guidance, sort_order as "sortOrder"
       FROM app."StandardCriterion" ORDER BY sort_order`,
    );
    const result = categories.rows.map((cat) => ({
      ...cat,
      criteria: criteria.rows.filter((cr) => cr.categoryId === cat.id),
    }));
    return c.json(result);
  } finally {
    await client.end();
  }
});

// --- Schools ---

app.get("/schools", async (c) => {
  const client = await getDbClient();
  try {
    const r = await client.query(
      `SELECT id, name, urn, phase, local_authority as "localAuthority", created_at as "createdAt"
       FROM app."School" ORDER BY name`,
    );
    return c.json(r.rows);
  } finally {
    await client.end();
  }
});

app.post("/schools", async (c) => {
  const email = c.req.header("aip-user");
  const oid = c.req.header("aip-user-oid");
  const client = await getDbClient();
  try {
    if (!(await requireMember(client, email))) {
      return c.json({ error: "not_a_member" }, 403);
    }
    const body = await c.req.json<{
      name: string;
      urn?: string;
      phase?: string;
      localAuthority?: string;
    }>();
    const r = await client.query(
      `INSERT INTO app."School" (name, urn, phase, local_authority, created_by_oid)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [body.name, body.urn ?? null, body.phase ?? null, body.localAuthority ?? null, oid ?? null],
    );
    await recordActivity(client, {
      action: "school.create",
      resourceType: "school",
      resourceId: r.rows[0].id,
      actor: { email: email ?? null, oid: oid ?? null },
    });
    return c.json(r.rows[0], 201);
  } finally {
    await client.end();
  }
});

// --- Assessments ---

app.get("/schools/:schoolId/assessments", async (c) => {
  const { schoolId } = c.req.param();
  const client = await getDbClient();
  try {
    const r = await client.query(
      `SELECT id, school_id as "schoolId", title, status, assessor_email as "assessorEmail",
              completed_at as "completedAt", created_at as "createdAt"
       FROM app."Assessment" WHERE school_id = $1 ORDER BY created_at DESC`,
      [schoolId],
    );
    return c.json(r.rows);
  } finally {
    await client.end();
  }
});

app.post("/schools/:schoolId/assessments", async (c) => {
  const email = c.req.header("aip-user");
  const oid = c.req.header("aip-user-oid");
  const { schoolId } = c.req.param();
  const client = await getDbClient();
  try {
    if (!(await requireMember(client, email))) {
      return c.json({ error: "not_a_member" }, 403);
    }
    const body = await c.req.json<{ title?: string }>();
    const r = await client.query(
      `INSERT INTO app."Assessment" (school_id, title, assessor_email, assessor_oid)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [schoolId, body.title ?? null, email ?? null, oid ?? null],
    );
    await recordActivity(client, {
      action: "assessment.create",
      resourceType: "assessment",
      resourceId: r.rows[0].id,
      actor: { email: email ?? null, oid: oid ?? null },
    });
    return c.json(r.rows[0], 201);
  } finally {
    await client.end();
  }
});

app.get("/assessments/:assessmentId", async (c) => {
  const { assessmentId } = c.req.param();
  const client = await getDbClient();
  try {
    const assessment = await client.query(
      `SELECT a.id, a.school_id as "schoolId", a.title, a.status,
              a.assessor_email as "assessorEmail", a.completed_at as "completedAt",
              a.created_at as "createdAt", s.name as "schoolName"
       FROM app."Assessment" a JOIN app."School" s ON s.id = a.school_id
       WHERE a.id = $1`,
      [assessmentId],
    );
    if (assessment.rowCount === 0) return c.json({ error: "not_found" }, 404);

    const responses = await client.query(
      `SELECT id, criterion_id as "criterionId", maturity_level as "maturityLevel", notes,
              updated_at as "updatedAt"
       FROM app."AssessmentResponse" WHERE assessment_id = $1`,
      [assessmentId],
    );
    return c.json({ ...assessment.rows[0], responses: responses.rows });
  } finally {
    await client.end();
  }
});

// --- Assessment Responses (scoring) ---

app.put("/assessments/:assessmentId/responses", async (c) => {
  const email = c.req.header("aip-user");
  const oid = c.req.header("aip-user-oid");
  const { assessmentId } = c.req.param();
  const client = await getDbClient();
  try {
    if (!(await requireMember(client, email))) {
      return c.json({ error: "not_a_member" }, 403);
    }
    const body = await c.req.json<{
      criterionId: string;
      maturityLevel: number | null;
      notes?: string;
    }>();
    const r = await client.query(
      `INSERT INTO app."AssessmentResponse" (assessment_id, criterion_id, maturity_level, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (assessment_id, criterion_id)
       DO UPDATE SET maturity_level = EXCLUDED.maturity_level,
                     notes = EXCLUDED.notes,
                     updated_at = NOW()
       RETURNING *`,
      [assessmentId, body.criterionId, body.maturityLevel, body.notes ?? null],
    );
    return c.json(r.rows[0]);
  } finally {
    await client.end();
  }
});

// --- Complete assessment ---

app.post("/assessments/:assessmentId/complete", async (c) => {
  const email = c.req.header("aip-user");
  const oid = c.req.header("aip-user-oid");
  const { assessmentId } = c.req.param();
  const client = await getDbClient();
  try {
    if (!(await requireMember(client, email))) {
      return c.json({ error: "not_a_member" }, 403);
    }
    await client.query(
      `UPDATE app."Assessment" SET status = 'completed', completed_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [assessmentId],
    );
    await recordActivity(client, {
      action: "assessment.complete",
      resourceType: "assessment",
      resourceId: assessmentId,
      actor: { email: email ?? null, oid: oid ?? null },
    });
    return c.json({ ok: true });
  } finally {
    await client.end();
  }
});

// --- Report ---

app.get("/assessments/:assessmentId/report", async (c) => {
  const { assessmentId } = c.req.param();
  const client = await getDbClient();
  try {
    const assessment = await client.query(
      `SELECT a.*, s.name as school_name, s.urn, s.phase
       FROM app."Assessment" a JOIN app."School" s ON s.id = a.school_id
       WHERE a.id = $1`,
      [assessmentId],
    );
    if (assessment.rowCount === 0) return c.json({ error: "not_found" }, 404);

    const data = await client.query(
      `SELECT
         cat.id as "categoryId", cat.name as "categoryName", cat.slug as "categorySlug",
         cat.is_core as "isCore", cat.sort_order as "categorySortOrder",
         cr.id as "criterionId", cr.title as "criterionTitle", cr.slug as "criterionSlug",
         cr.sort_order as "criterionSortOrder",
         ar.maturity_level as "maturityLevel", ar.notes
       FROM app."StandardCategory" cat
       JOIN app."StandardCriterion" cr ON cr.category_id = cat.id
       LEFT JOIN app."AssessmentResponse" ar ON ar.criterion_id = cr.id AND ar.assessment_id = $1
       ORDER BY cat.sort_order, cr.sort_order`,
      [assessmentId],
    );

    // Group by category
    const categories: Record<string, {
      categoryId: string;
      categoryName: string;
      categorySlug: string;
      isCore: boolean;
      criteria: Array<{
        criterionId: string;
        criterionTitle: string;
        maturityLevel: number | null;
        notes: string | null;
      }>;
      averageMaturity: number | null;
    }> = {};

    for (const row of data.rows) {
      if (!categories[row.categoryId]) {
        categories[row.categoryId] = {
          categoryId: row.categoryId,
          categoryName: row.categoryName,
          categorySlug: row.categorySlug,
          isCore: row.isCore,
          criteria: [],
          averageMaturity: null,
        };
      }
      categories[row.categoryId]!.criteria.push({
        criterionId: row.criterionId,
        criterionTitle: row.criterionTitle,
        maturityLevel: row.maturityLevel,
        notes: row.notes,
      });
    }

    // Calculate averages
    for (const cat of Object.values(categories)) {
      const scored = cat.criteria.filter((cr) => cr.maturityLevel != null);
      if (scored.length > 0) {
        cat.averageMaturity =
          Math.round(
            (scored.reduce((sum, cr) => sum + cr.maturityLevel!, 0) / scored.length) * 10,
          ) / 10;
      }
    }

    const allScored = data.rows.filter((r) => r.maturityLevel != null);
    const overallAverage =
      allScored.length > 0
        ? Math.round(
            (allScored.reduce((sum, r) => sum + r.maturityLevel, 0) / allScored.length) * 10,
          ) / 10
        : null;

    const a = assessment.rows[0];
    return c.json({
      school: { name: a.school_name, urn: a.urn, phase: a.phase },
      assessment: {
        id: a.id,
        title: a.title,
        status: a.status,
        assessorEmail: a.assessor_email,
        completedAt: a.completed_at,
        createdAt: a.created_at,
      },
      overallMaturity: overallAverage,
      totalCriteria: data.rows.length,
      scoredCriteria: allScored.length,
      categories: Object.values(categories).sort(
        (a, b) => (categories[a.categoryId] ? 0 : 1) - (categories[b.categoryId] ? 0 : 1),
      ),
    });
  } finally {
    await client.end();
  }
});

export default app;
