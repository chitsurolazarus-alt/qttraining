# QT Training website + admin dashboard

Static HTML/CSS/JS site for QT Training (Pty) Ltd, backed by Supabase
(Auth, Postgres, Storage). No build step — every file here can be served
as-is by any static host.

## Project structure

```
index.html, about.html, courses.html, workshops.html, gallery.html,
news.html, events.html, contact.html    — public pages
admin/                                   — admin dashboard (noindex)
css/theme.css                            — light/dark design tokens
css/main.css                             — public site styles
css/admin.css                            — admin dashboard styles
js/supabase-client.js                    — shared Supabase client (anon key)
js/*.js                                  — per-page public site scripts
js/admin/*.js                            — admin auth guard + CRUD scripts
assets/logo/                             — processed logo variants, favicons
assets/images/ + assets/images/thumbs/   — content photos (from qttraining.zip)
```

## Supabase project

- Project ref: `krkvhkilntvkbmxtccrf` (region eu-west-1, Postgres 17)
- Tables created: `courses`, `workshops`, `news_posts`, `events`,
  `event_images`, `testimonials`, `gallery_images`, `enquiries`,
  `subscribers`, `site_settings`.
- Row-level security is enabled on every table. The public (anon) role can
  only read published content and insert into `enquiries`/`subscribers`;
  the authenticated role (the one admin login) has full read/write access.
- Storage bucket `site-uploads` holds images uploaded through the admin
  dashboard (News, Events, Gallery) — public read, authenticated write.
- Seed data already loaded: all 13 accredited courses, all 9 Workplace
  Power Sessions, the one client-supplied testimonial, and a 23-photo
  gallery pointing at the processed images in `assets/images/`.

## Logging into the admin dashboard

Go to `/admin/` and sign in with the admin's Supabase Auth credentials.

The account already exists — created via the Supabase Auth Admin API
(`POST /auth/v1/admin/users`, then a follow-up `PUT` to set the exact
password and display name below) using a service-role key the user
supplied directly for these calls, exactly as the project brief required
(no hand-inserted `auth.users` row, no guessed credentials). Login and
RLS access were both verified end-to-end before handoff.

