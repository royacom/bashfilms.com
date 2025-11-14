# Bash Films – Interactive Pricing Page (ROYA Handoff)

This package contains the React component for the **Bash Films conference pricing** UI you saw in the prototype. It’s production‑ready CSS‑wise (Tailwind utilities) and uses a single dependency for icons.

---

## What’s included

```
/src/components/BfThurNightPricingPage.jsx   ← React component (default export)
README_ROYA.md                                ← this file
```

> If ROYA prefers TypeScript, rename the file to `BfThurNightPricingPage.tsx` (no code changes required).

---

## Option A — Integrate directly in ROYA’s build (recommended)

**Dependencies**

- React 18 and React‑DOM 18
- Tailwind CSS (utility classes used throughout)
- `lucide-react` (icons)

**Install**

```bash
npm i react react-dom lucide-react
# Tailwind
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Tailwind config** (example)

```js
// tailwind.config.js
module.exports = { content: ["./src/**/*.{js,jsx,ts,tsx,html}"], theme: { extend: {} }, plugins: [] }
```

**Global CSS**

```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Mounting** (example with React 18)

```jsx
// App.jsx
import PricingResetPreview from "./components/BfThurNightPricingPage";
export default function App() { return <PricingResetPreview />; }
```

**Next.js (App Router)**

```tsx
// app/pricing/page.tsx
import dynamic from "next/dynamic";
const Pricing = dynamic(() => import("@/components/BfThurNightPricingPage"), { ssr: false });
export default function Page() { return <div className="min-h-screen"><Pricing /></div>; }
```

**Notes**
- The component uses a fixed **mobile bottom bar**. Ensure the page has enough bottom padding so it doesn’t overlap any parent footer.
- The **Submit quote** button composes a `mailto:` to `mbashian@bashfilms.com`. If ROYA prefers a backend email/send, see “Server submit” below.

---

## Option B — Embed as an iframe (no build in ROYA)

1. Host a simple page that renders the component (any host: Netlify, Vercel, S3).
2. On the ROYA page, embed it:

```html
<iframe
  id="bashfilms-pricing"
  src="https://your-host/pricing.html"
  style="width:100%;border:0;"
  sandbox="allow-top-navigation-by-user-activation allow-scripts allow-same-origin"
  scrolling="no"
></iframe>
```

> `allow-top-navigation-by-user-activation` enables the `mailto:` to open from user clicks.

3. Add bottom padding on the parent page to account for the mobile sticky bar.

> For auto‑height, ROYA can wire `iframe-resizer` or a simple `postMessage` height ping from the child.

---

## Server submit (optional, if avoiding `mailto:`)

Add a click handler that `fetch`es your endpoint instead of opening `mailto:`:

```ts
// replace handleSubmitQuote() contents
fetch("/api/quote", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(buildEmail()) // contains subject, body, and flattened fields
}).then(() => alert("Thanks! We’ll be in touch."));
```

**Payload shape** (from `buildEmail()`)

```json
{
  "to": "mbashian@bashfilms.com",
  "subject": "Quote request – …",
  "body": "plain text block",
  "mailto": "mailto:…",
  "flat": {
    "name": "<contactName>",
    "email": "<contactEmail>",
    "phone": "<contactPhone>",
    "event": "<eventTitle>",
    "website": "<eventURL>",
    "date": "<month day, year>",
    "location": "<Las Vegas|Other US City|International>",
    "days": 2,
    "rooms": 1,
    "turnaround": "4w",
    "hotelOption": "bash_pays",
    "meals": "no",
    "price": "$2,000.00",
    "notes": "<notesText>"
  }
}
```

---

## QA checklist ROYA can use

- **Default date** = today + 75 days (month/day/year dropdowns prefilled).
- **LV 1‑day** allowed; **non‑LV 1‑day** disabled with helper text.
- **Starting price** for LV + 1 day + 1 room + “4 weeks” + per‑diem default shows **$2,000**.
- **Submit button** enabled only when **email + phone + event name** are valid.
- Copy shows **Human Videographers Only (NEVER robotic cameras)** with **NEVER** bolded.
- Meals “Discount” reduces per‑diem (server math already wired).
- Sticky price appears on desktop top‑right and mobile bottom bar.

---

## Support / Contact

If ROYA needs a different integration style (no Tailwind, no React build, etc.), ping Mark and we’ll supply an alternate skin or a build‑less HTML variant.
