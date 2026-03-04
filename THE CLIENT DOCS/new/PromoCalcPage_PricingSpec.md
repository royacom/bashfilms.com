# PromoCalcPage — Pricing Spec (for Roya)

Generated: 2026-03-02

## Supported locations
- Las Vegas
- Other US City

## Contact for quote
If either is selected:
- **Videographers = 3+** (UI sets `rooms = 6`)
- **Days = 5+** (UI sets `days = 7`)

Then the Starting Price shows: **"Contact for quote"**.

## Starting price formula
### Base (Las Vegas and Other US City)
`base = days * videographers * 1500`

### Raw footage add-on (both locations)
If deliverable = raw:
- `+ 100`

### Editing add-on (both locations)
If deliverable = editing:
- Tier base:
  - Basic (`button1`) = 500
  - Standard (`button2`) = 1000
  - Advanced (`button3`) = 1250
- Day multipliers:
  - 1 day: 1.0
  - 2 days: 1.2
  - 3 days: 1.3
  - 4 days: 1.4
  - 5 days: 1.5

`editingAddon = round(tierBase * multiplier)`

### Travel (Other US City only; included in starting price)
For `location === "Other US City"`:
- Airfare: `videographers * 800`
- Hotel rooms: `ceil(videographers / 2)`
- Hotel nights: `days`
- Hotel rate per room/night:
  - Bash Films pays: `350`
  - Event provides: `150`
- Per diem: `videographers * (days + 1) * 150`
- Luggage: `videographers * 225`
- Ground: `videographers * 125`

`travel = airfare + hotel + perDiem + luggage + ground`

### Total
`total = base + travel + rawAddon + editingAddon`

## Dependencies / styling
- React component uses Tailwind utility classes
- Uses `lucide-react` for the check icons
