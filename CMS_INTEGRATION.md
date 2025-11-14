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
console.log('🔧 Pricing calculator listener initialized');

// Listen for pricing calculator submissions
window.addEventListener('message', function(event) {
  // Log EVERY message received (for debugging)
  console.log('📨 Message received:', {
    origin: event.origin,
    type: event.data?.type,
    hasData: !!event.data
  });

  // Security: Only accept messages from your Vercel deployment
  const allowedOrigins = [
    'https://nextjs-boilerplate-rosy-chi-59.vercel.app', // Production Vercel
    'http://localhost:3000',  // Local development
    'https://localhost:3000'  // Local HTTPS
  ];

  if (!allowedOrigins.includes(event.origin)) {
    console.warn('⚠️ Rejected message from:', event.origin);
    console.log('💡 If this is your iframe, add this origin to allowedOrigins array:', event.origin);
    return;
  }

  if (event.data.type === 'OPEN_PRICING_FORM') {
    console.log('✅ Pricing form data received:', event.data.data);

    try {
      // Check if jQuery is available
      if (typeof $ === 'undefined') {
        console.error('❌ jQuery is not loaded!');
        alert('Error: jQuery is not loaded on this page');
        return;
      }

      // Check if modal exists
      const modalExists = $('#pricingCalcModal').length > 0;
      console.log('🔍 Modal exists?', modalExists);

      if (!modalExists) {
        console.error('❌ Modal #pricingCalcModal not found in DOM');
        alert('Error: Modal #pricingCalcModal not found');
        return;
      }

      // Pre-fill your modal form fields
      $('#pricingCalcModal input[name="name"]').val(event.data.data.name || '');
      $('#pricingCalcModal input[name="email"]').val(event.data.data.email || '');
      $('#pricingCalcModal input[name="photo"]').val(event.data.data.phone || ''); // Note: field name is "photo"
      $('#pricingCalcModal textarea[name="message"]').val(event.data.data.message || '');

      console.log('✅ Fields pre-filled successfully');

      // Open the modal
      $('#pricingCalcModal').modal('toggle');
      console.log('✅ Modal toggle called');

    } catch (error) {
      console.error('❌ Error opening modal:', error);
      alert('Error opening modal: ' + error.message);
    }
  }
});

