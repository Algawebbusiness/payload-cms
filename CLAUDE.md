# Payload CMS (Sliplane Deployment)

## Status: WORKING
Payload CMS is deployed and running at https://cms.algaweb.site. Auto-deploy from GitHub is working. First admin user needs to be created at /admin.

## Project Location
- **Local**: `/home/jiri/vibecode/payload-cms/` (also at `/home/jiri/Nextcloud/vibecode/payload-cms/`)
- **GitHub**: https://github.com/Algawebbusiness/payload-cms
- **GitLab mirror**: https://git.algaweb.cz/algaweb/payload-cms
- **Live URL**: https://cms.algaweb.site

## Stack
- Payload CMS v3 (`^3.77.0`) with PostgreSQL adapter
- Next.js 15.4.11 (pinned exact version - DO NOT use `^`)
- Node 22, Docker multi-stage build, standalone output
- Sliplane container hosting (Germany/nbg server)

## Sliplane IDs
- **Project**: `project_87svpxfeevaz`
- **Payload CMS service**: `service_qbshp213llei` (public, payload-cms.sliplane.app)
- **PostgreSQL service**: `service_a6sjl0545u1b` (private, postgres-e79lla.internal)
- **Server**: `server_x2ux4sgrmbnn` (Base tier)
- **Volume**: `volume_in4tx54cv40d` (mounted at /app/media)

## Environment Variables (on Sliplane service)
- `DATABASE_URL` (secret): `postgresql://payload:85a5a5211225ae9575bc9c66f315cff9@postgres-e79lla.internal:5432/payload`
- `PAYLOAD_SECRET` (secret): `713fe37c9a2d5946b447768e17ad5a9e4c16e6568568f4eb6cff2c3b73f4d684`
- `NEXT_TELEMETRY_DISABLED`: `1`
- `SLIPLANE_SKIP_CACHE`: `true`

## Key Files
- `src/payload.config.ts` - Main Payload config (PostgreSQL adapter with `push: true`)
- `src/app/api/health/route.ts` - Health endpoint for Sliplane healthcheck (no DB dependency)
- `Dockerfile` - Multi-stage build, uses `npm install` (not `npm ci`), runs as `nextjs` user
- `.dockerignore` - Excludes node_modules, .next, .git, .env
- `next.config.mjs` - Has `output: 'standalone'` and webpack extensionAlias config
- `package.json` - `next` pinned to `15.4.11` (exact, no caret)

## Resolved Issues
1. **ERESOLVE peer dep conflict**: `next@^15.4.11` resolved to 15.5.12 but `@payloadcms/next` needs `<15.5.0` → Fixed by pinning `next` to exactly `15.4.11` (no caret)
2. **npm ci lockfile sync**: Missing packages due to npm version mismatch → Fixed by using `npm install` instead of `npm ci` in Dockerfile
3. **Missing public dir**: Dockerfile COPY failed → Fixed by creating `public/.gitkeep`
4. **Missing .dockerignore**: node_modules in build context → Fixed by adding `.dockerignore`
5. **DB schema missing**: `relation "users" does not exist` → Fixed by adding `push: true` to postgresAdapter()
6. **Healthcheck failures**: Sliplane healthcheck on `/` failed during Payload schema init, causing rollback to old container → Fixed by adding `/api/health` endpoint and updating Sliplane healthcheck to `/api/health`
7. **Auto-deploy not triggering**: Earlier builds failed, causing Sliplane to cache failed state → Fixed by updating env vars via API (which triggers rebuild) + SLIPLANE_SKIP_CACHE=true

## Sliplane MCP Notes
- `deployService` API returns 400 for repo-based services (only works for image-based)
- `updateService` requires `deployment` field in request body (otherwise 400)
- `updateService` with env changes DOES trigger a rebuild
- Secret env vars: pass empty value `""` to preserve existing secret value
- Auto-deploy webhook URL: `https://api.sliplane.io/infra/webhooks/github/service_qbshp213llei`
- Healthcheck is set to `/api/health` (lightweight, no DB dependency)

## Next Steps
1. Create first admin user at https://cms.algaweb.site/admin
2. Add collections for actual content
3. Consider adding email adapter for production
