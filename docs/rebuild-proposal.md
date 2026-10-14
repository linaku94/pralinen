# Pralinen rebuild proposal

## Repository review

The current application uses SvelteKit 2, Svelte 5, Tailwind CSS 4, Firebase Hosting and Firestore. Collections for 2021–2024 have individual routes; the current collection is 2025 at `/pralinen`. Photos and German copy can be reused.

Collection content and questionnaire choices are embedded in application code. There is no admin authentication, collection editor, questionnaire editor, or recipe workspace.

`src/routes/auswertung/+page.svelte` fetches every feedback document in the browser, filters using a fixed timestamp, and renders best/worst pie charts and a response table. Questionnaire and evaluation headings use different years. Results should instead belong to an explicit questionnaire and collection.

The checked-in `firestore.rules` allow unauthenticated reads across every document, including configuration. Creates are permitted across every collection if the supplied password matches the configuration password. The questionnaire saves that password in each response. If deployed, these rules expose feedback and the survey password; hiding the evaluation navigation would not resolve this. The deployed rules have not been inspected.

## Proposed experience

Keep the site in German. Use warm cream, cocoa and restrained raspberry accents, readable typography, a responsive gallery, and existing photography. Public navigation should emphasize the current collection, archive, making-of and tasting questionnaire.

Public visitors can browse published collections and praline details, then submit a questionnaire linked to a collection. Guests do not need an admin account. Decide whether survey links are openly accessible or require a separate invitation/password.

Invited admins can:

- Create, edit, preview and publish collections; upload photos and reorder pralines.
- Create questionnaires with single-choice, rating and free-text questions; preview, open and close them.
- View evaluation by collection and questionnaire: response counts, best/favourite and improvement votes, rating distributions where applicable, comments, and CSV export.
- Keep private recipes with ingredients, quantities, yield, preparation steps and notes, linked to pralines where useful.

Recipes and evaluations are private by default. Admin identities must be explicitly invited or allowlisted. Signing in alone must not grant admin access.

## Provisional stack

### Confirmed direction after review

The user selected free plans only, Google login for invited admins, and guest survey links. The implementation now lives in `rebuild/`: React + TypeScript/Vite, Cloudflare Workers + D1, and Better Auth for Google OAuth. Small gallery uploads are stored in D1 with per-file and total caps; existing photos remain static assets. Supabase and R2 are not used. There is a development-only read-only admin preview with fictional responses at `/vorschau`. Real Google login and external deployment await account configuration; see `rebuild/README.md`.

React + TypeScript with React Router framework mode is a candidate replacement for Svelte. Cloudflare Workers can host the application and static assets. Supabase is a candidate for PostgreSQL, managed authentication and image storage.

This choice is provisional pending hosting budget and login preferences. Supabase's free projects can pause after low activity over seven days; this matters for a seasonal site. If entirely free hosting and uninterrupted availability are priorities, evaluate Cloudflare D1/R2 with a compatible maintained authentication solution before choosing the database. Do not implement custom password cryptography.

Official references:

- [React Router deployment](https://reactrouter.com/start/framework/deploying)
- [Cloudflare static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Supabase free project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)

## Data and access model

Use collections, pralines, collection-praline associations, questionnaires, versioned questions/options, submissions/answers, recipes/ingredients, and admin memberships. Each submission references its questionnaire and the question version used when answering. Do not change published questions in ways that silently reinterpret existing answers; create a new version.

Public users may read published collection content and active questionnaire definitions. They cannot read responses, recipes, admin memberships or private drafts. Submit through a validated server endpoint that checks questionnaire status, allowed choices and field lengths; add abuse protection. Survey passwords, if retained, are checked on the server and never stored in responses.

Admin routes, mutations, exports and private image downloads must all check authenticated admin membership. With Supabase, enforce row-level security alongside server checks. Public sign-up must not create admin memberships. Separate public collection images from private recipe attachments.

## Migration and delivery

1. Confirm budget, admin login, questionnaire access and whether historical feedback should be migrated.
2. Build the new application alongside the existing site so Firebase remains available during development.
3. Import collection copy and existing images from this repository. Verify year labels and preserve existing public URLs or redirect them.
4. Implement admin authentication and database permissions before connecting private features.
5. Deliver collection editing, questionnaires, evaluation and recipes in that order.
6. If migrating feedback, obtain an authorized Firestore export. Remove password fields. Historical feedback has no explicit questionnaire identity: map records using verified dates/content, and flag ambiguous records rather than guessing.
7. Verify mobile layouts, keyboard access, admin/non-admin permissions, questionnaire validation and aggregation using known sample responses.
8. Deploy to the selected provider, configure login callbacks and secrets, and verify on the real deployment before switching public links/domain. Back up historical feedback before retiring Firebase.

This document is a repository review and proposed implementation scope. It does not change the current application or deployment.