// Test modal availability on page load
$(document).ready(function() {
  console.log('✅ DOM ready');
  console.log('jQuery version:', $.fn.jquery);
  console.log('Modal element found?', $('#pricingCalcModal').length > 0);

  // Provide a way to manually test the modal
  window.testPricingModal = function() {
    console.log('🧪 Manual modal test triggered');
    $('#pricingCalcModal').modal('toggle');
  };
  console.log('💡 To test modal manually, run: testPricingModal()');
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

### How to Debug

**Open browser DevTools Console** on the CMS page and follow the logs:

#### Expected Console Output (Success):
```
🔧 Pricing calculator listener initialized
✅ DOM ready
jQuery version: 3.x.x
Modal element found? true
💡 To test modal manually, run: testPricingModal()

[User clicks Submit in iframe]

🚀 Submit clicked - sending to parent
📤 Sending postMessage: {...}
✅ postMessage sent successfully
📨 Message received: {origin: "https://...", type: "OPEN_PRICING_FORM", hasData: true}
✅ Pricing form data received: {...}
🔍 Modal exists? true
✅ Fields pre-filled successfully
✅ Modal toggle called
```

---

### Problem: Modal doesn't open

#### Issue 1: Origin Rejected ⚠️

**Console shows:**
```
⚠️ Rejected message from: https://actual-iframe-origin.com
💡 If this is your iframe, add this origin to allowedOrigins array: https://actual-iframe-origin.com
```

**Solution:**
Add the origin to `allowedOrigins` in the CMS script:
```javascript
const allowedOrigins = [
  'https://nextjs-boilerplate-rosy-chi-59.vercel.app',
  'http://localhost:3000',
  'https://actual-iframe-origin.com' // Add this line
];
```

---

#### Issue 2: jQuery Not Loaded ❌

**Console shows:**
```
❌ jQuery is not loaded!
```

**Solution:**
1. Check if jQuery is loaded BEFORE the postMessage listener script
2. Move the script after jQuery:
```html
<script src="https://code.jquery.com/jquery-3.x.x.min.js"></script>
<script>
  // Your postMessage listener here
</script>
```

---

#### Issue 3: Modal Not Found ❌

**Console shows:**
```
❌ Modal #pricingCalcModal not found in DOM
Modal element found? false
```

**Solution:**
1. Check if the modal HTML is on the page
2. Verify the modal ID is exactly `pricingCalcModal` (case-sensitive)
3. Check if the modal is inside a conditional or hidden element

**Test manually in console:**
```javascript
testPricingModal() // Should toggle the modal
```

---

#### Issue 4: No Message Received 📭

**Console shows:**
```
🔧 Pricing calculator listener initialized
✅ DOM ready
[nothing else after clicking Submit]
```

**Possible causes:**
1. **Not in iframe** - Check iframe console shows: `🪟 Parent window: Found`
2. **postMessage blocked** - Browser security settings
3. **Wrong page** - Script is on different page than iframe

**Solution:**
1. Verify iframe src matches the Vercel deployment URL
2. Check that script is on the SAME page as the iframe (not a different page)
3. Open iframe page console (right-click iframe → Inspect) and check for `🚀 Submit clicked`

---

#### Issue 5: Modal Toggle Called But Doesn't Show 🤔

**Console shows:**
```
✅ Modal toggle called
[but modal doesn't appear visually]
```

**Possible causes:**
1. Bootstrap not loaded
2. Modal CSS missing
3. z-index issue
4. Modal backdrop showing but content hidden

**Solutions to try:**

**Option A: Test manual toggle**
```javascript
testPricingModal() // If this works, the issue is in the postMessage flow
```

**Option B: Force show (bypass Bootstrap)**
```javascript
// Replace modal('toggle') with:
$('#pricingCalcModal').show();
$('#pricingCalcModal').addClass('show');
$('#pricingCalcModal').css('display', 'block');
$('body').addClass('modal-open');
```

**Option C: Bootstrap 5 method (if using BS5)**
```javascript
// Replace modal('toggle') with:
const modal = new bootstrap.Modal(document.getElementById('pricingCalcModal'));
modal.show();
```

**Option D: Check CSS**
```javascript
// Check if modal is hidden by CSS
console.log($('#pricingCalcModal').css('display'));
console.log($('#pricingCalcModal').css('visibility'));
console.log($('#pricingCalcModal').css('z-index'));
```

---

### Quick Diagnostic Commands

Run these in browser console on the CMS page:

```javascript
// 1. Check if script loaded
console.log(typeof window.testPricingModal); // Should be "function"

// 2. Test modal manually
testPricingModal();

// 3. Check jQuery
console.log(typeof $); // Should be "function"
console.log($.fn.jquery); // Shows version

// 4. Check modal exists
console.log($('#pricingCalcModal').length); // Should be 1 or higher

// 5. Check Bootstrap
console.log(typeof $.fn.modal); // Should be "function"

// 6. Force open modal
$('#pricingCalcModal').modal('show');
```

---

### Common Fixes

**Fix 1: Add all possible origins**
```javascript
const allowedOrigins = [
  'https://nextjs-boilerplate-rosy-chi-59.vercel.app',
  'http://localhost:3000',
  'https://localhost:3000',
  window.location.origin, // Current page origin
  '*' // TEMPORARY: Allow all for testing (remove in production)
];
```

**Fix 2: Ensure script runs after jQuery**
```html
<script src="jquery.js"></script>
<script src="bootstrap.js"></script>
<script>
  // postMessage listener here
</script>
```

**Fix 3: Wait for DOM ready**
```javascript
$(document).ready(function() {
  window.addEventListener('message', function(event) {
    // listener code
  });
});
```

---

### Still Not Working?

**Check:**
1. Browser console for errors
2. Verify postMessage listener script is on the page
3. Check `event.origin` in console warning - add it to `allowedOrigins` if needed
4. Verify modal ID is exactly `#pricingCalcModal`
5. Verify jQuery is loaded on the page
6. Run `testPricingModal()` in console to test modal works

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

## Complete Workflow

### User Journey (End-to-End)

1. **User fills pricing calculator** in iframe
2. **User clicks "Submit quote"** → Validation passes
3. **"Opening contact form..." popup** appears in iframe
4. **postMessage sent** to parent CMS page
5. **Professional modal opens** with two sections:
   - Contact Information (name, email, phone) - read-only
   - Quote Details (full formatted quote) - read-only
6. **User reviews** their information
7. **User clicks "✓ Confirm & Send Quote Request"**
8. **AJAX submission** to backend (`/submit-quote`)
   - Button shows "⏳ Sending..." during submission
9. **Modal closes** automatically on success
10. **postMessage sent back** to iframe (`QUOTE_SUBMITTED_SUCCESS`)
11. **Thank you popup appears** in iframe with green checkmark
    - "Thank you! Your quote request has been sent successfully."
    - Auto-dismisses after 10 seconds or user can click "Close"

### Technical Implementation

#### In Next.js App ([app/page.tsx](app/page.tsx))
- Line 41: `showThankYou` state for success message
- Line 99-111: Message listener for `QUOTE_SUBMITTED_SUCCESS`
- Line 798-819: Thank you popup UI with CheckCircle2 icon

#### In CMS Modal ([test.html](test.html))
- Professional modal design with:
  - Dark gradient header
  - Two info cards (Contact Info + Quote Details)
  - AJAX form submission handler
  - Success message sent back to iframe
  - Form reset on close

#### Backend Requirements

You need to create a backend endpoint at `/submit-quote` that:

1. **Receives POST request** with form data:
   ```javascript
   {
     name: "John Doe",
     email: "john@example.com",
     phone: "555-123-4567",
     message: "Quote Request - ...\n\n..." // Full formatted quote
   }
   ```

2. **Sends email** to `mbashian@bashfilms.com` with:
   - Subject: `Quote Request - [Event Title]`
   - Body: The full `message` field (contains all details)

3. **Returns JSON response**:
   ```javascript
   // Success:
   { success: true, message: "Quote sent successfully" }

   // Error:
   { success: false, error: "Error message" }
   ```

**Example PHP endpoint** (`/submit-quote.php`):
```php
<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';
$message = $_POST['message'] ?? '';

// Basic validation
if (empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

// Extract event title from message for subject
preg_match('/Quote Request - (.+)/', $message, $matches);
$eventTitle = $matches[1] ?? 'New Event';

// Send email
$to = 'mbashian@bashfilms.com';
$subject = 'Quote Request - ' . $eventTitle;
$headers = "From: " . $email . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

if (mail($to, $subject, $message, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Quote sent successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to send email']);
}
?>
```

**Example Node.js endpoint** (using Express + Nodemailer):
```javascript
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/submit-quote', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  // Extract event title
  const match = message.match(/Quote Request - (.+)/);
  const eventTitle = match ? match[1] : 'New Event';

  // Configure email transport
  const transporter = nodemailer.createTransport({
    host: 'your-smtp-host.com',
    port: 587,
    secure: false,
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

    res.json({ success: true, message: 'Quote sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});
```

---

## Modal HTML Structure

The modal in `test.html` includes:

### Professional Design Features
- **700px wide** modal (modal-lg)
- **Dark gradient header** (#1a1a1a to #2d2d2d)
- **Two info cards** with subtle shadows
- **Read-only fields** with gray background (#f5f5f5)
- **Monospace font** for quote details (Courier New)
- **Responsive** mobile-friendly design
- **Loading state** during submission
- **AJAX submission** prevents page reload
- **Success flow** sends message back to iframe

### Form Fields
The modal form expects these field names:
- `name="name"` - Contact name
- `name="email"` - Contact email
- `name="photo"` - Contact phone ⚠️ (Note: field is named "photo" not "phone")
- `name="message"` - Complete quote details (formatted text)

### Styling
All styles are inline in `test.html` for easy CMS integration. The modal automatically centers on screen and includes:
- Rounded corners (12px)
- Drop shadow
- Hover effects on buttons
- Disabled state styling
- Mobile responsive breakpoints

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
- ✅ **NEW**: Professional review/confirmation modal design
- ✅ **NEW**: AJAX form submission with loading states
- ✅ **NEW**: Success message flow back to iframe
- ✅ **NEW**: Thank you popup in iframe after submission
- ✅ **NEW**: Complete end-to-end workflow documentation