- **Email:** `machel@qttraining.co.za`
- **Display name:** Machél Lombard (shown as "Logged in as Machél
  Lombard" in the sidebar and topbar)
- **Password:** `Qttraining@26` — **Machél should rotate this after her
  first login** (Supabase dashboard → Authentication → Users, or set a
  new one from within any app that supports it), since it's been shared
  in this planning conversation and repo documentation rather than sent
  through a private channel.

The login page (`admin/index.html`) doesn't create accounts — it only signs
in an account that already exists. There's only ever one admin account,
so no roles table is needed — RLS just checks `auth.role() = 'authenticated'`.

## Known follow-ups / open items

These were flagged during the build and still need a decision or asset
from the client before final launch:

1. **"Teamwork at the Workplace" audience ("for G12")** — meaning unclear.
   Currently described generically as "for entry-level teams" in the
   `workshops` table. Confirm with the client and update via the admin
   Workshops page.
2. **Contact details to reconfirm with the client**: the site uses
   "48 King Edward Drive, Lombard Building, Tzaneen, Limpopo" and
   015 307 2006 / 082 355 1517 as primary. Older documents also showed
   "48A King Edward Drive, Arbor Park" and other phone numbers
   (015 307 7791 / 076 417 4670 / 076 813 7053) — confirm which are still
   current.
3. **News = read-only feed, not email.** The News admin page publishes to
   `news_posts` only; it does not send emails to `subscribers`. If the
   client wants actual newsletter emails later, that needs a separate
   email-sending service integration — it hasn't been built here.
4. **Settings page** (`admin/settings.html`) currently stores contact
   details in the `site_settings` table for reference/future use, but the
   public site's footer and contact page still show fixed text. Wiring
   those to read live from `site_settings` is a small follow-up if the
   client wants to edit contact info without a redeploy.
5. **`event_images`** table exists (per spec, for an optional extra photo
   gallery per event) but has no admin UI yet — not built since it was
   marked optional. Add it later if the client wants multi-photo events.

Resolved since the last round: the founder's photo was found in
`assets/images/founder-machel-lombard.jpg` and is now wired into the
About page leadership section (processed to a ~1000px full + ~520px
thumb version, per spec).

## Running locally

Any static file server works, e.g.:

```
npx serve .
```

Then open `http://localhost:<port>/`. The Supabase client is loaded from
a CDN (`@supabase/supabase-js`), so an internet connection is required
even when running locally.

## Design system

Light/dark theme via CSS custom properties in `css/theme.css` (deep
navy primary, teal accent, gold reserved for highlights), toggled with
the sun/moon button in the header and remembered in `localStorage`. Used
consistently across both the public site and the admin dashboard. The
logo always sits on its own white chip in the nav (`.brand-chip`) so it
reads correctly in both themes and never clashes with the palette.

Three-tier colour system, matching the brief's own wording:
- **`--primary`** (navy) — nav/header/footer backgrounds, section
  headers, large dark panels. It's a genuinely dark navy in *both*
  themes here, so (unlike the previous two palette rounds) it can be
  used directly as a big background fill without a separate "always
  dark" token — though `--brand-fill` still exists as an alias for the
  handful of call sites that predate this palette.
- **`--accent`** (teal) — links, icons, secondary buttons, active nav
  states, most headings/labels that need to read clearly on a light or
  dark surface.
- **`--highlight`** (gold) — primary CTA buttons and key highlights
  *only*, kept deliberately rare so it stays attention-grabbing where
  it appears (main CTA buttons, the founder quote's accent bar).

Typography: **Poppins** (headings, `--font-heading`) + **Inter** (body,
`--font-body`), both loaded from Google Fonts on every page.

## Animation & interaction

All motion respects `prefers-reduced-motion`: a single global override
in `css/theme.css` collapses every transition/animation to near-zero
duration for anyone who has that OS setting on, rather than each
component needing its own reduced-motion branch. The JS-driven counters
in `js/animations.js` additionally jump straight to their final value
instead of counting up.

- **Scroll-reveal**: cards and grid items (`js/animations.js`) fade +
  slide up via IntersectionObserver as they enter the viewport, with a
  slight stagger so grid items don't all pop in at once.
- **Hero**: a slow Ken Burns-style zoom on the background image
  (`.hero-bg`, CSS keyframes) plus a fade/slide-in on the headline and
  CTAs on load.
- **Stat counters** on the homepage count up from 0 when scrolled into
  view (`data-counter` attributes + `js/animations.js`).
- **Cards and buttons**: hover lift (`translateY`) + shadow increase on
  cards; the gold CTA button gets a subtle scale + glow on hover.
- **Nav links**: an underline grows in from the left on hover/active
  (a `::after` pseudo-element scaled via `transform`, not just an
  instant border).
- **Theme toggle**: colour changes transition smoothly (`.3s ease` on
  background/text/border) rather than flashing instantly.
- **Admin dashboard**: each page's content area fades in on load, and
  list/table loading states show a small spinner (`.spinner`) instead
  of a blank flash.

## Admin dashboard shell

Multi-page (not a JS-routed SPA — acceptable per spec, simpler to keep
reliable with no build step). Every admin page:

- Redirects to `admin/index.html` on load if there's no active Supabase
  session (`requireAuth()` in `js/admin/auth-guard.js`).
- Shows "Logged in as `<email>`" + a Log Out button in the sidebar
  footer, and the same email in the topbar.
- Groups the sidebar nav into **Content Management** (Courses,
  Workshops, News, Events, Testimonials, Gallery) and **Management**
  (Enquiries, Subscribers, Settings), under Dashboard.
- Collapses the sidebar behind a hamburger toggle below 900px, matching
  the public site's mobile nav pattern.

The Dashboard page shows stat cards (courses, workshops, published
news, upcoming events, testimonials, unread enquiries, subscribers) plus
"Latest Enquiries" and "Latest Subscribers" (last 5 each, linking to
their full list).

## Finding the admin login

There's no visible "Admin" link in the public nav or footer by design.
Each public page has a small, low-opacity "THE END" link fixed to the
bottom-right corner (`.hidden-admin-link` in `css/main.css`) that goes to
`/admin/`. It's a discoverability choice, not a security control — actual
protection is Supabase Auth + RLS, which apply regardless of whether the
link is easy to find.

## Credit

Every public page footer links "Created by L.C Digital Solution" to
https://www.lcdigitalsolution.co.za/, per the client agreement.
