# DfE Digital Standards - Copilot

> Cross-tool AI coding agent instructions, auto-loaded by Codex,
> GitHub Copilot, Cursor, Devin, Windsurf, OpenCode, Zed, VS Code,
> Factory, and others. Claude Code loads `CLAUDE.md` (sibling file)
> which `@`-imports this. Spec version: `2026.05.18b`.
>
> Provisioned by the AI Provisioning Platform. The long-form
> reference for everything below lives at `docs/PLATFORM.md`.

## At a glance

- **Project URL path:** `/alex/dfe-digital-standards-copilot` — published at `https://aip.softcat.io/alex/dfe-digital-standards-copilot`
- **AI platform:** GitHub Copilot CLI (`copilot_cli`)
- **Owner:** Alex Pearce (`alex`)
- **ID:** `019e3f30-93a9-738b-97d6-1b48a59949fe` · **Shape:** `repo_and_azure` · **Flow:** `advanced`

## Important: this app lives at `/alex/dfe-digital-standards-copilot`

When the owner clicks **Publish** in the AI Provisioning Platform, this
repo is served at `https://aip.softcat.io/alex/dfe-digital-standards-copilot` — a sub-path,
**not the root**. Configure the bundler before writing app code so
every asset URL resolves under that base. Use relative URLs
(`./assets/x`) where possible — they survive any base path.

| Stack            | Setting                                        |
| ---------------- | ---------------------------------------------- |
| Vite             | `base: '/alex/dfe-digital-standards-copilot/'` in `vite.config.ts`     |
| Next.js (export) | `basePath: '/alex/dfe-digital-standards-copilot'` in `next.config.js`  |
| Plain HTML       | `<base href="/alex/dfe-digital-standards-copilot/">` in `<head>`       |

For `fetch`, links, redirects: prefix with `/alex/dfe-digital-standards-copilot` or use
relative URLs. Hard-coding `/` will break the deployed site.

## Project commands

> Fill these in for your project. The agent will treat the listed
> commands as the canonical way to build, test, and run.
>
> **The platform's Publish step runs `pnpm install --frozen-lockfile=false && pnpm build` and expects
> output in `dist/`.** If you change one, update the
> AI-platform version in the portal so they stay in sync.

- **Install:** _e.g. `pnpm install`_
- **Build:** `pnpm install --frozen-lockfile=false && pnpm build` _(used by the platform's Publish step)_
- **Test:** _e.g. `pnpm test`_
- **Lint:** _e.g. `pnpm lint`_
- **Typecheck:** _e.g. `pnpm typecheck`_
- **Run dev:** _e.g. `pnpm dev`_
- **Build output:** `dist/`

## How we work in this repo

- Use the build/test commands above before reporting work as done.
- Don't write new code without first reading the related existing
  module — preserve the patterns used elsewhere.
- Don't introduce new dependencies without checking what's already in
  the manifest. Fewer, smaller dependencies is usually better.
- Don't commit secrets. `.env` and `.env.local` are gitignored; use
  `.env.example` as the template.
- Don't disable a lint rule without leaving a comment that explains why.
- Prefer **editing** existing files to creating new ones. Don't write
  docs unless the task explicitly asks for them.

## Build-time gotchas

The platform's Publish step runs `pnpm install --frozen-lockfile=false && pnpm build` against this repo
and **fails the publish if anything doesn't compile** (the build error
shows up in the portal as "Last build failed"). Run `pnpm install --frozen-lockfile=false && pnpm build`
locally before pushing.

**Don't name domain types after DOM globals.** TypeScript binds names
in lexical scope first, so if you declare `type Response = { ... }`
(or `Request`, `Headers`, `URL`, `Blob`, `File`, `FormData`, `Event`,
`Location`, `Document`, `Window`), every
`fetch(...).then((res: Response) => res.json())` callback binds to
**your** type — not the DOM `Response` — and the build rejects with
cascades of `Property 'ok' does not exist on type 'Response'`. Prefix
domain names that would collide: `AssessmentResponse`, `ApiRequest`,
`EventRecord`, `SiteLocation`, etc.

See `docs/PLATFORM.md` for the longer reference on what runs at
publish time.

## Authentication

The platform handles sign-in for you. **Don't add Auth0, NextAuth, or any
custom login flow** — the host service in front of your app does it.

**How it works:**

1. User opens `https://aip.softcat.io/<owner>/<slug>/...`.
2. The host checks an iron-session cookie. No cookie → 302 to the portal,
   which signs them in via **Microsoft Entra ID** and sets the cookie.
