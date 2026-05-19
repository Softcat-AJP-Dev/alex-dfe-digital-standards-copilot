// AI Provisioning Platform — in-app activity SDK.
//
// Platform-provisioned helper. The project owner sees rows you write
// here on the project's Activity tab in the portal, merged with the
// platform-side audit (provisioning, publishes, permission changes).
//
// Pass any pg-compatible client that exposes `query(text, values)` —
// typically the same `pg.Client` you already opened for your handler.
// recordActivity does not open its own connection.
//
// Example, inside an `/api/*` Hono handler:
//
//   import { recordActivity } from "./_aip/activity";
//
//   await client.query("INSERT INTO customers (...) VALUES (...)", [...]);
//   await recordActivity(client, {
//     action: "customer.create",
//     resourceType: "customer",
//     resourceId: newCustomerId,
//     actor: {
//       email: c.req.header("aip-user") ?? null,
//       oid: c.req.header("aip-user-oid") ?? null,
//     },
//   });
//
// metadata is owner-visible. Don't put PII or secrets there.

export interface ActivityActor {
  email?: string | null;
  oid?: string | null;
}

export interface ActivityEvent {
  /** Verb-style identifier — recommended dot-separated, e.g. "customer.create". */
  action: string;
  /** Singular noun for the kind of thing acted on — "customer", "note", ... */
  resourceType: string;
  /** Optional id of the specific row touched. */
  resourceId?: string | null;
  /** Free-form structured details. Owner-visible — no secrets. */
  metadata?: Record<string, unknown>;
  /** Optional actor. In `/api/*` handlers, pull from the aip-user / aip-user-oid headers. */
  actor?: ActivityActor;
}

export interface ActivityRecorder {
  query(text: string, values?: unknown[]): Promise<unknown>;
}

export async function recordActivity(
  client: ActivityRecorder,
  event: ActivityEvent,
): Promise<void> {
  await client.query(
    `INSERT INTO app.activity
       (actor_email, actor_oid, action, resource_type, resource_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
    [
      event.actor?.email ?? null,
      event.actor?.oid ?? null,
      event.action,
      event.resourceType,
      event.resourceId ?? null,
      JSON.stringify(event.metadata ?? {}),
    ],
  );
}
