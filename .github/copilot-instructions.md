# DfE Digital Standards - Copilot — GitHub Copilot CLI

> Provisioned by the AI Provisioning Platform. The substantive
> instructions for this project — including platform conventions, the
> Postgres + Entra auth model, the `recordActivity` SDK, and the
> publish/decommission lifecycle — live in
> [`AGENTS.md`](../AGENTS.md) at the repo root. Read that first.
>
> Copilot CLI reads both this file and `AGENTS.md`, so anything you
> want to add Copilot-specific lives here; everything cross-tool stays
> in `AGENTS.md`.

## Copilot CLI–specific notes

- **MCP servers** wired into this repo are in `.mcp.json` at the repo
  root. The filesystem MCP is pre-configured; add others alongside it.
  Auth via env vars or OAuth — never directly in the file.
- **Skills.** Skills attached at provisioning time live at
  `.claude/skills/<slug>/SKILL.md` per the cross-tool Agent Skills open
  standard (Copilot CLI reads from this location too). The
  `platform-conventions` skill is pre-installed so you can ask Copilot
  to recall platform rules on demand.
- **Attribution.** Commits made via Copilot CLI can carry their own
  co-author trailer if your local Copilot config sets one; the
  platform doesn't pin a value.

## Need help

Read `AGENTS.md` for the full platform conventions, then reach out to
the platform team.
