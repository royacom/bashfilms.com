# Bash Films - Pricing Calculator Documentation

**Last Updated:** January 2025
**Developer:** Roya Development Team
**Client:** Bash Films (mbashian@bashfilms.com)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [CMS Integration Scripts](#cms-integration-scripts)
5. [Modal Configuration](#modal-configuration)
6. [Form Fields & Validation](#form-fields--validation)
7. [Workflow Diagram](#workflow-diagram)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Future Maintenance](#future-maintenance)

---

## Project Overview

### Client Information
- **Company:** Bash Films
- **Contact:** mbashian@bashfilms.com
- **Service:** Conference Presentation Recording & Editing

### Purpose
An interactive pricing calculator that helps potential clients estimate costs for conference video recording and editing services. The calculator considers multiple factors:
- Event location (Las Vegas, Los Angeles, San Diego, etc.)
- Number of days
- Simultaneous locations/rooms
- Turnaround time
- Hotel arrangements
- Meal provisions

### Key Features
- ✅ Real-time price calculations
- ✅ Event date picker (defaults to 75 days from today)
- ✅ Estimated hours/videos calculation
- ✅ Form validation (email, phone, event title required)
- ✅ CMS modal integration for quote review
- ✅ Email quote submission
- ✅ Thank you message after submission
- ✅ Responsive design

---

## Architecture

### Tech Stack
- **Frontend Framework:** Next.js 15.5.5 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Build Tool:** Turbopack
- **Hosting:** Vercel
- **CMS:** Custom CMS with Bootstrap 3 modals

### Communication Flow
```
┌─────────────────────┐
│   Next.js App       │
│   (Vercel)          │
│                     │
│  User fills form    │
│  Clicks "Submit"    │
└──────────┬──────────┘
           │
           │ postMessage (OPEN_PRICING_FORM)
           │ {name, email, phone, message}
           ▼
┌─────────────────────┐
│   CMS Page          │
│   (admin.roya.com)  │
│                     │
│  Opens modal        │
│  Pre-fills fields   │
│  User submits       │
└──────────┬──────────┘
           │
           │ postMessage (QUOTE_SUBMITTED_SUCCESS)
           │
           ▼
┌─────────────────────┐
│   Next.js App       │
│                     │
│  Shows thank you    │
│  Resets form        │
└─────────────────────┘
```

### Cross-Origin Communication
- Uses `window.postMessage` API for iframe↔parent communication
- Origin validation for security
- Two-way message flow

---

## File Structure

```
bashfilms/
├── app/
│   ├── page.tsx              # Main pricing calculator (835 lines)
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── favicon.ico           # Site icon
├── public/
│   └── (static assets)
├── next.config.ts            # iframe embedding config
├── package.json              # Dependencies
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript config
├── test.html                 # CMS modal HTML structure
├── CMS_INTEGRATION.md        # Technical integration guide
└── CLIENT_DOCUMENTATION.md   # This file
```

### Key Files Explained

#### `app/page.tsx` (Main Application)
**Lines of interest:**
- **18-47:** State management (all form fields and UI states)
- **73-85:** Validation logic
- **88-97:** Event date initialization (75 days default)
- **100-134:** postMessage listener for thank you flow
- **176-238:** Email body builder (formats quote for submission)
- **242-276:** Form submission handler
- **545-845:** JSX rendering (UI components)

**Key state variables:**
```typescript
const [location, setLocation] = useState("Las Vegas");
const [days, setDays] = useState(1);
const [rooms, setRooms] = useState(1);
const [turnaround, setTurnaround] = useState("4w");
const [contactName, setContactName] = useState("");
const [contactEmail, setContactEmail] = useState("");
const [contactPhone, setContactPhone] = useState("");
const [eventTitle, setEventTitle] = useState("");
const [showThankYou, setShowThankYou] = useState(false);
```

#### `next.config.ts`
Enables iframe embedding across all domains:
```typescript
async headers() {
  return [{
    source: "/:path*",
    headers: [{
      key: "Content-Security-Policy",
      value: "frame-ancestors *",
    }],
  }];
}
```

#### `test.html`
Contains the professional modal structure with:
- CSS styling (lines 1-136)
- Modal HTML (lines 138-200)
- JavaScript handlers (lines 202-268)

---

## CMS Integration Scripts

### Script 1: Modal Opener (Listens for Quote Data)

**Location:** Add to CMS page that contains the iframe, before closing `</body>` tag

**Purpose:** Listens for quote submissions from iframe and opens the modal

```html
<script>
window.addEventListener('message', function(event) {

  const allowedOrigins = [
    'https://nextjs-boilerplate-rosy-chi-59.vercel.app',
    'https://admin.roya.com',
    'http://localhost:3000',
    'https://localhost:3000'
  ];

  // Security check - only accept messages from allowed origins
  if (!allowedOrigins.includes(event.origin)) {
    console.warn('⚠️ Rejected message from unauthorized origin:', event.origin);
    return;
  }

  // Handle quote form data
  if (event.data.type === 'OPEN_PRICING_FORM') {
    const quoteData = event.data.data;

    console.log('📧 Pricing quote received:', quoteData);

    // Pre-fill modal form fields
    $('#pricingCalcModal input[name="name"]').val(quoteData.name || '');
    $('#pricingCalcModal input[name="email"]').val(quoteData.email || '');
    $('#pricingCalcModal input[name="photo"]').val(quoteData.phone || '');
    $('#pricingCalcModal textarea[name="message"]').val(quoteData.message || '');

    // Open the modal
    $('#pricingCalcModal').modal('toggle');

    console.log('✅ Modal opened with pre-filled data');
  }
});
</script>
```

**Important Notes:**
- ⚠️ **No trailing slashes** in origins: `https://admin.roya.com` (not `https://admin.roya.com/`)
- Field name is `photo` not `phone` for the phone number field
- Requires jQuery to be loaded before this script

---

### Script 2: Modal Closer (Sends Success Message)

**Location:** Add after Script 1, or combine into one script

**Purpose:** Sends success message back to iframe when modal closes

```html
<script>
$(document).ready(function() {
  // When modal closes (after form submission), notify iframe
  $('#pricingCalcModal').on('hidden.bs.modal', function() {
    console.log('🔔 Modal closed, notifying iframe...');

    const iframe = $('iframe').first()[0];

    if (iframe) {
      try {
        // Send success message to iframe
        iframe.contentWindow.postMessage({
          type: 'QUOTE_SUBMITTED_SUCCESS',
          message: 'Thank you! Your quote request has been sent successfully.'
        }, '*');

        console.log('✅ Success message sent to iframe');
      } catch (err) {
        console.error('❌ Failed to send message:', err);
      }
    }
  });
});
</script>
```

**Important Notes:**
- Uses Bootstrap 3's `hidden.bs.modal` event
- Targets origin `'*'` for compatibility
- Assumes iframe is the first iframe on page

---

### Combined Script (Recommended)

For simplicity, combine both scripts:

```html
<script>
// Listen for quote submissions from iframe
window.addEventListener('message', function(event) {
  const allowedOrigins = [
    'https://nextjs-boilerplate-rosy-chi-59.vercel.app',
    'https://admin.roya.com',
    'http://localhost:3000',
    'https://localhost:3000'
  ];

  if (!allowedOrigins.includes(event.origin)) {
    console.warn('⚠️ Rejected message from unauthorized origin:', event.origin);
    return;
  }

  if (event.data.type === 'OPEN_PRICING_FORM') {
    const quoteData = event.data.data;

    $('#pricingCalcModal input[name="name"]').val(quoteData.name || '');
    $('#pricingCalcModal input[name="email"]').val(quoteData.email || '');
    $('#pricingCalcModal input[name="photo"]').val(quoteData.phone || '');
    $('#pricingCalcModal textarea[name="message"]').val(quoteData.message || '');

    $('#pricingCalcModal').modal('toggle');
    console.log('✅ Modal opened with pre-filled data');
  }
});

// Send success message when modal closes
$(document).ready(function() {
  $('#pricingCalcModal').on('hidden.bs.modal', function() {
    const iframe = $('iframe').first()[0];
    if (iframe) {
      iframe.contentWindow.postMessage({
        type: 'QUOTE_SUBMITTED_SUCCESS',
        message: 'Thank you! Your quote request has been sent successfully.'
      }, '*');
      console.log('✅ Success message sent to iframe');
    }
  });
});
</script>
```

---

## Modal Configuration

### Modal Structure

**Modal ID:** `pricingCalcModal` (must match exactly)

**Modal Size:** `modal-lg` (700px width)

**Modal Classes:**
```html
<div class="modal fade" id="pricingCalcModal">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      ...
    </div>
  </div>
</div>
```

**To show modal programmatically:**
```javascript
$('#pricingCalcModal').modal('show');
// or
$('#pricingCalcModal').modal('toggle');
```

**Bootstrap 3 Modal Classes:**
- `modal fade` - Basic modal with fade animation
- `modal fade in` - Modal shown with fade
- Add `in` class to show: `$('#pricingCalcModal').addClass('in')`
- Remove `in` class to hide: `$('#pricingCalcModal').removeClass('in')`
- Backdrop: `.modal-backdrop.fade.in`

### Form Field Names

Your CMS form **must** use these exact field names:

| Field Purpose | Field Name | Type | Required |
|--------------|------------|------|----------|
| Contact Name | `name` | text | No |
| Contact Email | `email` | email | Yes* |
| Contact Phone | `photo` | text | Yes* |
| Quote Details | `message` | textarea | Yes* |

⚠️ **Important:** Phone field is named `photo` (legacy CMS field name)

*These fields are pre-filled from the iframe and are read-only in the modal

### CMS Form Submit Button Format

Your CMS requires this specific format:

```html
<div class="form-group" data-type="submit">
  <input type="submit" value="✓ Confirm & Send Quote Request">
</div>
```

### Modal Styling

Copy the CSS from `test.html` lines 1-136 to your CMS stylesheet or add inline:

```html
<style>
  .modal-dialog.modal-lg {
    width: 700px;
    max-width: 90%;
  }

  .pricing-modal-header {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    color: white;
    padding: 25px 30px;
    border-radius: 12px 12px 0 0;
  }

  .info-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  /* See test.html for complete styles */
</style>
```

---

## Form Fields & Validation

### Required Fields (Client-Side Validation)

Before the "Submit quote" button is enabled, the user must provide:

1. **Valid Email** (`contactEmail`)
   - Format: `user@domain.com`
   - Regex: `/^[^@\s]+@[^@\s]+\.[^@\s]+$/`

2. **Valid Phone** (`contactPhone`)
   - Minimum 7 digits (any format)
   - Extracts only digits and counts them

3. **Event Title** (`eventTitle`)
   - Must not be empty
   - Trimmed for whitespace

**Validation Code (app/page.tsx lines 73-85):**
```typescript
const isNonEmpty = (s: string) => s.trim().length > 0;
const isValidEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.trim());
const isValidPhone = (s: string) => {
  const digits = String(s || "")
    .split("")
    .filter((ch) => ch >= "0" && ch <= "9").length;
  return digits >= 7;
};
const canSubmit = isValidEmail(contactEmail) && isNonEmpty(eventTitle) && isValidPhone(contactPhone);
```

### Optional Fields

- Contact Name
- Event URL
- Notes/Special Requests

### Form Fields

| Field | State Variable | Type | Default | Description |
|-------|---------------|------|---------|-------------|
| Location | `location` | dropdown | "Las Vegas" | Event location |
| Days | `days` | number | 1 | Number of event days |
| Rooms | `rooms` | number | 1 | Simultaneous locations |
| Turnaround | `turnaround` | dropdown | "4w" | Video delivery time |
| Hotel | `hotelOption` | radio | "bash_pays" | Hotel arrangement |
| Meals | `meals` | radio | "no" | Meal provision |
| Contact Name | `contactName` | text | "" | Client name |
| Contact Email | `contactEmail` | email | "" | Client email* |
| Contact Phone | `contactPhone` | tel | "" | Client phone* |
| Event Title | `eventTitle` | text | "" | Event name* |
| Event URL | `eventURL` | url | "" | Event website |
| Event Date | `eventYear`, `eventMonth`, `eventDay` | date | +75 days | Event start date |
| Notes | `notesText` | textarea | "" | Special requests |

*Required fields

### Event Date Picker

**Default Behavior:**
- Automatically sets date to **75 days from today**
- Calculated on component mount (client-side only to prevent hydration issues)

**Code (app/page.tsx lines 88-97):**
```typescript
useEffect(() => {
  setMounted(true);
  const today = new Date();
  const offsetDate = new Date(today);
  offsetDate.setDate(offsetDate.getDate() + 75);
  setEventYear(offsetDate.getFullYear());
  setEventMonth(offsetDate.getMonth() + 1);
  setEventDay(offsetDate.getDate());
}, []);
```

**To change the default offset:**
```typescript
offsetDate.setDate(offsetDate.getDate() + 75); // Change 75 to desired days
```

---

## Workflow Diagram

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User Fills Pricing Calculator (iframe)                 │
│                                                                 │
│  Location: [Las Vegas ▼]   Days: [1]   Rooms: [1]             │
│  Email: john@example.com    Phone: 555-1234                    │
│  Event Title: Tech Conference 2025                             │
│                                                                 │
│  Validation: ✓ Email valid  ✓ Phone valid  ✓ Title filled    │
│                                                                 │
│  [Submit quote] ← Button enabled                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ User clicks "Submit quote"
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: "Opening contact form..." Popup (iframe)               │
│                                                                 │
│     ⏳ Opening contact form...                                 │
│     Please wait a moment                                       │
│                                                                 │
│  Duration: ~1.8 seconds                                        │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ postMessage sent to parent
                  │ {type: "OPEN_PRICING_FORM", data: {...}}
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Modal Opens (CMS page)                                 │
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║ Review Your Quote Request                                 ║ │
│  ║ Please review your information before submitting          ║ │
│  ╠═══════════════════════════════════════════════════════════╣ │
│  ║                                                           ║ │
│  ║ Contact Information                                       ║ │
│  ║ ┌─────────────────────────────────────┐                  ║ │
│  ║ │ NAME: John Doe                      │ (read-only)      ║ │
│  ║ │ EMAIL: john@example.com             │                  ║ │
│  ║ │ PHONE: 555-1234                     │                  ║ │
│  ║ └─────────────────────────────────────┘                  ║ │
│  ║                                                           ║ │
│  ║ Quote Details                                             ║ │
│  ║ ┌─────────────────────────────────────┐                  ║ │
│  ║ │ Quote Request - Tech Conference     │ (read-only)      ║ │
│  ║ │                                     │                  ║ │
│  ║ │ CONTACT INFORMATION:                │                  ║ │
│  ║ │ Name: John Doe                      │                  ║ │
│  ║ │ ...                                 │                  ║ │
│  ║ │ ESTIMATE: $8,450.00                 │                  ║ │
│  ║ └─────────────────────────────────────┘                  ║ │
│  ║                                                           ║ │
│  ║ [Cancel]  [✓ Confirm & Send Quote Request]               ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ User clicks "Confirm & Send Quote Request"
                  │ CMS handles form submission
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Email Sent (CMS backend)                               │
│                                                                 │
│  To: mbashian@bashfilms.com                                    │
│  Subject: Quote Request - Tech Conference 2025                 │
│  Body: [Full quote details from message field]                │
│                                                                 │
│  ✓ Email sent successfully                                     │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ CMS calls: $('#pricingCalcModal').modal('toggle')
                  │ Modal closes
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Modal Close Event Triggers (CMS page)                  │
│                                                                 │
│  Event: $('#pricingCalcModal').on('hidden.bs.modal')          │
│                                                                 │
│  Script sends postMessage to iframe:                           │
│  {type: "QUOTE_SUBMITTED_SUCCESS"}                            │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ postMessage received by iframe
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Thank You Popup (iframe)                               │
│                                                                 │
│            ╔════════════════════════════╗                      │
│            ║   ✓  Thank You!            ║                      │
│            ║                            ║                      │
│            ║   Your quote request has   ║                      │
│            ║   been sent successfully.  ║                      │
│            ║   We'll get back to you    ║                      │
│            ║   shortly!                 ║                      │
│            ║                            ║                      │
│            ║      [Close]               ║                      │
│            ╚════════════════════════════╝                      │
│                                                                 │
│  • Auto-dismisses after 10 seconds                             │
│  • User can click "Close" to dismiss manually                  │
│  • Form is reset (all fields cleared)                          │
└─────────────────────────────────────────────────────────────────┘
```

### Timing Details

| Event | Duration | Controlled By |
|-------|----------|---------------|
| "Opening contact form..." popup | 1.8s | `setTimeout` in `handleSubmitQuote` |
| Modal stays open | Until user submits | User action |
| Thank you popup | 10s (auto) or manual close | `setTimeout` in success handler |

---

## Deployment

### Production URLs

**Next.js App (Vercel):**
- Production: `https://nextjs-boilerplate-rosy-chi-59.vercel.app/`
- GitHub Repo: `https://github.com/royacom/bashfilms.com`

**CMS Pages:**
- Staging: `https://admin.roya.com/sites/Site-bce04dfa-56bc-4d51-8528-9b15150b00e7/pricing-calculator.html`
- Production: `https://bashfilms.com/pricing-calculator.html` (when ready)

### Iframe Embedding Code

Add this to your CMS page where you want the calculator to appear:

```html
<div style="position: relative; width: 100%; padding-bottom: 65%; height: 0;">
  <iframe
    src="https://nextjs-boilerplate-rosy-chi-59.vercel.app/"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 12px;"
    allowfullscreen
    loading="lazy"
    title="Pricing Calculator">
  </iframe>
</div>
```

**Responsive Sizing:**
- `padding-bottom: 65%` creates 16:10 aspect ratio
- Adjust percentage to change height (e.g., 56.25% for 16:9)

### Vercel Deployment Process

**Automatic Deployment:**
1. Push changes to GitHub `main` branch:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
2. Vercel automatically detects push and starts build
3. Build takes ~1-2 minutes
4. New version deployed to production URL
5. Previous version remains accessible at unique deployment URL

**Manual Deployment:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Environment Variables:**
None required currently (static site)

### Build Configuration

**Vercel Settings:**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node Version: 18.x or higher

**Build Script:**
```bash
npm run build
```

Expected output:
```
✓ Compiled successfully
Route (app)                         Size  First Load JS
┌ ○ /                            6.41 kB         119 kB
└ ○ /_not-found                      0 B         113 kB
```

---

## Troubleshooting

### Common Issues

#### 1. Modal Doesn't Open

**Symptoms:**
- User clicks "Submit quote"
- "Opening contact form..." popup appears
- Modal doesn't open

**Debug Steps:**
1. Open browser console (F12)
2. Check for error: `⚠️ Rejected message from unauthorized origin`
3. If yes: Add the origin to `allowedOrigins` array (remove trailing slash!)
4. Check for error: `❌ Modal #pricingCalcModal not found`
5. If yes: Verify modal HTML is on the page with exact ID

**Solution:**
```javascript
const allowedOrigins = [
  'https://nextjs-boilerplate-rosy-chi-59.vercel.app',
  'https://admin.roya.com',  // NO TRAILING SLASH!
  'http://localhost:3000'
];
```

---

#### 2. Thank You Message Doesn't Show

**Symptoms:**
- Modal opens and closes correctly
- No thank you popup in iframe

**Debug Steps:**
1. Open iframe console (right-click iframe → Inspect)
2. Look for: `🔵 IFRAME: Message received`
3. If not present: Check CMS script is sending message
4. Check iframe console for any errors

**Common Causes:**
- CMS script not sending `postMessage` on modal close
- Target origin mismatch
- Script timing issue (modal closes before message sent)

**Solution:**
Add small delay to ensure iframe is ready:
```javascript
$('#pricingCalcModal').on('hidden.bs.modal', function() {
  setTimeout(function() {
    iframe.contentWindow.postMessage({...}, '*');
  }, 100);
});
```

---

#### 3. Form Can Be Re-submitted

**Symptoms:**
- User submits form
- Thank you shows
- User can immediately submit again

**Solution:**
Already fixed! Form automatically resets after successful submission:
```typescript
// Lines 114-122 in app/page.tsx
setContactName("");
setContactEmail("");
setContactPhone("");
setEventTitle("");
setEventURL("");
setNotesText("");
setEmailTouched(false);
setPhoneTouched(false);
setEventTitleTouched(false);
```

---

#### 4. Modal Fields Not Pre-filling

**Symptoms:**
- Modal opens but fields are empty

**Causes & Solutions:**

**A. Wrong field names in modal:**
```html
<!-- WRONG -->
<input name="phone" />

<!-- CORRECT -->
<input name="photo" />  ⚠️ Note: "photo" not "phone"
```

**B. jQuery selector mismatch:**
```javascript
// Make sure selectors match exactly
$('#pricingCalcModal input[name="name"]').val(quoteData.name);
$('#pricingCalcModal input[name="email"]').val(quoteData.email);
$('#pricingCalcModal input[name="photo"]').val(quoteData.phone);
$('#pricingCalcModal textarea[name="message"]').val(quoteData.message);
```

---

#### 5. Hydration Error

**Symptoms:**
- Console error: "Text content does not match server-rendered HTML"
- Related to event date

**Cause:**
Server renders date on build, client calculates different date

**Solution:**
Already fixed! Date calculation moved to `useEffect`:
```typescript
// Lines 88-97
useEffect(() => {
  setMounted(true);
  const today = new Date();
  const offsetDate = new Date(today);
  offsetDate.setDate(offsetDate.getDate() + 75);
  setEventYear(offsetDate.getFullYear());
  setEventMonth(offsetDate.getMonth() + 1);
  setEventDay(offsetDate.getDate());
}, []);

if (!mounted) return null; // Don't render until mounted
```

---

#### 6. Validation Not Working

**Symptoms:**
- Submit button stays disabled even with valid inputs
- Error messages don't show

**Debug:**
```typescript
// Add console.logs to check validation state
console.log('Email valid?', isValidEmail(contactEmail));
console.log('Phone valid?', isValidPhone(contactPhone));
console.log('Title valid?', isNonEmpty(eventTitle));
console.log('Can submit?', canSubmit);
```

**Common Issues:**
- Email format: Must have `@` and `.`
- Phone: Must have at least 7 digits (any format)
- Title: Must not be empty/whitespace only

---

### Debug Checklist

When something doesn't work:

**1. Parent Page Console:**
```
✓ Check for: "📧 Pricing quote received"
✓ Check for: "✅ Modal opened with pre-filled data"
✓ Check for: "🔔 Modal closed, notifying iframe"
✓ Check for: "✅ Success message sent to iframe"
✗ Look for: Any red errors
```

**2. Iframe Console (Right-click iframe → Inspect):**
```
✓ Check for: "🎧 IFRAME: Message listener attached"
✓ Check for: "🔵 IFRAME: Message received"
✓ Check for: "✅ IFRAME: Success confirmation received"
✗ Look for: Any red errors
```

**3. Network Tab:**
```
✓ Check iframe loaded: Status 200
✓ Check modal form submission: POST request sent
✓ Check response: Should return success JSON
```

**4. Manual Tests:**
```javascript
// Test modal manually
$('#pricingCalcModal').modal('toggle');

// Test if jQuery loaded
console.log(typeof $); // Should be "function"

// Test if modal exists
console.log($('#pricingCalcModal').length); // Should be 1

// Test postMessage to iframe
$('iframe').first()[0].contentWindow.postMessage({
  type: 'QUOTE_SUBMITTED_SUCCESS'
}, '*');
```

---

## Future Maintenance

### How to Update Pricing

**Location:** `app/page.tsx` lines 140-168

**Base Prices:**
```typescript
const BASE_DAY_RATES = {
  "Las Vegas": 2500,
  "Los Angeles": 3500,
  "San Diego": 3000,
  "Bay Area": 3500,
  "Complex Scope": 8000,
};
```

**To change a base rate:**
```typescript
"Las Vegas": 2500,  // Change this number
```

**Turnaround Multipliers:**
```typescript
const turnaroundMultipliers: Record<string, number> = {
  "1w": 1.5,    // Rush (1 week) = 1.5x price
  "2w": 1.3,    // Fast (2 weeks) = 1.3x price
  "3w": 1.15,   // Standard (3 weeks) = 1.15x price
  "4w": 1.0,    // Regular (4 weeks) = base price
};
```

**Special Calibration:**
```typescript
// Line 185: $2,000 for Las Vegas, 1 day, 1 room, 4-week turnaround
const isLVOneDayOneRoomDefault =
  !isComplexScope &&
  location === "Las Vegas" &&
  days === 1 &&
  rooms === 1 &&
  turnaround === "4w" &&
  meals === "no";

const totalPrice = isLVOneDayOneRoomDefault ? 2000 : rawTotalPrice;
```

To change the LV special price: `? 2000` → `? YOUR_PRICE`

---

### How to Add/Remove Form Fields

**1. Add State Variable** (Line ~18):
```typescript
const [newField, setNewField] = useState("");
```

**2. Add to Form JSX** (Line ~545+):
```tsx
<input
  type="text"
  value={newField}
  onChange={(e) => setNewField(e.target.value)}
  placeholder="New field"
/>
```

**3. Add to Email Body** (Line ~176-238):
```typescript
const buildEmailBody = () => {
  return `Quote Request...
  ...
  New Field: ${newField}
  ...`;
};
```

**4. Reset After Submission** (Line ~114):
```typescript
setNewField(""); // Add this line
```

---

### How to Modify Email Template

**Location:** `app/page.tsx` lines 192-238

**Current Format:**
```typescript
const buildEmailBody = () => {
  const monthLabel = months.find((m) => m.value === eventMonth)?.label;
  return `Quote Request - ${eventTitle || "Conference Event"}

CONTACT INFORMATION:
Name: ${contactName}
Email: ${contactEmail}
Phone: ${contactPhone}
Event: ${eventTitle}
Website: ${eventURL}

EVENT DETAILS:
Start Date: ${monthLabel} ${eventDay}, ${eventYear}
Location: ${location}
Days: ${days}
Simultaneous Locations: ${rooms}
Turnaround: ${turnaround}
...

ESTIMATE:
Starting Price: ${displayPrice}

NOTES:
${notesText}`.trim();
};
```

**To modify:**
- Edit the template string
- Add/remove sections
- Change formatting
- Add dynamic values using `${variableName}`

---

### How to Change Default Date Offset

**Location:** `app/page.tsx` line 93

**Current:** 75 days from today
```typescript
offsetDate.setDate(offsetDate.getDate() + 75);
```

**To change:**
```typescript
offsetDate.setDate(offsetDate.getDate() + 90);  // 90 days
```

---

### How to Add New Location

**1. Add to Location Options** (Line ~287):
```tsx
<option value="New City">New City</option>
```

**2. Add Base Rate** (Line ~140):
```typescript
const BASE_DAY_RATES = {
  "Las Vegas": 2500,
  "New City": 3000,  // Add this line
  ...
};
```

**3. Update Hotel Logic** (if needed, Line ~137):
```typescript
const showHotelOption = location !== "Las Vegas" && location !== "New City";
```

---

### Backend Requirements

**The CMS needs a backend endpoint that:**

1. Receives POST request with form data
2. Sends email to `mbashian@bashfilms.com`
3. Returns JSON response

**Example Endpoint (`/submit-quote`):**

**PHP:**
```php
<?php
header('Content-Type: application/json');

$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['photo'] ?? '';  // Note: field name is "photo"
$message = $_POST['message'] ?? '';

// Extract event title for subject
preg_match('/Quote Request - (.+)/', $message, $matches);
$eventTitle = $matches[1] ?? 'New Event';

// Send email
$to = 'mbashian@bashfilms.com';
$subject = 'Quote Request - ' . $eventTitle;
$headers = "From: " . $email . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";

if (mail($to, $subject, $message, $headers)) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to send']);
}
?>
```

**Node.js (Express + Nodemailer):**
```javascript
app.post('/submit-quote', async (req, res) => {
  const { name, email, photo, message } = req.body;

  const match = message.match(/Quote Request - (.+)/);
  const eventTitle = match ? match[1] : 'New Event';

  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    auth: {
      user: 'your-email@domain.com',
      pass: 'your-password'
    }
  });

  try {
    await transporter.sendMail({
      from: email,
      to: 'mbashian@bashfilms.com',
      subject: `Quote Request - ${eventTitle}`,
      text: message,
      replyTo: email
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## Quick Reference

### Important IDs & Classes

```
Modal ID:           #pricingCalcModal
Modal Dialog:       .modal-dialog.modal-lg
Modal Header:       .pricing-modal-header
Modal Body:         .pricing-modal-body
Info Cards:         .info-card
Submit Button:      #submitQuoteBtn (in CMS form)
```

### postMessage Types

```
Iframe → Parent:    OPEN_PRICING_FORM
Parent → Iframe:    QUOTE_SUBMITTED_SUCCESS
```

### Form Field Names (CMS)

```
name="name"      → Contact name
name="email"     → Contact email
name="photo"     → Contact phone (⚠️ not "phone"!)
name="message"   → Complete quote details
```

### Key URLs

```
Vercel App:      https://nextjs-boilerplate-rosy-chi-59.vercel.app/
Staging CMS:     https://admin.roya.com/...
GitHub Repo:     https://github.com/royacom/bashfilms.com
Client Email:    mbashian@bashfilms.com
```

### Console Commands for Testing

```javascript
// Test modal toggle
$('#pricingCalcModal').modal('toggle');

// Check modal exists
$('#pricingCalcModal').length;

// Test postMessage to iframe
$('iframe').first()[0].contentWindow.postMessage({
  type: 'QUOTE_SUBMITTED_SUCCESS'
}, '*');

// Check jQuery loaded
typeof $; // Should be "function"

// Check Bootstrap modal
typeof $.fn.modal; // Should be "function"
```

---

## Contact & Support

**Client Contact:**
- **Name:** Michael Bashian
- **Email:** mbashian@bashfilms.com
- **Company:** Bash Films

**Developer Contact:**
- **Team:** Roya Development
- **CMS:** admin.roya.com

**For Issues:**
1. Check [Troubleshooting](#troubleshooting) section
2. Review browser console for errors
3. Test with manual console commands
4. Contact development team with:
   - Description of issue
   - Browser console logs (parent & iframe)
   - Steps to reproduce
   - Screenshot if applicable

---

**End of Documentation**

*Last Updated: January 2025*
