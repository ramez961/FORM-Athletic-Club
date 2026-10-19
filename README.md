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

## Training companion

- Build and preview four weeks from experience, goal, available equipment, training days, session time and weight units. Occupied dates are skipped; existing sessions are never replaced by plan generation.
- Beginners receive two or three full-body days with recovery spacing. Four-day plans alternate upper and lower body. Sessions and individual exercises remain editable.
- Browse 34 movements across bodyweight, dumbbells, resistance bands, machines, cables and barbells. Instructions, experience filters and exercise swaps are built in. Custom movements still work.
- Guided mode supplies rest timers, readiness advice and rep ranges. Progression suggestions compare earlier completed sets for the same exercise, converting kg/lb for the comparison. The user chooses whether a load increase is appropriate; no load is increased automatically.
- Food timing uses the chosen workout time, approximate duration and mixed/vegetarian/plant-based preference. Examples are general guidance, not a complete daily menu, calorie prescription or medical diet. Sources are linked in the page (NHS and Mayo Clinic).
- Each browser profile has an independent log and preferences. The original log stays under `form-workout-log-v1`; additional profiles use `form-workout-log-v1:<profile-id>`. The profile registry and active selection use `form-workout-users-v1` and `form-workout-active-user`. Profiles provide separation, not authentication or cloud sync.
- Backups contain the selected profile's log and training preferences. Restore them into the intended profile. Previous v1 backups without preferences remain valid.

`training-model.js` contains the deterministic planning and progression rules; `training-ui.js` integrates them with `workouts.js`. No AI service, account backend or external data transmission is used.

Run the standalone model checks with `node tests/training-model.test.cjs` (no install or build step). They cover 108 plan combinations, scheduling constraints, occupied dates, ID uniqueness, history eligibility and unit conversion.
