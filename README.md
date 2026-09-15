# Maharashtra Olympic Association

React 18 + TypeScript public website and Express/MongoDB administrative CMS, with a responsive blue-and-gold Bento interface and light, dark and system themes.

## Run locally

Requires Node.js 22 and MongoDB 7 (local, Docker, or Atlas).

1. Run `npm ci` at the repository root.
2. Copy `.env.example` to `.env`. Set `MONGODB_URI`, a random `JWT_SECRET` (at least 32 characters), `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` (12–72 characters). Never commit `.env`.
3. For local MongoDB, run `docker compose up -d`.
4. Run `npm run seed` to create the first administrator. Optionally run `npm run seed -- --demo` to add clearly labeled sample content to an empty database.
5. Run `npm run dev`. Open `http://localhost:5173` and sign in at `/admin/login`.

No default password is included. Signup always creates a member account; a super administrator assigns staff roles through Users & Roles. The seed command never overwrites an existing account.

## Implemented

- Public home, about, events, news, circulars, results, medal tally, committee, directory, gallery, athletes and contact pages.
- MongoDB-backed CRUD with draft, published and archived visibility; create/edit/delete/duplicate forms, search, filters, sorting, client pagination and CSV export.
- Event registration; automatic medal aggregation by district/sport with sport, competition and year filtering.
- bcrypt passwords, 15-minute JWT access tokens held in memory, rotating 7-day HttpOnly refresh cookies, server-side session revocation and role checks.
- Profile name/photo/phone, persisted theme and accessibility preferences, password change, active sessions and logout from all devices.
- Staff roles: super administrator, event manager, content manager, results manager, directory manager, viewer; plus public members.
- Cloudinary image/PDF uploads with size and signature validation; media library; contact enquiry inbox.
- Audit activity, notification feed and notification preferences; server validation, Helmet, origin restrictions and rate limiting.

## Build, test and deployment

`npm run build` builds client and server. `npm test` checks authentication, role boundaries, publication visibility, session rotation/revocation and medal calculations against an isolated MongoDB. Tests use `TEST_MONGODB_URI` if present (the selected database is erased!), otherwise mongodb-memory-server downloads an ephemeral MongoDB binary.

For a Node hosting service, deploy the complete repository, run `npm ci && npm run build`, and start with `npm start`. Set `NODE_ENV=production`, `CLIENT_ORIGIN` to the exact HTTPS origin, and configure MongoDB, JWT and Cloudinary environment variables in the host's secret settings. Express serves the compiled React application and API on one origin. `PORT` defaults to 4000. Keep the frontend and backend on the same origin because refresh cookies use SameSite=Strict.

This Express/Mongoose application requires a Node server and MongoDB; GitHub Pages and the Cloudflare Workers Sites runtime do not run this backend. It has not been deployed to a live hosting account. Cloudinary requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`; PDF delivery may require enabling PDF delivery in Cloudinary account settings.

## Scope and remaining work

See [docs/implementation-status.md](docs/implementation-status.md) for the wider uploaded brief, implemented features and remaining integrations. This is a core CMS implementation, not a claim that every feature in the expanded briefs is finished. No live payments, social login, outbound email or 2FA are implied by this build.

Official logo, approved leadership profiles, contact details, sponsor assets, historical copy and memorial material must be supplied before official launch. Sample data is explicitly marked. The brand uses a temporary trophy mark, not an official MOA logo.

Stadium image: Rdglobetrekker, [Balewadi Athletics Stadium](https://commons.wikimedia.org/wiki/File:Balewadi_Athletics_Stadiums_Interior.jpg), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), displayed cropped with an overlay; photograph depicts a 2010 football match, not a claimed MOA event.
