---
name: database-setup
description: Connect to and use the Postgres database attached to this project. Use when the user wants to read or write data, set up schemas, run Prisma or Drizzle migrations, query the database, configure DefaultAzureCredential for AAD auth, or troubleshoot Postgres connectivity, SSL, or token-expiry errors.
---

# Database — DfE Digital Standards - Copilot

The AI Provisioning Platform attached a Postgres Flexible Server to
this project. This file is the long-form integration guide that you
(or your AI assistant) should read before writing DB-touching code.

## Connection at a glance

- **Server:** `pg-dfe-digital-standards-copilot-l7qmpra3xh3ga.postgres.database.azure.com`
- **Database:** `app`
- **Auth:** Microsoft Entra ID only — no passwords on the server.

## Full connection guidance

- **Type:** PostgreSQL Flexible Server (B1ms burstable — ~£11/month)
- **Server FQDN:** `pg-dfe-digital-standards-copilot-l7qmpra3xh3ga.postgres.database.azure.com`
- **Database name:** `app`
- **Auth:** Microsoft Entra ID **only** — password auth is disabled at the server level.
- **Admin:** `alex@explainitlabs.com` (you). Run `az login` then connect with any tool that supports AAD: `psql` (`PGPASSWORD=$(az account get-access-token --resource-type oss-rdbms --query accessToken -o tsv) psql 'host=<fqdn> dbname=<db> user=alex@explainitlabs.com sslmode=require'`), the Node `pg` driver with a token via `@azure/identity`, etc.
- **No password to store.** No `.env` secret. To grant your hosted app access, run `SELECT * FROM pgaadauth_create_principal('<app-mi-name>', false, false);` in the database as you, then `GRANT ALL ON SCHEMA app TO "<app-mi-name>";`.

**Connection string shape** (when a tool insists on a URL):

```
postgresql://<user>:<aad-token>@pg-dfe-digital-standards-copilot-l7qmpra3xh3ga.postgres.database.azure.com:5432/app?sslmode=require
```

- `<user>` — your AAD principal (`alex@explainitlabs.com`) when running locally,
  or the platform service principal at runtime — read it from the
  injected env var `AIP_PG_USER`.
- `<aad-token>` — fetched fresh each connection. NEVER bake into the URL
  and check it into config; tokens last ~1h. Use `DefaultAzureCredential`
  + `getToken('https://ossrdbms-aad.database.windows.net/.default')` and
  pass the result as the password to the `pg` driver. The `@azure/identity`
  SDK caches and refreshes for you.
- `sslmode=require` is non-negotiable — the server rejects unencrypted
  connections.

## API runtime conventions

Server-side code lives in **`api/`**. The platform bundles it on
every publish (esbuild → CJS) and serves it at
`/alex/dfe-digital-standards-copilot/api/*`. The runtime is a sandboxed Node process per
published version — it spins up on first request and stays warm.

**Conventions**

- **Single entry**: `api/index.ts` must `export default` a Hono app.
  The bundler walks its imports; everything in your `package.json`
  is inlined into one self-contained `api.bundle.mjs` (ESM — you can
  use top-level `await` for client init, etc.).
- **Env vars** the runtime injects automatically:
  - `AIP_PG_HOST`, `AIP_PG_DATABASE` — connect with these.
  - `AIP_PG_USER` — Postgres principal name (the platform SP).
  - `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` —
    pass to `@azure/identity` so DefaultAzureCredential authenticates.
  - any `project_secrets` you've added via the portal Secrets tab.
- **User identity** per request:
  - `aip-user` header — signed-in user's email.
  - `aip-user-oid` header — their Entra object id.
  These are forwarded by the host *after* the auth gate has passed.
  Don't trust them otherwise — they're set by the host, not the client.

**Observability — already wired, don't reinvent**

- **Persisted logs.** Every `console.log` / `console.error` from your
  `api/` code is written to the per-publish `sandbox.log` as a
  JSON-Lines envelope: `{ ts, projectId, siteId, publishId, sandboxId,
  stream, line }`. The owner tails it on the project page's **Runtime
  logs** panel. Log liberally — single `console.log` calls per event are
  free.
