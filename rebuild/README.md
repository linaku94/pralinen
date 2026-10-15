# Pralinen: React + Cloudflare rebuild

The replacement lives alongside the existing Firebase/Svelte app. The current Firebase deployment is unchanged.

## Current deployment

The public site is deployed at <https://pralinen.linaku94.workers.dev> with the `pralinen` D1 database and all five migrations applied. The initial admin invitation is `linaku94@gmail.com`. The session-signing secret is stored in Cloudflare; it is not in this repository.

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
- `/vorschau`: development-only admin preview with fictional evaluation data, a questionnaire preview and an interactive recipe/shopping-list sandbox; sandbox changes stay in browser local storage
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
- **Recipe details:** structured ingredients include quantity, unit, section and individual notes. Recipes also support source references, alternative quantities, a recommendation status, and source warnings. Preparation instructions can remain blank when the source does not provide them. Quantity `0` and an unknown quantity (`null`) remain distinct.
- **Shopping lists:** the recipe book includes a separate private area for yearly ingredient quantities, hollow shells, additional shopping, equipment, ordering information and notes. Imported yearly lists are snapshots and are not automatically recalculated from recipe edits.

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

## Recipe workbook import

On 2026-10-15 the owner-provided Google workbook was read without changing the source. Seven recipes and two yearly shopping lists were imported. Every imported record keeps an immutable source-cell archive, including all 305 populated cells, cached values, original formulas, hyperlinks and notes. The admin editor exposes this under **Originaldaten**. The archive is private and is not replaced when admins edit recipe fields.

The import retains original zero/unknown quantities and incomplete instructions. Source issues are shown as warnings: the zero Eierlikör quantity, a 2025 Matcha quantity still calculated from an Eierlikör formula, mixed cream units in shopping totals, and the 2024 side heading copied into the 2025 list. The Dubai attempt retains its original notes in the source archive; recipes have no grading/status system. No missing Matcha or Kaktus recipe was invented.

Private snapshots, generated SQL, plans and verification receipts live under ignored `.migration/`, never in Git or public assets. The workbook was downloaded through the authenticated browser; the extracted JSON records each nonempty cell's address, row, column, cached value, number format and any formula/comment/hyperlink. Repeat imports use deterministic IDs and a source-hash ledger, so they do not duplicate or overwrite edited recipes; changed source snapshots require explicit review.

```sh
node scripts/prepare-recipe-import.mjs .migration/recipes-source.json .migration/recipes-import.sql .migration/recipes-plan.json
npm run db:remote
npx wrangler d1 execute pralinen --remote --file .migration/recipes-import.sql
node scripts/verify-recipe-import.mjs .migration/recipes-plan.json .migration/recipes-verification.json
```

The mapper is intentionally tied to the reviewed workbook layout and refuses unexpected or missing worksheets. Before using a revised workbook, review its layout and mappings. Source-cell archives preserve the full snapshot, while explicitly mapped fields provide editable recipe and shopping-list views. These source formulas are retained for reference; the application does not execute spreadsheet formulas.

### Recipe and shopping-list modes

Recipes open in a full read view with ingredients, quantities, preparation, variants, notes, references and original source data. **Bearbeiten** opens a draft; **Abbrechen** discards it. Recipe ratings were removed (migration 0006 also removes the old status property from stored recipe details).

Shopping lists can be created from the separate admin tab **Einkaufslisten → Neue Einkaufsliste** or directly from a recipe. The read view provides persistent shopping checkboxes; editing allows adding or changing individual items and notes. Add one recipe batch from either a recipe or a shopping list. Repeating the action adds another batch. Ingredients with matching normalized names and units are summed across recipe sections. Names ignore case, punctuation and extra spaces; simple unit aliases such as Gramm/g match. Different units, different chocolate types and unknown versus known quantities stay separate. Missing quantities are never treated as zero. Newly added quantities reopen the affected checkbox. Recipe edits do not retroactively change a list.

Shopping-list writes use a revision check to prevent stale browser tabs from silently overwriting newer changes. All new routes retain the admin invite and origin checks.

The shopping-list read view also has a direct **Artikel manuell hinzufügen** form. Both recipe and shopping-list editors use a common unit dropdown, with custom and no-unit choices. Existing custom labels are preserved; common aliases such as Pck./Packung are treated as the same unit when merging ingredients.