3. The host enforces the **permission mode** set per-publish in the
   portal: `private` (just the owner), `tenant` (any member of the
   owner's org), or `allowlist`
   (specific emails / Entra users / Entra groups). Group membership is
   resolved at request time via Microsoft Graph (with a 60s cache).
4. Only after that does your code run. Two headers are forwarded:
   - `aip-user` — the signed-in user's email.
   - `aip-user-oid` — their Entra object id (stable across email changes).

**Trust model:**

- Trust those headers in your `api/` code — they're injected by the host
  AFTER the auth + permission gate. Don't re-validate against Entra.
- **Never trust** `Authorization`, custom `X-User-*`, or query-string
  identity claims. Strip and ignore them.
- For per-user authorisation (e.g. "only the row's owner can edit"),
  match `aip-user-oid` against your data, NOT `aip-user` — emails can
  change in Entra and we want history to follow the person, not the address.

**Logged-out users never reach your code.** You will never see a request
without those headers. If `aip-user` is missing, the host failed open —
report it, don't try to handle it.

**Frontend identity — read from the DOM, not the API.** The host injects
the signed-in user's identity into every served `index.html` before it
reaches the browser, so your SPA can render "Signed in as …" on first
paint without a `/api/me` round-trip. Three forms are available — pick
whichever fits your stack:

```html
<!-- in <head>, set by the host -->
<meta name="aip-user-email" content="alex@example.com">
<meta name="aip-user-oid"   content="01234567-...">
<script>window.__AIP_USER__ = { email: "alex@example.com", oid: "..." };</script>
```

Anonymous (public-mode) visitors get null in the JS object and empty
strings in the meta tags. **Treat null as "not signed in", never as
"API broken"** — that's the whole reason this exists. You can still
keep an `/api/me` route for fetching app-specific user data (settings,
roles), but identity itself is already in the DOM.

**Request correlation:** every `/api/*` response carries an
`x-aip-request-id` header (e.g. `req-dz`). Echo it in your error
responses and the developer can find the matching line in the portal
Runtime logs tab. Your code reads the same value as
`c.req.header("x-aip-request-id")` in a Hono handler.

**Access audit — already wired.** Allowed page loads and denied
requests are recorded automatically in the project's **Activity**
feed (`/projects/<id>/activity` in the portal) with the actor's email,
Entra OID, path, and — for denials — a machine-readable reason
(`tenant_mismatch`, `private_owner_only`, `allowlist_no_match`, etc.).
Don't try to log access yourself; the host already does it.

## Infrastructure

What's running for this project right now:

**Provisioned:**

- **GitHub repo** — this one. Branch protection on `main` blocks force-push.
- **Build sandbox** — runs your build on every Publish click. No network,
  bounded CPU + memory, throw-away. Inherits `package.json` deps; can't
  install OS packages.
- **API runtime sandbox** — single Node child process per project,
  spawned on first `/api/*` request, kept warm for ~5 min of idle, then
  killed. 512 MB RSS cap. Spawns a fresh process per publish (no state
  carry-over).
- **PostgreSQL Flexible Server** — `pg-dfe-digital-standards-copilot-l7qmpra3xh3ga.postgres.database.azure.com`, B1ms burstable (~£11/month).
  AAD-only auth. See the **Database** section + `docs/DATABASE.md` for
  the connection recipe.

**Not provisioned (don't propose adding without checking with the platform team):**

- ❌ Blob / object storage (no Azure Storage account, no S3 equivalent).
- ❌ Queue / pub-sub (no Service Bus, no Event Hubs, no Redis).
- ❌ Cache layer (no Redis, no Memcached, no managed cache).
- ❌ Separate compute tier (no Functions, no App Service, no AKS — your
  `api/` runs in the shared sandbox described above).
- ❌ Scheduled / cron jobs ([#56](https://github.com/thevalueadd/provisioAI/issues/56)
  is open for this — currently the sandbox is request-driven only).
- ❌ Custom domains (you live at `aip.softcat.io/<owner>/<slug>/`).
- ❌ Per-user file uploads at scale. Small attachments inline in the DB
  are fine for now.

## Database

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

## API runtime — `api/`

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

## Members + permissions

End users on the publish allowlist are seeded into a Postgres table
the platform creates for you on every publish:

```sql
CREATE SCHEMA IF NOT EXISTS app;
CREATE TABLE IF NOT EXISTS app.members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  entra_oid   TEXT,
  role        TEXT NOT NULL DEFAULT 'member',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Check membership** in your API handlers before allowing writes:

```typescript
app.post("/notes", async (c) => {
  const email = c.req.header("aip-user");
  if (!email) return c.json({ error: "unauthenticated" }, 401);
  const r = await client.query(
    "SELECT 1 FROM app.members WHERE email = $1",
    [email],
  );
  if (r.rowCount === 0)
    return c.json({ error: "not_a_member" }, 403);
  // ...write the note
});
```

**The platform syncs `app.members`** from your publish allowlist on
every publish AND every permissions update — you don't have to
manage it yourself. Adding someone to the allowlist makes them a
member; removing them does NOT delete their member row (so their
historical content stays attributed).

## Lifecycle (publish + decommission)

Provisioning, every publish step (start / complete / fail), permission
changes, secret reveals, and decommissions all land in the project's
**Activity** tab (`/projects/<id>/activity` in the portal). Point the
owner there when they ask "did the publish fail?" or "who changed the
audience?" — it's the authoritative timeline. Append-only, so nothing
the app does can edit or delete it.

### Publish

Each click of **Publish** in the portal queues a publish saga:

1. **clone-source** — shallow clones `main` into the build sandbox.
2. **build-artefact** — runs `pnpm install --frozen-lockfile=false && pnpm build` (no network).
3. **migrate-database** — if `prisma/schema.prisma` exists, runs `prisma migrate deploy` against your Postgres. Forward-only — there is no automatic rollback on failure.
4. **bundle-api** — if `api/index.ts` exists, bundles it (esbuild → ESM)
   into a single `api.bundle.mjs`. Walks `package.json` deps.
5. **upload-artefact** — copies `dist/` into the host's storage.
6. **seed-app-members** — if collaboration is on, refreshes `app.members` from the publish allowlist.
7. **activate-publish** — atomically flips the host's pointer to the new
   build. The previous version keeps serving up to that moment, so a
   failed publish never takes the site down.

If any step fails, completed steps run their compensations in reverse and
the previous publish keeps serving. The build log is visible in the portal.

### Decommission

From the portal's project page → Admin actions → Decommission. The platform:

- Marks the project `decommissioned` in its database.
- **Deletes the Azure resource group** (and everything in it — DB, Log
  Analytics workspace, all data).
- **Deletes this GitHub repo.** No archive.

Both deletions are best-effort and audited. **Data is not recoverable.**
Take a backup first if there's anything you need to keep.

## Architecture orientation

> Replace this with a one-screen-at-most map of where things live:
> handlers, modules, packages, services. The clearer this is, the
> better any agent is at picking the right file when asked.

## Installed skills

Skills attached to this project at provisioning time. Each lives at
`.claude/skills/{slug}/SKILL.md` and is auto-discovered by any
Agent-Skills-aware tool (Claude Code, Copilot CLI, Cursor, Codex,
etc.) — the tool reads the skill's `description` frontmatter and loads
when the user's prompt matches.

_(none)_

## Where to put secrets

Never in this repo. Real values go in:

- **Per-developer:** `.env.local` (gitignored), or your shell
  environment. See `.env.example` for the variable names your code
  expects.
- **Per-project at runtime:** add via the portal Secrets tab
  (`/projects/<id>/secrets`). The platform encrypts at rest
  (AES-256-GCM) and injects them as env vars into your `api/` sandbox
  at request time.

If you accidentally commit a secret — rotate the secret first, then
`git filter-repo` to remove it from history.

## Configuration files in this repo

- **`CLAUDE.md`** — thin Claude Code-specific wrapper that imports
  this file and adds Claude-specific layering info (settings.json,
  MCP). Other tools ignore it.
- **`.claude/settings.json`** — Claude Code permissions + hooks.
  Committed. Don't put secrets in here.
- **`.claude/settings.local.json`** — _(gitignored)_ — per-developer
  Claude Code overrides.
- **`.claude/skills/<slug>/SKILL.md`** — Agent Skills (cross-tool).
- **`.mcp.json`** — MCP servers wired into this repo for Claude Code
  and any other MCP-aware client.
- **`docs/PLATFORM.md`** — the long-form deep dive on what the
  platform provides.

## Need help

- Issues / feature requests: <https://github.com/thevalueadd/provisioAI/issues>
- Portal: <https://aip.softcat.io>