- **Request correlation.** Echo `x-aip-request-id` (already on every
  inbound request) in your error responses, log it on the matching line,
  and the owner can grep one request end-to-end from browser devtools
  through the persisted log.
- **No log shipping needed.** Don't add Winston / Pino / a remote log
  sink — the host captures stdout/stderr already. Don't write to
  `/tmp` or anywhere outside the working directory; it's a sandbox.

**End-user activity — `recordActivity` SDK**

A thin helper ships at `api/_aip/activity.ts` for recording end-user
actions into `app.activity` (table created at publish time alongside
`app.members`). The project owner sees these rows on the portal's
**Activity** tab, merged with the platform-side audit.

```typescript
import { recordActivity } from "./_aip/activity";

app.post("/customers", async (c) => {
  const email = c.req.header("aip-user");
  const oid = c.req.header("aip-user-oid");
  // ... insert customer ...
  await recordActivity(client, {
    action: "customer.create",
    resourceType: "customer",
    resourceId: newCustomerId,
    metadata: { source: "ui" },
    actor: { email: email ?? null, oid: oid ?? null },
  });
  return c.json({ ok: true });
});
```

Pass any pg-compatible client — the helper does not open its own
connection. `metadata` is owner-visible JSONB; don't put secrets
or unredacted PII there. **Don't build your own activity-log table;
use this so the merged feed stays consistent.**

**Starter shape**

```typescript
// api/index.ts
import { Hono } from "hono";
import { DefaultAzureCredential } from "@azure/identity";
import { Client } from "pg";

const app = new Hono();

app.get("/health", async (c) => {
  // Get an Entra token for Postgres OSS RDBMS scope. Token TTL is 1h;
  // refresh on every request for v1 simplicity, cache for prod.
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
  const r = await client.query("SELECT NOW()");
  await client.end();
  return c.json({ ok: true, now: r.rows[0].now });
});

export default app;
```

## Local development

Use `DefaultAzureCredential` from `@azure/identity`. Sign in once
via `az login` and the SDK picks up your CLI credentials. The same
code works locally and in the platform sandbox — no branching.

## Schema convention: everything lives in the `app` schema

The platform reserves the Postgres `public` schema for its own
tables (`app.members` and friends). **Every user model must declare
`@@schema("app")`** and the Prisma generator must opt into the
multi-schema preview feature. The starter `prisma/schema.prisma`
committed to this repo has these conventions baked in — keep them.

If you switch to Drizzle or raw SQL, point your migrations at the
`app` schema explicitly. The runtime SP has been granted full rights
on `app` (and default privileges on future tables created there) —
but only on `app`. Tables in other schemas need their own grants.

## Defaults that survive raw SQL

Use **Postgres-side** defaults, not Prisma-side annotations, so raw
`pg` queries that bypass the Prisma client still work:

- `@default(dbgenerated("gen_random_uuid()"))` (NOT `@default(uuid())`).
- `@default(now())` on `createdAt`.
- `@default(now()) @updatedAt` on `updatedAt` — the `@updatedAt`
  alone only updates through the Prisma client.

The starter schema follows this pattern.

## Migrations

- **Prisma:** add `prisma` + `@prisma/client` to package.json and
  put your schema in `prisma/schema.prisma` (starter already
  committed). The platform's publish pipeline detects Prisma in your
  package.json and runs `prisma migrate deploy` before uploading the
  build artefact. Don't use `prisma migrate dev` in automated
  contexts — it needs a TTY. Use `prisma migrate diff` +
  `prisma migrate deploy`, or `prisma migrate dev --create-only` to
  generate the migration file then commit.
- **Drizzle:** equivalent flow lands in a later release. For now,
  run migrations manually before publishing.

## Troubleshooting

- **`SASL: SCRAM-SERVER-FIRST-MESSAGE` errors:** you're trying
  password auth against an AAD-only server. Use a token, not a
  password.
- **`no pg_hba.conf entry`:** firewall is missing the Azure-services
  rule. Re-run the bicep deploy to reconcile.
- **`token expired`:** OSS-RDBMS tokens last ~1h. Mint fresh on each
  request from `DefaultAzureCredential` — the SDK caches under the
  hood, so this is cheap.
