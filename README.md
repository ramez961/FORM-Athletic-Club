# FORM Athletic Club

A complete original gym brand concept and responsive interactive landing page. Built with plain HTML, CSS and JavaScript, with no framework dependencies or build step.

## Run locally

Use Node.js 22 or newer, then run `npm start` from this directory. Open http://127.0.0.1:4173. Run `npm run check` for JavaScript syntax validation. The `dist` directory can be deployed to a static host or GitHub Pages.

## Included

- Custom wordmark, visual system, editorial copy and responsive layouts.
- Three fictional coach identities with original abstract avatar artwork.
- Three class formats and an interactive six-day timetable.
- Reservation and cancellation demo using browser local storage.
- Club, Plus and Coached membership pricing with monthly/annual toggles.
- Membership interest dialog with local save and deletion.
- Adult training planner using goals, experience, age, frequency and duration.
- Downloadable plain-text schedule; profile editing preserves entered values.
- Keyboard focus styles, native dialog, form validation and reduced motion support.
- Business blueprint, production roadmap and GitHub Pages workflow.

## What is a demo

Coach names, pricing, services and timetable are illustrative business content. No accounts, payments, emails, real bookings or shared databases are connected. No data is transmitted by the application. Profile measurements remain in the tab; interest and reservation records remain in local storage until cleared. External Google Fonts and the Unsplash hero image make browser network requests. Replace these with licensed local assets if offline operation or stricter privacy is required.

The program is a rules-based general suggestion, not AI, medical assessment, rehabilitation or individualized professional coaching. Gender and body measurements are collected as profile context but do not change exercise intensity or calorie targets. A coach must review actual member programs.

## Source map

`dist/index.html`: structure and content. `dist/style.css`: visual system and responsive rules. `dist/app.js`: schedule, pricing, local interest and planner behavior. `server.mjs`: development server. `BUSINESS-MODEL.md`: proposed operating model. `PRODUCTION-ROADMAP.md`: data model and release plan.

## GitHub handoff

Repository destination: https://github.com/ramez961/FORM-Athletic-Club. The included workflow deploys `dist` to GitHub Pages from `main`; enable Pages using GitHub Actions in repository settings when ready to publish. Uploading source does not by itself connect production services.

## Verification

JavaScript syntax checked. Local browser planner flow, annual pricing and class reservation exercised successfully. Production release needs credentials, staff data, location, final terms and real server integrations.

## Reference guidance

GitHub Pages workflow structure follows [GitHub's documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). General movement principles were checked against [CDC older adult activity guidance](https://www.cdc.gov/physical-activity-basics/guidelines/older-adults.html); the demo's exact exercises and scheduling rules are illustrative implementation choices and are not clinically validated.
