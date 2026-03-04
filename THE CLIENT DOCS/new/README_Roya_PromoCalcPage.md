# Promo Calc Page — Assets for Roya

## Files included
- `PromoCalcPage.jsx` — React component (Tailwind classes)
- `PromoCalcPage_PricingSpec.md` — pricing math & rules
- `PromoCalcPage_PricingConstants.json` — constants in machine-readable form

## Dependencies
- React 18+
- TailwindCSS
- `lucide-react` (`npm i lucide-react`)

## Integration tips
### Next.js (App Router)
- Place component in your codebase and render it from a route/page.
- Client components need `'use client'` at the top of the file that uses hooks.
  - Option A: add `'use client'` to your Next.js `page.jsx`
  - Option B: add `'use client'` to the top of `PromoCalcPage.jsx`

### Vite / CRA
- Place in `src/components/PromoCalcPage.jsx`
- Render `<PromoCalcPage />` in the desired route/page.

## Notes
- “3+ videographers” and “5+ days” are intentionally **Contact for quote**
- Submit uses `mailto:` to create an email draft in the user's mail client
