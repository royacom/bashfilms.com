"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2 } from "lucide-react";

// ----------------- Package & Pricing -----------------
const PACKAGE = {
  title: "Promotional Content: Recording & Editing Pricing",
  inclusions: [
    "4K Cinema Cameras",
    "Airfare + hotel + food per diem are included in the starting price for services outside of Las Vegas",
    "Audio Equipment - Wireless Lav Mic(s)",
    "Editing services: color grading, audio cleaning, and custom graphics branded for your event",
  ],
};

// Pricing helper
const editingMultiplierFromDays = (d: number) =>
  d === 1 ? 1 : d === 2 ? 1.2 : d === 3 ? 1.3 : d === 4 ? 1.4 : d === 5 ? 1.5 : 1;

export default function PromoCalcPage() {
  // Core state
  const [location, setLocation] = useState("Las Vegas");
  const [days, setDays] = useState(1); // 1–5, 7 => "5+"
  const [videographers, setVideographers] = useState(1); // 1–3, 6 => "3+"
  const [hotelOption, setHotelOption] = useState("bash_pays"); // bash_pays | venue_provides

  // Deliverables / editing
  const [deliverable, setDeliverable] = useState("raw"); // raw | editing
  const [editingPreset, setEditingPreset] = useState("button1"); // button1 | button2 | button3

  // Contact/Event info state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventURL, setEventURL] = useState("");
  const [notesText, setNotesText] = useState("");

  // Field touched state for validation
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [eventTitleTouched, setEventTitleTouched] = useState(false);

  // Popup state
  const [showRedirectPopup, setShowRedirectPopup] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);


  // Hydration fix: initialize with safe defaults
  const [mounted, setMounted] = useState(false);
  const currentYear = new Date().getFullYear();
  const [eventYear, setEventYear] = useState(currentYear);
  const [eventMonth, setEventMonth] = useState(1);
  const [eventDay, setEventDay] = useState(1);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = [currentYear, currentYear + 1];

  // Helpers
  const currency = (n: number | string) =>
    `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Form validation helpers
  const isNonEmpty = (s: string) => s.trim().length > 0;

  const isValidEmail = (s: string) => {
    const email = s.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return (
      emailRegex.test(email) &&
      email.length <= 254 &&
      !email.startsWith(".") &&
      !email.endsWith(".") &&
      !email.includes("..")
    );
  };

  const isValidPhone = (s: string) => {
    const phone = String(s || "").trim();
    const phoneRegex = /^(([0-9]{1})*[- .(]*([0-9]{3})[- .)]*[0-9]{3}[- .]*[0-9]{4})+$/;
    if (!phoneRegex.test(phone)) return false;
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) return false;
    const areaCode = digits.substring(0, 3);
    if (areaCode[0] === "0" || areaCode[0] === "1") return false;
    return true;
  };

  const canSubmit = isValidEmail(contactEmail) && isNonEmpty(eventTitle) && isValidPhone(contactPhone);

  // Validation error messages
  const getEmailErrorMessage = (): string | null => {
    if (!emailTouched || contactEmail === "") return null;
    const trimmed = contactEmail.trim();
    if (!trimmed.includes("@")) return "Email must contain @";
    if (!trimmed.includes(".")) return "Email must include a domain (e.g., .com)";
    if (trimmed.length > 254) return "Email is too long";
    if (!isValidEmail(contactEmail)) return "Please enter a valid email address";
    return null;
  };

  const getPhoneErrorMessage = (): string | null => {
    if (!phoneTouched || contactPhone === "") return null;
    const digits = contactPhone.replace(/\D/g, "");
    if (digits.length < 10) return `Phone must have 10 digits (currently ${digits.length})`;
    if (digits.length > 10) return "Phone must have exactly 10 digits";
    if (digits.length === 10) {
      const areaCode = digits.substring(0, 3);
      if (areaCode[0] === "0" || areaCode[0] === "1") {
        return "Area code cannot start with 0 or 1";
      }
    }
    if (!isValidPhone(contactPhone)) return "Please enter a valid US phone number";
    return null;
  };

  const emailError = getEmailErrorMessage() !== null;
  const phoneError = getPhoneErrorMessage() !== null;
  const eventTitleError = eventTitleTouched && !isNonEmpty(eventTitle);

  // Hydration fix: set mounted and calculate default date on client only
  useEffect(() => {
    setMounted(true);
    const today = new Date();
    const offsetDate = new Date(today);
    offsetDate.setDate(offsetDate.getDate() + 75);
    setEventYear(offsetDate.getFullYear());
    setEventMonth(offsetDate.getMonth() + 1);
    setEventDay(offsetDate.getDate());
  }, []);

  // Listen for success message from parent CMS
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "QUOTE_SUBMITTED_SUCCESS") {
        setShowThankYou(true);
        setContactName("");
        setContactEmail("");
        setContactPhone("");
        setEventTitle("");
        setEventURL("");
        setNotesText("");
        setEmailTouched(false);
        setPhoneTouched(false);
        setEventTitleTouched(false);

        setTimeout(() => {
          setShowThankYou(false);
        }, 10000);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Auto-bump off 1 day if user switches away from Las Vegas
  useEffect(() => {
    if (location !== "Las Vegas" && days === 1) setDays(2);
  }, [location, days]);

  // If editing is selected, default to Basic Editing
  useEffect(() => {
    if (deliverable === "editing") setEditingPreset("button1");
  }, [deliverable]);

  // Send height to parent for auto-sizing iframe (fixes nested scrolling on mobile)
  const sendHeightToParent = useCallback(() => {
    if (typeof window === "undefined" || window.parent === window) return;

    const height = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );

    window.parent.postMessage({
      type: "IFRAME_RESIZE",
      height: height
    }, "*");
  }, []);

  // Auto-height iframe: report height to parent
  useEffect(() => {
    if (!mounted) return;

    const initialTimer = setTimeout(sendHeightToParent, 150);

    const resizeObserver = new ResizeObserver(() => {
      sendHeightToParent();
    });
    resizeObserver.observe(document.body);

    window.addEventListener("resize", sendHeightToParent);

    return () => {
      clearTimeout(initialTimer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", sendHeightToParent);
    };
  }, [mounted, sendHeightToParent]);

  // Update height when form sections expand/collapse
  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(sendHeightToParent, 50);
      return () => clearTimeout(timer);
    }
  }, [location, deliverable, showRedirectPopup, showThankYou, mounted, sendHeightToParent]);

  // Pricing calculations
  const isComplexScope = videographers === 6 || days === 7;

  // Base labor: $1,500 per videographer per day
  const base = isComplexScope ? 0 : days * videographers * 1500;

  // Travel (included in starting price for Other US City)
  let travel = 0;
  if (!isComplexScope && location === "Other US City") {
    const airfare = videographers * 800;
    const hotelRooms = Math.ceil(videographers / 2);
    const hotelRatePerRoomPerNight = hotelOption === "bash_pays" ? 350 : 150;
    const hotel = hotelRooms * days * hotelRatePerRoomPerNight;
    const perDiem = videographers * (days + 1) * 150;
    const luggage = videographers * 225;
    const ground = videographers * 125;
    travel = airfare + hotel + perDiem + luggage + ground;
  }

  // Deliverables / editing add-ons
  const deliverableAddon = !isComplexScope && deliverable === "raw" ? 100 : 0;

  const mult = editingMultiplierFromDays(days);
  const tierBase =
    editingPreset === "button1" ? 500 : editingPreset === "button2" ? 1000 : 1250;
  const editingAddon = !isComplexScope && deliverable === "editing" ? Math.round(tierBase * mult) : 0;

  const totalPrice = isComplexScope ? 0 : base + travel + deliverableAddon + editingAddon;
  const displayPrice = isComplexScope ? "Contact for quote" : currency(totalPrice);

  // Send live price to parent page (for fixed price bar outside iframe)
  useEffect(() => {
    if (!mounted) return;
    try {
      window.parent.postMessage({ type: "PRICE_UPDATE", data: { price: displayPrice } }, "*");
    } catch { /* not in iframe */ }
  }, [mounted, displayPrice]);

  // Build HTML email body for CMS form
  const buildEmailBody = () => {
    const monthLabel = months.find((m) => m.value === eventMonth)?.label || String(eventMonth);
    const hotelText = hotelOption === "bash_pays" ? "Bash Films pays" : "Client provides";
    const deliverableText = deliverable === "raw" ? "Raw Footage Only" : "Editing Services";
    const editingPresetText =
      editingPreset === "button1" ? "Basic Editing" : editingPreset === "button2" ? "Standard Editing" : "Advanced Editing";

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Promo Quote Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: 650px; margin: 0 auto; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Promo Quote Request</h1>
              <p style="margin: 8px 0 0; opacity: 0.85; font-size: 16px;">${eventTitle || "Promotional Content"}</p>
            </td>
          </tr>

          <!-- Contact Information Card -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa;">
              <table role="presentation" style="width: 100%; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-collapse: collapse;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #1a1a1a; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">📋 Contact Information</h2>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; width: 120px;">Name:</td>
                        <td style="padding: 8px 0; font-size: 15px; color: #1a1a1a;">${contactName || "—"}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Email:</td>
                        <td style="padding: 8px 0; font-size: 15px; color: #1a1a1a;"><a href="mailto:${contactEmail}" style="color: #007bff; text-decoration: none;">${contactEmail}</a></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Phone:</td>
                        <td style="padding: 8px 0; font-size: 15px; color: #1a1a1a;"><a href="tel:${contactPhone}" style="color: #007bff; text-decoration: none;">${contactPhone}</a></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Event:</td>
                        <td style="padding: 8px 0; font-size: 15px; color: #1a1a1a; font-weight: 500;">${eventTitle}</td>
                      </tr>
                      ${eventURL ? `
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Website:</td>
                        <td style="padding: 8px 0; font-size: 15px; color: #1a1a1a;"><a href="${eventURL}" style="color: #007bff; text-decoration: none;">${eventURL}</a></td>
                      </tr>
                      ` : ""}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Event Details Card -->
          <tr>
            <td style="padding: 0 30px 30px 30px; background-color: #f8f9fa;">
              <table role="presentation" style="width: 100%; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-collapse: collapse;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #1a1a1a; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">📅 Event Details</h2>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; width: 200px;">Start Date:</td>
                        <td style="padding: 8px 0; font-size: 15px; color: #1a1a1a;">${monthLabel} ${eventDay}, ${eventYear}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Location:</td>
                        <td style="padding: 8px 0; font-size: 15px; color: #1a1a1a;">${location}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Days:</td>
                        <td style="padding: 8px 0; font-size: 15px; color: #1a1a1a;">${days}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Videographers:</td>
                        <td style="padding: 8px 0; font-size: 15px; color: #1a1a1a;">${videographers}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Deliverable:</td>
                        <td style="padding: 8px 0; font-size: 15px; color: #1a1a1a;">${deliverableText}</td>
                      </tr>
                      ${deliverable === "editing" ? `
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Editing Option:</td>
                        <td style="padding: 8px 0; font-size: 15px; color: #1a1a1a;">${editingPresetText}</td>
                      </tr>
                      ` : ""}
                      ${location !== "Las Vegas" ? `
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Hotel:</td>
                        <td style="padding: 8px 0; font-size: 15px; color: #1a1a1a;">${hotelText}</td>
                      </tr>
                      ` : ""}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pricing Card -->
          <tr>
            <td style="padding: 0 30px 30px 30px; background-color: #f8f9fa;">
              <table role="presentation" style="width: 100%; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-collapse: collapse;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #1a1a1a; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">💰 Pricing Estimate</h2>
                    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center;">
                      <div style="font-size: 14px; color: #6c757d; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Starting Price</div>
                      <div style="font-size: 32px; font-weight: 700; color: #1a1a1a;">${displayPrice}</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${notesText ? `
          <!-- Notes Card -->
          <tr>
            <td style="padding: 0 30px 30px 30px; background-color: #f8f9fa;">
              <table role="presentation" style="width: 100%; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-collapse: collapse;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #1a1a1a; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">📝 Additional Notes</h2>
                    <div style="font-size: 15px; color: #333; line-height: 1.6; white-space: pre-wrap;">${notesText}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ""}

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8f9fa; text-align: center; font-size: 13px; color: #6c757d;">
              <p style="margin: 0;">Generated from Bash Films Promo Pricing Calculator</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  };

  // Handle form submission
  const handleSubmitQuote = () => {
    if (!canSubmit) return;

    setShowRedirectPopup(true);

    setTimeout(() => {
      const monthLabel = months.find((m) => m.value === eventMonth)?.label || String(eventMonth);
      const hotelText = hotelOption === "bash_pays" ? "Bash Films pays" : "Client provides";
      const deliverableText = deliverable === "raw" ? "Raw Footage Only" : "Editing Services";
      const editingPresetText =
        editingPreset === "button1" ? "Basic Editing" : editingPreset === "button2" ? "Standard Editing" : "Advanced Editing";

      const messageData = {
        type: "OPEN_PRICING_FORM",
        data: {
          // Contact Information
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          eventTitle: eventTitle,
          eventURL: eventURL,

          // Event Details
          startDate: `${monthLabel} ${eventDay}, ${eventYear}`,
          location: location,
          days: days.toString(),
          videographers: videographers.toString(),
          deliverable: deliverableText,
          editingOption: deliverable === "editing" ? editingPresetText : "",
          hotel: location !== "Las Vegas" ? hotelText : "",

          // Pricing
          price: displayPrice,

          // Notes
          notes: notesText,

          // Complete formatted message for email
          message: buildEmailBody(),

          // Calculator type identifier
          calculatorType: "promo",
        },
      };

      try {
        window.parent.postMessage(messageData, "*");
      } catch (error) {
        console.error("❌ postMessage failed:", error);
      }

      setTimeout(() => setShowRedirectPopup(false), 1000);
    }, 800);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8 pt-16 sm:pt-16 md:pt-8 md:pb-8">
      {/* Sticky Starting Price (desktop top-right) */}
      <div className="hidden md:block print:hidden">
        <div className="fixed right-4 top-4 z-50">
          <div className="rounded-2xl border bg-white p-4 shadow-md w-64" role="status" aria-live="polite">
            <div className="text-xs text-neutral-500">Starting Price</div>
            <div className="text-2xl font-semibold text-neutral-900">{displayPrice}</div>
          </div>
        </div>
      </div>

      {/* Sticky Starting Price (mobile top bar) */}
      <div
        className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur border-b shadow-md p-3 flex items-center justify-between md:hidden print:hidden"
        role="status"
        aria-live="polite"
      >
        <span className="text-xs text-neutral-500">Starting Price</span>
        <span className="text-xl font-semibold text-neutral-900">{displayPrice}</span>
      </div>

      {/* Header + What's included */}
      <div className="rounded-2xl border bg-white p-5 sm:p-8 shadow-sm">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">{PACKAGE.title}</h1>
          <p className="text-neutral-600 mt-1">
            4K Cinematic Content capturing event highlights, featuring interviews, and filming of custom requests.
            Promotional Videographer rates start at $1,500 per day.
          </p>
        </div>

        <h3 className="font-medium mb-2 text-neutral-900">What is ALWAYS included</h3>
        {(() => {
          const items = PACKAGE.inclusions;
          const mid = Math.ceil(items.length / 2);
          const left = items.slice(0, mid);
          const right = items.slice(mid);
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ul className="space-y-2 text-sm text-neutral-800">
                {left.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2 text-sm text-neutral-800">
                {right.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}
      </div>

      {/* Where is your event? */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-location">
        <h3 id="q-location" className="font-medium mb-3 text-neutral-900">
          Where is your event?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {["Las Vegas", "Other US City"].map((opt) => (
            <label
              key={opt}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 bg-white cursor-pointer ${
                location === opt ? "border-black" : "border-neutral-300 hover:border-neutral-400"
              }`}
            >
              <input
                type="radio"
                name="location"
                value={opt}
                checked={location === opt}
                onChange={() => setLocation(opt)}
                className="hidden"
              />
              <span className="text-sm text-neutral-800">{opt}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Bash Films is licensed, insured, and based in Las Vegas, NV. Events local to Las Vegas have different pricing
          options.
        </p>
      </div>

      {/* How many Promo Content Videographer(s) do you need? */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-videographers">
        <h3 id="q-videographers" className="font-medium mb-3 text-neutral-900">
          How many Promo Content Videographer(s) do you need?
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[1, 2, 3].map((v) => (
            <label
              key={v}
              className={`flex items-center justify-center rounded-xl border px-3 py-2 bg-white cursor-pointer ${
                videographers === v ? "border-black" : "border-neutral-300 hover:border-neutral-400"
              }`}
            >
              <input
                type="radio"
                name="videographers"
                value={v}
                checked={videographers === v}
                onChange={() => setVideographers(v)}
                className="hidden"
              />
              <span className="text-sm text-neutral-900">{v}</span>
            </label>
          ))}
          <button
            type="button"
            onClick={() => setVideographers(6)}
            className={`rounded-xl border px-3 py-2 bg-white text-sm text-neutral-900 ${
              videographers === 6 ? "border-black" : "border-neutral-300 hover:border-neutral-400"
            }`}
          >
            3+
          </button>
        </div>
        {videographers === 6 && (
          <p className="text-xs text-neutral-500 mt-2">
            We can absolutely help you, but for events of this size, it&apos;s good to have a call. Please use this link to{" "}
            <a
              href="https://calendly.com/mbashian/30min?month=2025-10"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              schedule a meeting
            </a>
            .
          </p>
        )}
      </div>

      {/* How many days are needed? */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-days">
        <h3 id="q-days" className="font-medium mb-3 text-neutral-900">
          How many days are needed?
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5].map((d) => {
            const isDisabled = d === 1 && location !== "Las Vegas";
            const selected = days === d;
            return (
              <label
                key={d}
                className={`flex items-center justify-center rounded-xl border px-3 py-2 bg-white ${
                  selected ? "border-black" : "border-neutral-300 hover:border-neutral-400"
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                aria-disabled={isDisabled}
              >
                <input
                  type="radio"
                  name="days"
                  value={d}
                  checked={selected}
                  onChange={() => {
                    if (!isDisabled) setDays(d);
                  }}
                  className="hidden"
                  disabled={isDisabled}
                />
                <span className="text-sm text-neutral-900">
                  {d} {d === 1 ? "day" : "days"}
                </span>
              </label>
            );
          })}
          <button
            type="button"
            onClick={() => setDays(7)}
            className={`rounded-xl border px-3 py-2 bg-white text-sm text-neutral-900 ${
              days === 7 ? "border-black" : "border-neutral-300 hover:border-neutral-400"
            }`}
          >
            5+
          </button>
        </div>
        {location !== "Las Vegas" && (
          <p className="text-xs text-neutral-500 mt-2">
            We only provide 1-day promotional content videography services in Las Vegas.
          </p>
        )}
      </div>

      {/* Footage Only / Editing Services */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-deliverable">
        <h3 id="q-deliverable" className="font-medium mb-3 text-neutral-900">
          Footage Only / Editing Services
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: "raw", label: "Raw Footage Only via hard drive ~ $100" },
            { key: "editing", label: "Editing Services" },
          ].map((opt) => (
            <label
              key={opt.key}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 bg-white cursor-pointer ${
                deliverable === opt.key ? "border-black" : "border-neutral-300 hover:border-neutral-400"
              }`}
            >
              <input
                type="radio"
                name="deliverable"
                value={opt.key}
                checked={deliverable === opt.key}
                onChange={() => setDeliverable(opt.key)}
                className="hidden"
              />
              <span className="text-sm text-neutral-800">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Editing Presets - only show when editing is selected */}
      {deliverable === "editing" && (
        <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-editing-preset">
          <h3 id="q-editing-preset" className="font-medium mb-3 text-neutral-900">
            When it comes to promotional content, it&apos;s a little different for every client. Select an option you believe
            is closest to your needs, for a realistic starting price point.
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: "button1", label: "Basic Editing", desc: "Re-cap / Highlight Reel", details: "A reel featuring highlights and interviews that showcase your event. Most reels are ~ 2 to 3 minutes.", price: "~ $500+" },
              { key: "button2", label: "Standard Editing", desc: "Multiple Reels / Social Assets", details: "A highlight reel, a 30-second promo video, some social media clips, some full interviews cut together, etc.", price: "~ $1,000+" },
              { key: "button3", label: "Advanced Editing", desc: "to be discussed", details: "Multiple promotional edits, multiple short segments, multiple interviews, plus delivery of all the raw media, etc.", price: "~$1,250+" },
            ].map((opt) => (
              <label
                key={opt.key}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 bg-white cursor-pointer ${
                  editingPreset === opt.key ? "border-black" : "border-neutral-300 hover:border-neutral-400"
                }`}
              >
                <input
                  type="radio"
                  name="editingPreset"
                  value={opt.key}
                  checked={editingPreset === opt.key}
                  onChange={() => setEditingPreset(opt.key)}
                  className="hidden"
                />
                <div className="flex flex-col items-center text-center w-full">
                  <div className="text-sm text-neutral-800">
                    {opt.label}
                    <br />
                    {opt.key === "button3" ? <em>{opt.desc}</em> : opt.desc}
                  </div>
                  <div className="w-full h-px bg-neutral-200 my-2" />
                  <div className="text-xs text-neutral-500">{opt.details}</div>
                  <div className="w-full h-px bg-neutral-200 my-2" />
                  <div className="text-sm text-neutral-800">{opt.price}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Delivery / Turnaround Deadlines */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-delivery">
        <h3 id="q-delivery" className="font-medium mb-3 text-neutral-900">
          Delivery / Turnaround Deadlines
        </h3>
        <p className="text-sm text-neutral-800">
          - Raw footage is delivered via hard drive at the conclusion of your event (when no editing services are needed)
          <br />
          - Edited content delivery will be discussed and scheduled around your marketing needs. Re-Cap/Highlight reels
          are typically delivered within 2-3 weeks after your event.
        </p>
      </div>

      {/* When does your event start? */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-event-start">
        <h3 id="q-event-start" className="font-medium mb-3 text-neutral-900">
          When does your event start?
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:max-w-md">
          <div className="col-span-3 sm:col-span-2">
            <span className="block text-xs text-neutral-500 mb-1">Month</span>
            <select
              className="border rounded-xl px-3 py-2 w-full bg-white text-neutral-900"
              value={eventMonth}
              onChange={(e) => setEventMonth(Number(e.target.value))}
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="block text-xs text-neutral-500 mb-1">Day</span>
            <select
              className="border rounded-xl px-3 py-2 w-full bg-white text-neutral-900"
              value={eventDay}
              onChange={(e) => setEventDay(Number(e.target.value))}
            >
              {daysInMonth.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="block text-xs text-neutral-500 mb-1">Year</span>
            <select
              className="border rounded-xl px-3 py-2 w-full bg-white text-neutral-900"
              value={eventYear}
              onChange={(e) => setEventYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Hotel rooms — only for non-Las Vegas */}
      {location !== "Las Vegas" && (
        <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-hotel">
          <h3 id="q-hotel" className="font-medium mb-3 text-neutral-900">
            Discount Option: Can your event provide our hotel room(s)?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "bash_pays", label: "Bash Films pays for their hotel room(s)" },
              { key: "venue_provides", label: "Our event will book & pay for your hotel room(s)" },
            ].map((opt) => (
              <label
                key={opt.key}
                className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 bg-white cursor-pointer ${
                  hotelOption === opt.key ? "border-black" : "border-neutral-300 hover:border-neutral-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="hotel"
                    value={opt.key}
                    checked={hotelOption === opt.key}
                    onChange={() => setHotelOption(opt.key)}
                  />
                  <span className="text-sm text-neutral-800">{opt.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Event and contact information */}
      <div className="mt-6 p-4 border rounded-xl bg-white">
        <h3 className="font-medium mb-3 text-neutral-900">Event and contact information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            className="border rounded-xl px-3 py-2 text-neutral-900 placeholder:text-neutral-400"
            placeholder="Your name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
          <div className="flex flex-col">
            <input
              type="email"
              className={`border rounded-xl px-3 py-2 text-neutral-900 placeholder:text-neutral-400 ${
                emailError ? "border-red-500" : ""
              }`}
              placeholder="Your email *"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              aria-invalid={emailError}
              aria-describedby={emailError ? "email-error" : undefined}
            />
            {emailError && (
              <span id="email-error" className="text-xs text-red-600 mt-1">
                {getEmailErrorMessage()}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <input
              type="tel"
              className={`border rounded-xl px-3 py-2 text-neutral-900 placeholder:text-neutral-400 ${
                phoneError ? "border-red-500" : ""
              }`}
              placeholder="Your phone number *"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              onBlur={() => setPhoneTouched(true)}
              aria-required="true"
              aria-invalid={phoneError}
              aria-describedby={phoneError ? "phone-error" : undefined}
            />
            {phoneError && (
              <span id="phone-error" className="text-xs text-red-600 mt-1">
                {getPhoneErrorMessage()}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <input
              type="text"
              className={`border rounded-xl px-3 py-2 text-neutral-900 placeholder:text-neutral-400 ${
                eventTitleError ? "border-red-500" : ""
              }`}
              placeholder="Event Name *"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              onBlur={() => setEventTitleTouched(true)}
              aria-required="true"
              aria-invalid={eventTitleError}
              aria-describedby={eventTitleError ? "event-title-error" : undefined}
            />
            {eventTitleError && (
              <span id="event-title-error" className="text-xs text-red-600 mt-1">
                Event name is required
              </span>
            )}
          </div>
          <input
            type="url"
            className="border rounded-xl px-3 py-2 text-neutral-900 placeholder:text-neutral-400"
            placeholder="Event Website"
            value={eventURL}
            onChange={(e) => setEventURL(e.target.value)}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="mt-6 p-4 border rounded-xl bg-white">
        <h3 className="font-medium mb-3 text-neutral-900">Notes</h3>
        <textarea
          className="w-full h-28 border rounded-xl px-3 py-2 text-neutral-900 placeholder:text-neutral-400"
          placeholder="Anything else we should know?"
          value={notesText}
          onChange={(e) => setNotesText(e.target.value)}
        ></textarea>
      </div>

      {/* Submit section */}
      <div className="mt-6 p-4 border rounded-xl bg-white">
        <h3 className="font-medium mb-3 text-neutral-900">Let&apos;s start discussing your event</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (!canSubmit) return;
              handleSubmitQuote();
            }}
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            className={`rounded-xl px-4 py-2 border text-white shadow ${
              canSubmit ? "bg-black hover:opacity-90 cursor-pointer" : "bg-neutral-400 cursor-not-allowed opacity-60"
            }`}
          >
            Submit quote
          </button>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          {canSubmit
            ? "Once your quote is received, we will follow up via email to schedule a call and discuss your event."
            : "Please fill out all required fields (email *, phone *, event name *) to submit your quote."}
        </p>
      </div>

      {/* Starting price row (mirrors sticky cards) */}
      <div className="mt-6 p-4 border rounded-xl bg-white flex items-center justify-between">
        <div className="text-sm text-neutral-500">Starting Price</div>
        <div className="text-2xl font-semibold text-neutral-900">{displayPrice}</div>
      </div>

      {/* Redirect Popup */}
      {showRedirectPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 py-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 border-4 border-neutral-200 border-t-black rounded-full animate-spin"></div>
              <h3 className="text-xl font-semibold text-neutral-900">Opening contact form...</h3>
              <p className="text-sm text-neutral-600">Please wait a moment</p>
            </div>
          </div>
        </div>
      )}

      {/* Thank You Popup */}
      {showThankYou && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 py-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-green-500 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">Thank You!</h3>
              <p className="text-base text-neutral-700">
                Thanks for contacting us! We&apos;ll be in touch within 36-48 hours about your estimate
              </p>
              <button
                onClick={() => setShowThankYou(false)}
                className="mt-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
