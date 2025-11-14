"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

// ----------------- Package & Pricing -----------------
const PACKAGE = {
  title: "Conference Presentation Recording & Editing Pricing",
  inclusions: [
    "1 day of on‑site pre‑production (operator arrival, setup, and connection tests)",
    "Travel (airfare + hotel + food per diem) included in the starting price",
    "Editing includes color grading, audio cleaning, and custom graphics branded for your event",
    "Human Videographers Only (NEVER robotic cameras)",
  ],
};

export default function Home() {
  // Core state
  const [location, setLocation] = useState("Las Vegas");
  const [days, setDays] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [turnaround, setTurnaround] = useState("4w");
  const [hotelOption, setHotelOption] = useState("bash_pays");
  const [meals, setMeals] = useState("no");

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
  const isValidEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.trim());
  const isValidPhone = (s: string) => {
    const digits = String(s || "")
      .split("")
      .filter((ch) => ch >= "0" && ch <= "9").length;
    return digits >= 7;
  };
  const canSubmit = isValidEmail(contactEmail) && isNonEmpty(eventTitle) && isValidPhone(contactPhone);

  // Validation error flags
  const emailError = emailTouched && contactEmail !== "" && !isValidEmail(contactEmail);
  const phoneError = phoneTouched && contactPhone !== "" && !isValidPhone(contactPhone);
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
      console.log("🔵 IFRAME: Message received", {
        type: event.data?.type,
        origin: event.origin,
        fullData: event.data,
      });

      if (event.data.type === "QUOTE_SUBMITTED_SUCCESS") {
        console.log("✅ IFRAME: Success confirmation received, showing thank you");
        setShowThankYou(true);
        console.log("✅ IFRAME: showThankYou set to true");
        setTimeout(() => {
          console.log("⏰ IFRAME: Auto-hiding thank you after 10 seconds");
          setShowThankYou(false);
        }, 10000);
      }
    };

    window.addEventListener("message", handleMessage);
    console.log("🎧 IFRAME: Message listener attached");
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Auto-bump off 1 day if user switches away from Las Vegas
  useEffect(() => {
    if (location !== "Las Vegas" && days === 1) setDays(2);
  }, [location, days]);

  // Pricing calculations
  const isComplexScope = rooms === 6 || days === 7;
  const estimatedPresentations = isComplexScope ? 0 : days * rooms * 6;
  const videos = isComplexScope ? 0 : days * rooms * 7;
  const perVideo =
    turnaround === "custom" ? 175 : turnaround === "4w" ? 50 : turnaround === "3w" ? 75 : turnaround === "2w" ? 100 : 135;
  const videoCost = isComplexScope ? 0 : videos * perVideo;

  const operatorDayRate = 750;
  const travelFeePerOperator = 500;
  const operators = isComplexScope ? 0 : rooms;
  const travelFeeApplied = location !== "Las Vegas";
  const operatorCost = isComplexScope
    ? 0
    : operators * (days * operatorDayRate + (travelFeeApplied ? travelFeePerOperator : 0));

  const airfarePerOperator = location === "Other US City" ? 800 : location === "International" ? 3300 : 0;
  const airfareCost = isComplexScope ? 0 : operators * airfarePerOperator;

  const hotelRatePerRoomPerNight = 350;
  const hotelRateClientProvides = 150;
  const hotelRooms = isComplexScope ? 0 : Math.ceil(operators / 2);
  const hotelNights = isComplexScope ? 0 : days;
  const hotelCost = isComplexScope
    ? 0
    : location !== "Las Vegas"
    ? hotelOption === "bash_pays"
      ? hotelRooms * hotelNights * hotelRatePerRoomPerNight
      : hotelRooms * hotelNights * hotelRateClientProvides
    : 0;

  const perDiemRatePerOperatorPerDay = 150;
  const mealsCreditPerOperatorPerDay = 50;
  const perDiemDays = isComplexScope ? 0 : days + 1;
  const perDiemBase = isComplexScope ? 0 : operators * perDiemDays * perDiemRatePerOperatorPerDay;
  const perDiemMealsCredit = isComplexScope
    ? 0
    : meals === "yes"
    ? operators * perDiemDays * mealsCreditPerOperatorPerDay
    : 0;
  const perDiemCost = isComplexScope ? 0 : perDiemBase - perDiemMealsCredit;

  const luggageFeePerOperator = 175;
  const luggageCost = isComplexScope ? 0 : location !== "Las Vegas" ? operators * luggageFeePerOperator : 0;

  const groundTransportFeePerOperator = 75;
  const groundTransportCost = isComplexScope ? 0 : operators * groundTransportFeePerOperator;

  const baseTotal = isComplexScope
    ? 0
    : videoCost + operatorCost + airfareCost + hotelCost + perDiemCost + luggageCost + groundTransportCost;
  const markupMultiplier = isComplexScope
    ? 1
    : location === "Las Vegas"
    ? baseTotal < 5000
      ? 1.35
      : baseTotal < 10000
      ? 1.3
      : 1.2
    : baseTotal < 10000
    ? 1.55
    : baseTotal < 20000
    ? 1.5
    : 1.4;
  const rawTotalPrice = isComplexScope ? 0 : baseTotal * markupMultiplier;

  // Special calibration: Las Vegas, 1 day, 1 location, 4-week default => target $2,000
  const isLVOneDayOneRoomDefault =
    !isComplexScope && location === "Las Vegas" && days === 1 && rooms === 1 && turnaround === "4w" && meals === "no";
  const totalPrice = isLVOneDayOneRoomDefault ? 2000 : rawTotalPrice;
  const displayPrice = isComplexScope ? "Contact for quote" : currency(totalPrice);

  // Build email body for CMS form
  const buildEmailBody = () => {
    const monthLabel = months.find((m) => m.value === eventMonth)?.label || String(eventMonth);
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
${location !== "Las Vegas" ? `Hotel: ${hotelOption}` : ""}
Meals: ${meals === "yes" ? "Event provides breakfast & lunch (discount applied)" : "Crew per diems included"}

ESTIMATE:
Starting Price: ${displayPrice}

NOTES:
${notesText}`.trim();
  };

  // Handle form submission
  const handleSubmitQuote = () => {
    if (!canSubmit) return;

    console.log("🚀 Submit clicked - sending to parent");

    // Show popup
    setShowRedirectPopup(true);

    // Send data to parent CMS after short delay
    setTimeout(() => {
      const messageData = {
        type: "OPEN_PRICING_FORM",
        data: {
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          message: buildEmailBody(),
        },
      };

      console.log("📤 Sending postMessage:", messageData);
      console.log("📍 Target origin: *");
      console.log("🪟 Parent window:", window.parent !== window ? "Found" : "NOT FOUND (not in iframe)");

      try {
        window.parent.postMessage(messageData, "*");
        console.log("✅ postMessage sent successfully");
      } catch (error) {
        console.error("❌ postMessage failed:", error);
      }

      // Hide popup after sending
      setTimeout(() => setShowRedirectPopup(false), 1000);
    }, 800);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
      {/* Sticky Starting Price (desktop top-right) */}
      <div className="hidden md:block print:hidden">
        <div className="fixed right-4 top-4 z-50">
          <div className="rounded-2xl border bg-white p-4 shadow-md w-64" role="status" aria-live="polite">
            <div className="text-xs text-neutral-500">Starting Price</div>
            <div className="text-2xl font-semibold text-neutral-900">{displayPrice}</div>
          </div>
        </div>
      </div>

      {/* Sticky Starting Price (mobile bottom bar) */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur border-t shadow-md p-3 flex items-center justify-between md:hidden print:hidden"
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
            Our flagship service: 4K UHD recording and editing of conference presentations delivered via upload.
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
                    <span>
                      {item === "Human Videographers Only (NEVER robotic cameras)" ? (
                        <>
                          Human Videographers Only (<strong>NEVER</strong> robotic cameras)
                        </>
                      ) : (
                        item
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2 text-sm text-neutral-800">
                {right.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {item === "Human Videographers Only (NEVER robotic cameras)" ? (
                        <>
                          Human Videographers Only (<strong>NEVER</strong> robotic cameras)
                        </>
                      ) : (
                        item
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}
      </div>

      {/* Where is your conference? */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-location">
        <h3 id="q-location" className="font-medium mb-3 text-neutral-900">
          Where is your conference?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {["Las Vegas", "Other US City", "International"].map((opt) => (
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

      {/* How many days is your conference? */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-days">
        <h3 id="q-days" className="font-medium mb-3 text-neutral-900">
          How many days is your conference?
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
          <p className="text-xs text-neutral-500 mt-2">We only service 1-day conferences in Las Vegas.</p>
        )}
      </div>

      {/* How many locations (simultaneous) */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-rooms">
        <h3 id="q-rooms" className="font-medium mb-3 text-neutral-900">
          How many locations need filming at the same time (at the most)?
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5].map((r) => (
            <label
              key={r}
              className={`flex items-center justify-center rounded-xl border px-3 py-2 bg-white cursor-pointer ${
                rooms === r ? "border-black" : "border-neutral-300 hover:border-neutral-400"
              }`}
            >
              <input
                type="radio"
                name="rooms"
                value={r}
                checked={rooms === r}
                onChange={() => setRooms(r)}
                className="hidden"
              />
              <span className="text-sm text-neutral-900">{r}</span>
            </label>
          ))}
          <button
            type="button"
            onClick={() => setRooms(6)}
            className={`rounded-xl border px-3 py-2 bg-white text-sm text-neutral-900 ${
              rooms === 6 ? "border-black" : "border-neutral-300 hover:border-neutral-400"
            }`}
          >
            5+
          </button>
        </div>
        {rooms === 6 && (
          <p className="text-xs text-neutral-500 mt-2">
            We can absolutely help you, but for events of this size, it&apos;s good to have a call. Please use this link
            to{" "}
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

      {/* Estimated hours of content/videos */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-est-videos">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
          <h3 id="q-est-videos" className="font-medium text-neutral-900">
            Estimated hours of content/videos: (auto updates based on above selections)
          </h3>
          <div className="border rounded-xl bg-white px-3 py-2 text-sm text-neutral-800 select-none text-center w-full sm:w-32">
            {isComplexScope
              ? "We'll estimate this for larger, multi-room, multi-day events in your custom quote."
              : estimatedPresentations}
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Estimate is ~6 hours p/day(s) p/location(s) understanding individual edits delivered may incorporate long
          keynote presentations or shorter lightning session content.
          <br />
          <br />
          Many events have an opening keynote, then a full day of breakouts, and many events end mid-day on the last day.
          We get it and will work with your schedule, but that is why we estimate ~ 6 hours.
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

      {/* How soon would you like your edited videos? */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-turnaround">
        <h3 id="q-turnaround" className="font-medium mb-3 text-neutral-900">
          How soon would you like your edited videos?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { key: "4w", label: "4 weeks (default)" },
            { key: "3w", label: "3 weeks" },
            { key: "2w", label: "2 weeks" },
            { key: "1w", label: "1 week" },
          ].map((opt) => (
            <label
              key={opt.key}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 bg-white cursor-pointer ${
                turnaround === opt.key ? "border-black" : "border-neutral-300 hover:border-neutral-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="turnaround"
                  value={opt.key}
                  checked={turnaround === opt.key}
                  onChange={() => setTurnaround(opt.key)}
                />
                <span className="text-sm text-neutral-800">{opt.label}</span>
              </div>
            </label>
          ))}
          <div className="sm:col-span-4 flex justify-center">
            <label
              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 bg-white cursor-pointer w-full sm:w-auto ${
                turnaround === "custom" ? "border-black" : "border-neutral-300 hover:border-neutral-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="turnaround"
                  value="custom"
                  checked={turnaround === "custom"}
                  onChange={() => setTurnaround("custom")}
                />
                <span className="text-sm text-neutral-800">
                  Same Day / Custom Deadline(s) for some content. May require additional on-site editor(s)/labor
                </span>
              </div>
            </label>
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Rush delivery estimates adjust based on the number of presentations to be recorded. The number of presentations
          estimates 6 hours of content, per filming location, per day.
        </p>
      </div>

      {/* Hotel rooms — only for non-Las Vegas */}
      {location !== "Las Vegas" && (
        <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-hotel">
          <h3 id="q-hotel" className="font-medium mb-3 text-neutral-900">
            Discount Option: Can your event provide our hotel room(s)?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "bash_pays", label: "Bash Films pays for their hotel rooms (default)" },
              { key: "venue_provides", label: "We will book and pay for your crew's hotel rooms." },
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

      {/* Meals Provided? */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-meals">
        <h3 id="q-meals" className="font-medium mb-3 text-neutral-900">
          Discount Option: Food per diem(s)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: "no", label: "Include crew food per diems (default)" },
            { key: "yes", label: "Discount - Event provides breakfast & lunch" },
          ].map((opt) => (
            <label
              key={opt.key}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 bg-white cursor-pointer ${
                meals === opt.key ? "border-black" : "border-neutral-300 hover:border-neutral-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="meals"
                  value={opt.key}
                  checked={meals === opt.key}
                  onChange={() => setMeals(opt.key)}
                />
                <span className="text-sm text-neutral-800">{opt.label}</span>
              </div>
            </label>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-2">Per‑diem discounted if breakfast and lunch provided.</p>
      </div>

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
                Please enter a valid email address
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
                Please enter a valid phone number (min 7 digits)
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 border-4 border-neutral-200 border-t-black rounded-full animate-spin"></div>
              <h3 className="text-xl font-semibold text-neutral-900">Opening contact form...</h3>
              <p className="text-sm text-neutral-600">Please wait a moment</p>
            </div>
          </div>
        </div>
      )}

      {/* Thank You Popup */}
      {(() => {
        console.log("🟢 IFRAME: Rendering check - showThankYou =", showThankYou);
        return null;
      })()}
      {showThankYou && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl border-2 border-green-500">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">Thank You!</h3>
              <p className="text-base text-neutral-700">
                Your quote request has been sent successfully. We&apos;ll get back to you shortly!
              </p>
              <button
                onClick={() => {
                  console.log("🔴 IFRAME: Close button clicked");
                  setShowThankYou(false);
                }}
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
