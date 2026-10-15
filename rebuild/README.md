# Pralinen: React + Cloudflare rebuild

The replacement lives alongside the existing Firebase/Svelte app. The current Firebase deployment is unchanged.

## Current deployment

The public site is deployed at <https://pralinen.linaku94.workers.dev> with the `pralinen` D1 database and all four migrations applied. The initial admin invitation is `linaku94@gmail.com`. The session-signing secret is stored in Cloudflare; it is not in this repository.

Google login is configured and the owner has confirmed successful sign-in. The OAuth client uses authorized origin `https://pralinen.linaku94.workers.dev` and redirect URI `https://pralinen.linaku94.workers.dev/api/auth/callback/google`. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are stored in the Worker's runtime secrets. If Google’s consent screen is in testing mode, new invited admins must also be added as Google test users.

The initial deployment was made directly with Wrangler. GitHub automatic deployment has not been connected.

## Local preview

Use Node.js 22 or newer:

```sh
cd rebuild
npm ci
npm run content
npm run db:local
npm run dev
```

Open <http://localhost:5173>. Use that hostname consistently because login and write requests check the configured origin.

- `/`: redesigned homepage
- `/kollektionen`: collection archive, including all five imported years
- `/makingof`: our story and existing making-of photos
- `/vorschau`: development-only, read-only admin preview with fictional evaluation data, questionnaire preview and recipe layout
- `/admin`: real admin area, requiring an invited Google account
- `/umfrage/<token>`: a guest questionnaire link created in the admin area

The preview route has no authentication bypass and no access to real private data. It is not registered in production builds. The local D1 database persists in `.wrangler/` and is separate from any deployed database. Production historical feedback is not included in local schema/content migrations.

`npm run content` copies existing repository photos to ignored `public/images/`, generates the initial collection migration, and writes the imported preview content. It runs automatically before dev/build. It does not overwrite collection edits already saved in D1. Do not alter applied migrations; add a new migration for subsequent database changes.

## Enable real local Google login

1. Create a Google OAuth client of type **Web application**. Configure the consent screen and, if the client is in testing mode, add the intended admins as Google test users.
2. Add `http://localhost:5173` as an authorized JavaScript origin, and `http://localhost:5173/api/auth/callback/google` as an authorized redirect URI.
3. Copy `.dev.vars.example` to `.dev.vars`. Fill in the client ID and client secret locally. Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`. Never commit `.dev.vars` or paste credentials into chat.
4. Invite each admin by email using a parameterized SQL operation or the local D1 explorer. For example, replace the example address and run:

```sh
npx wrangler d1 execute pralinen --local --command="INSERT INTO admin_invites (email) VALUES ('admin@example.com') ON CONFLICT(email) DO NOTHING"
```

5. Restart the dev server and sign in at `/admin`.

Invitation means adding the email to `admin_invites`; this does not send an email. All invited admins have equal access. Only verified, invited Google users can register, and every private request checks the invitation again. Removing the row immediately revokes private access, including for existing sessions.

## Admin workflows

- **Collections:** create a draft, edit title/year/URL and descriptions, upload images, add and reorder pralines, preview, then publish. Unpublished collections are excluded from the public API.
- **Questionnaires:** create a draft linked to a collection; customize choice, 1–5 rating and free-text questions; preview; open it and copy its guest link. A collection must be published before its questionnaire opens. Closing stops new responses. Once opened, question definitions and the collection association are locked; create a new questionnaire for changed questions.
- **Evaluation:** filter by collection/questionnaire, view counts and distributions, inspect ratings and comments, search/paginate responses and export CSV. No responses are public.
- **Recipes:** save private ingredients, quantities/yield, preparation steps and notes with a praline label. Recipe content is not exposed through a public endpoint.

New uploads accept JPG/PNG/WebP up to 500 KB each. Uploaded gallery images are public; do not upload private recipe attachments through that endpoint. A 25 MB total upload cap protects database space. Existing imported images are served as static files. This deliberately avoids R2, which has usage-based overage billing.

## Free Cloudflare deployment

### Deploy automatically from GitHub

After the database, runtime secrets and production URL below are configured, connect `linaku94/pralinen` to **Cloudflare Workers Builds**. Cloudflare login through GitHub is separate from granting the Git integration access to this repository.

Use these build settings:

| Setting | Value |
| --- | --- |
| Worker name | `pralinen` |
| Root directory | `rebuild` |
| Node version | 22 or newer |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

Commit and push the new implementation and real D1 database ID before triggering the build. Keep OAuth credentials in Worker runtime secrets, not GitHub files or frontend build variables. Apply remote D1 migrations before the first application deployment and when later migrations are added. Workers Builds does not apply those migrations automatically with the deploy command above. Keep non-production branch builds from publishing to the production Worker.

The repo has a separate Yarn-based legacy application at its root; selecting `rebuild` is necessary to build the replacement. This rebuild uses its own npm lockfile.

Official setup: [Workers Git integration](https://developers.cloudflare.com/workers/ci-cd/builds/).

Use Workers Free and D1 Free. No Supabase, Firebase or paid storage service is required. Free quotas still apply: service can refuse requests after daily limits. Do not upgrade to paid plans if a strict zero-cost requirement applies. Check current [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) before deployment. The free `workers.dev` address avoids domain purchase costs.

1. Authenticate the Cloudflare CLI (`npx wrangler login`).
2. Create the database (`npx wrangler d1 create pralinen`) and replace `REPLACE_WITH_D1_DATABASE_ID` in `wrangler.jsonc` with the returned ID.
3. Set `vars.APP_URL` to the final `https://pralinen.<your-subdomain>.workers.dev` address. Use the exact origin, without a trailing slash.
4. Set the secrets with `npx wrangler secret put BETTER_AUTH_SECRET`, `npx wrangler secret put GOOGLE_CLIENT_ID`, and `npx wrangler secret put GOOGLE_CLIENT_SECRET`. Use a fresh production auth secret.
5. Add the production origin and `/api/auth/callback/google` redirect URI to Google’s OAuth client.
6. Run `npm run content` and `npm run db:remote`; add production `admin_invites` rows using the same approach as locally but with `--remote`.
7. Run `npm run build`, `npm test`, and `npx wrangler deploy`.
8. Verify actual Google login, publish a test collection/questionnaire, submit as a guest, and check that logged-out requests cannot read responses or recipes. Only then switch public links or a domain from Firebase.

