# CMS Integration Guide

This document explains how to integrate the Next.js Pricing Calculator with your CMS modal form.

---

## Overview

When a user fills out the pricing calculator and clicks "Submit quote", the following happens:

1. **Validation**: Form validates email, phone (min 7 digits), and event title are filled
2. **Popup Display**: A loading popup appears inside the iframe saying "Opening contact form..."
3. **postMessage**: Quote data is sent to the parent CMS page via `window.postMessage`
4. **Modal Opens**: Your CMS receives the data, pre-fills the modal form, and opens it
5. **User Submits**: User reviews and submits through your existing CMS form

---

## Installation Steps

### Step 1: Add postMessage Listener to Your CMS Page

Add this JavaScript to the CMS page that contains the iframe (both staging and production):

**Location**: Add before the closing `</body>` tag on:
- Staging: `https://admin.roya.com/sites/Site-bce04dfa-56bc-4d51-8528-9b15150b00e7/pricing-calculator.html`
- Production: `https://bashfilms.com/pricing-calculator.html`

```html
<script>
// Listen for pricing calculator submissions
window.addEventListener('message', function(event) {
  // Security: Only accept messages from your Vercel deployment
  const allowedOrigins = [
    'https://nextjs-boilerplate-rosy-chi-59.vercel.app', // Production Vercel
    'http://localhost:3000',  // Local development
    'https://localhost:3000'  // Local HTTPS
  ];

  if (!allowedOrigins.includes(event.origin)) {
    console.warn('⚠️ Rejected message from unauthorized origin:', event.origin);
    return;
  }

  if (event.data.type === 'OPEN_PRICING_FORM') {
    const quoteData = event.data.data;

    console.log('📧 Pricing quote received:', quoteData);

    // Pre-fill your modal form fields
    $('#pricingCalcModal input[name="name"]').val(quoteData.name || '');
    $('#pricingCalcModal input[name="email"]').val(quoteData.email || '');
    $('#pricingCalcModal input[name="photo"]').val(quoteData.phone || ''); // Note: field name is "photo"
    $('#pricingCalcModal textarea[name="message"]').val(quoteData.message || '');

    // Open the modal
    $('#pricingCalcModal').modal('toggle');

    console.log('✅ Modal opened with pre-filled data');
  }
});
</script>
```

---

## Data Format

The pricing calculator sends the following data structure:

```javascript
{
  type: "OPEN_PRICING_FORM",
  data: {
    name: "John Doe",                    // Contact name
    email: "john@example.com",           // Contact email
    phone: "555-123-4567",               // Contact phone
    message: "Quote Request - ...\n\n..."  // Full formatted quote details (see below)
  }
}
```

### Message Field Format

The `message` field contains a formatted quote with all details:

```
Quote Request - Tech Conference 2025

CONTACT INFORMATION:
Name: John Doe
Email: john@example.com
Phone: 555-123-4567
Event: Tech Conference 2025
Website: https://techconf.com

EVENT DETAILS:
Start Date: June 15, 2025
Location: Las Vegas
Days: 3
Simultaneous Locations: 2
Turnaround: 3w
Meals: Crew per diems included

ESTIMATE:
Starting Price: $8,450.00

NOTES:
We need rush delivery for keynote presentations.
```

---

## Testing

### Test Locally

1. Run Next.js app: `npm run dev` (runs on http://localhost:3000)
2. Open your CMS page in browser
3. Ensure the CMS page has the postMessage listener script added
4. Fill out the pricing calculator in the iframe
5. Click "Submit quote"
6. Check browser console for:
   - `📧 Pricing quote received:` message
   - `✅ Modal opened with pre-filled data` message
7. Verify modal opens with pre-filled fields

### Test on Staging

1. Deploy to Vercel: Push to GitHub (auto-deploys)
2. Update iframe src on staging CMS page to: `https://nextjs-boilerplate-rosy-chi-59.vercel.app/`
3. Test full flow on staging
4. Verify modal opens and data is pre-filled

### Test on Production

1. Update iframe src on production CMS page to: `https://nextjs-boilerplate-rosy-chi-59.vercel.app/`
2. Test full flow on production: `https://bashfilms.com/pricing-calculator.html`
3. Verify everything works end-to-end

---

## Form Validation

The "Submit quote" button is **disabled** until the user provides:

✅ **Valid email** (format: `user@domain.com`)
✅ **Valid phone** (minimum 7 digits)
✅ **Event title** (not empty)

Optional fields:
- Name
- Event URL
- Notes

---

## Security Notes

### Current Setup (Development/Testing)
- Uses `'*'` as target origin for postMessage (works everywhere)
- CMS validates incoming messages by checking `event.origin` against allowed list

### Production Recommendation
For enhanced security, update the postMessage in `app/page.tsx` line 207 to specify exact domain:

```typescript
window.parent.postMessage(
  {
    type: "OPEN_PRICING_FORM",
    data: { ... }
  },
  'https://bashfilms.com' // Specific domain instead of '*'
);
```

---

## Troubleshooting

### Modal doesn't open

**Check:**
1. Browser console for errors
2. Verify postMessage listener script is on the page
3. Check `event.origin` in console warning - add it to `allowedOrigins` if needed
4. Verify modal ID is exactly `#pricingCalcModal`
5. Verify jQuery is loaded on the page

### Fields not pre-filling

**Check:**
1. Field `name` attributes match:
   - Name: `name="name"`
   - Email: `name="email"`
   - Phone: `name="photo"` ⚠️ Note: field is named "photo" not "phone"
   - Message: `name="message"`
2. Browser console shows the quote data
3. jQuery selectors are correct

### "Rejected message from unauthorized origin"

**Solution:**
Add the iframe's origin to `allowedOrigins` array in the CMS script:

```javascript
const allowedOrigins = [
  'https://nextjs-boilerplate-rosy-chi-59.vercel.app',
  'http://localhost:3000',
  'YOUR_NEW_ORIGIN_HERE' // Add new origin
];
```

---

## Iframe Embedding

### Current iframe code:

```html
<div style="position: relative; width: 100%; padding-bottom: 65%; height: 0;">
  <iframe
    src="https://nextjs-boilerplate-rosy-chi-59.vercel.app/"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 12px;"
    allowfullscreen
    loading="lazy">
  </iframe>
</div>
```

### Important:
- The Next.js app is configured to allow iframe embedding via `Content-Security-Policy: frame-ancestors *` in `next.config.ts`
- This works for both staging and production CMS domains

---

## Support

If you encounter issues:

1. Check browser console for error messages
2. Verify all field names match exactly
3. Test with browser dev tools Network tab to see postMessage
4. Check that jQuery and Bootstrap modal are loaded
5. Ensure modal HTML structure is correct

---

## File Structure

```
bashfilms/
├── app/
│   ├── page.tsx              # Pricing calculator (updated)
│   └── globals.css           # Styles
├── next.config.ts            # iframe headers config
├── CMS_INTEGRATION.md        # This file
└── package.json              # Dependencies (includes lucide-react)
```

---

## Changelog

### Latest Update (2025-01-13)
- ✅ Added all new form fields (phone, event title, event URL, notes)
- ✅ Added event date picker (defaults to 75 days from today)
- ✅ Added estimated hours/videos section
- ✅ Added form validation (email, phone, event title required)
- ✅ Added "Opening contact form..." popup
- ✅ Implemented postMessage to CMS
- ✅ Updated all content/copy per client requirements
- ✅ Added $2,000 pricing calibration for LV/1day/1room/4w
- ✅ Removed FAQ section
- ✅ Works on both staging and production CMS domains
