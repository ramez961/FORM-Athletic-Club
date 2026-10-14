# FORM Athletic Club

A responsive gym website with custom branding, AI-generated staff photography, class scheduling, membership pricing, dedicated staff profiles, a metric/imperial BMI calculator, a downloadable training planner, and a filterable merchandise shop with a demo shopping bag.

## Run

Use Node.js 22 or newer. Run `npm start`, then open http://127.0.0.1:4173. Run `npm run check` for JavaScript syntax validation. No dependencies or build step are required.

## Deploy

Publish the `dist/` directory to a static host. The included workflow deploys it to GitHub Pages from `main` when Pages is enabled with GitHub Actions.

## Files

- `dist/index.html`: website structure and copy
- `dist/style.css`: responsive design
- `dist/app.js`: planner, pricing, local reservations, and pricing
- `dist/extras.js`: BMI calculator, shop, shopping bag, and mobile menu
- `dist/refine.css`: editorial design and reference palette
- `dist/profiles/`: six staff profile pages
- `dist/assets/`: FORM emblem, browser icons, and six branded staff portraits
- `server.mjs`: local development server

## Demo behavior

Reservations and membership interest are stored on the current device. No payment, email, account, or live booking service is connected. The planner provides general adult training suggestions for coach review. The team is fictional; portraits do not represent real professionals or verified credentials. Google Fonts and the hero photograph load from external services.

## Generated assets

Created with the built-in image-generation tool. The logo brief: original angular forest-charcoal F monogram, transparent background, strong silhouette for favicon and shirt embroidery. Portrait briefs: warm naturally lit editorial photographs in contemporary studios; fictional strength coach Alex in charcoal, conditioning coach Nadia in sage, movement coach Jamie in ivory, Pilates coach Sofia in sand, physiotherapist Daniel in sage polo, dietitian Maya in ivory polo. The exact FORM emblem is embroidered on each shirt. Image exports are resized/compressed for website delivery.

The shop includes men’s apparel, women’s apparel, volleyball and football kits, gym essentials, and a multisport ball collection. All product imagery uses the FORM emblem. Reviews are explicitly fictional sample content. BMI categories follow [CDC adult guidance](https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html).