Cloudflare and Google account configuration is required before an actual deployment or Google login can be verified. Build/test success alone does not verify Google’s callback configuration.

## Checks and migration

```sh
npm run check
npm test
npm run build
```

Tests use an isolated emulated D1 database and synthetic signed sessions. They verify anonymous/non-invited/revoked access denial, origin checks, collection imports, recipe persistence, survey lifecycle, answer validation, frozen questions, evaluation calculations and CSV escaping. They do not contact Google.

Before retiring Firebase, back up Firestore using an authorized export and remove password fields during import. Historical records have no explicit questionnaire ID: confirm their collection mapping before importing. The current repo’s Firestore rules allow public reads; this rebuild does not change the deployed rules.

## Historical feedback migration

On 2026-10-15, 52 Firestore responses were migrated to closed questionnaires: 29 for collection 2024 (December 2024–March 2025), and 23 for collection 2025 (December 2025–February 2026). The assignment was checked against the historical form choices in Git. The original `Kaktus-Eis` label is retained. Names, comments and submission times are preserved, including unanswered fields. No historical responses were deleted or changed in Firebase.

The export, generated SQL and verification receipts are private files under ignored `.migration/`. They must never be committed or copied into public assets. The exporter uses a Firestore field mask to exclude passwords at the source. Production had no existing questionnaires/responses before this import; that empty state is recorded locally. The separate D1 export endpoint was unavailable to the CLI token, so no full database export was taken.

To prepare a later import, use Node 22+:

```sh
node scripts/export-legacy-feedback.mjs .migration/source.json
node scripts/prepare-legacy-import.mjs .migration/source.json .migration/import.sql
```

Review the counts before writing. The importer only accepts the two verified historical date windows and their original flavour lists; conflicting or unknown records stop preparation for manual review. Apply schema migrations, then the reviewed data file, and verify every record:

```sh
npm run db:remote
npx wrangler d1 execute pralinen --remote --file .migration/import.sql
node scripts/verify-legacy-import.mjs .migration/source.json .migration/receipt.json
```

Stable Firestore-derived IDs and `legacy_feedback_imports` prevent duplicates. Replaying unchanged data is safe. Changed source content is rejected rather than overwriting an existing imported response. The scripts only print counts and validation metadata, not names/comments. File creation uses private permissions and refuses to overwrite existing exports/plans.

Migration is a snapshot, not continuous synchronization. The old Firebase form remains unchanged and can still collect new feedback until explicitly retired.
