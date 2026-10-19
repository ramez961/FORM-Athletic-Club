# FORM Athletic Club

A static gym website. Open `index.html` to preview, or publish the repository root with GitHub Pages (main branch, / root). No installation or build step.

- `index.html` — home page
- `shop.html` — full demo shop: hoodies, women’s training wear, kits and equipment, with a size guide
- `case-study.html` — portfolio case study (design system, features, build)
- `profiles/` — six staff pages
- `style.css` — all styling
- `main.js` — home page features: schedule, planner, BMI, membership
- `shop.js` — product catalogue and shopping bag (saved on the device), used by the home page and `shop.html`
- `common.js` — small helpers shared by `main.js` and `shop.js`
- `nav.js` — mobile menu and scroll animations, shared by every page
- `assets/` — WebP images (360 px and 640 px variants; hero photo in four widths), share image, icons
- `assets/fonts/` — self-hosted DM Sans and Manrope (SIL Open Font License)

Payments, accounts, live bookings, and checkout are demo features. Staff identities and sample reviews are fictional.


## Personal workout log

Open `workouts.html` from the Workout log navigation link. Plan sessions by date, move or repeat them, and record exercises with reps, weight and completion for each set. Switching a session between kg and lb converts its existing weights. Repeating a session keeps the exercises and weights while resetting completion.

Entries autosave under `form-workout-log-v1` in localStorage for the current browser and origin. No account or server is involved; entries do not sync between devices. Download a JSON backup to keep a copy or restore it in another browser. Restoring replaces the current log after confirmation. If storage is blocked or full, the page shows a warning and the current log can still be downloaded.
