import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";

// Bash Films — Promo Pricing UI (current logic)
// - Locations supported: Las Vegas, Other US City
// - Contact-for-quote: 3+ videographers OR 5+ days
// - Starting price (LV): $1,500 per videographer per day
// - Other US City: same base + travel included
// - Deliverables:
//   - Raw footage: +$100
//   - Editing: tier add-on scaled by days

const PACKAGE = {
  title: "Promotional Content: Recording & Editing Pricing",
  inclusions: [
    "4K Cinema Cameras",
    "Airfare + hotel + food per diem are included in the starting price for services outside of Las Vegas",
    "Audio Equipment - Wireless Lav Mic(s)",
    "Editing services: color grading, audio cleaning, and custom graphics branded for your event",
  ],
};

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

const currency = (n) =>
  `$${Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const editingMultiplierFromDays = (d) =>
  d === 1 ? 1 : d === 2 ? 1.2 : d === 3 ? 1.3 : d === 4 ? 1.4 : d === 5 ? 1.5 : 1;

const NL = String.fromCharCode(10);

/**
 * Pure pricing function used by UI + unit tests.
 * NOTE: This reflects ONLY the calculator's current live UI options.
 */
export function computePricing({
  location,
  days,
  rooms,
  hotelOption,
  deliverable = "raw", // raw | editing
  editingPreset = "button1", // button1 | button2 | button3
}) {
  const isComplexScope = rooms === 6 || days === 7;
  if (isComplexScope) {
    return {
      isComplexScope: true,
      totalPrice: 0,
      displayPrice: "Contact for quote",
      breakdown: { base: 0, travel: 0, deliverableAddon: 0, editingAddon: 0 },
    };
  }

  // Base labor
  const base = days * rooms * 1500;

  // Travel (included in starting price for Other US City)
  let travel = 0;
  if (location === "Other US City") {
    const airfare = rooms * 800;

    const hotelRooms = Math.ceil(rooms / 2);
    const hotelRatePerRoomPerNight = hotelOption === "bash_pays" ? 350 : 150;
    const hotel = hotelRooms * days * hotelRatePerRoomPerNight;

    const perDiem = rooms * (days + 1) * 150;

    const luggage = rooms * 225;
    const ground = rooms * 125;

    travel = airfare + hotel + perDiem + luggage + ground;
  }

  // Deliverables / editing add-ons
  const deliverableAddon = deliverable === "raw" ? 100 : 0;

  const mult = editingMultiplierFromDays(days);
  const tierBase =
    editingPreset === "button1" ? 500 : editingPreset === "button2" ? 1000 : 1250;
  const editingAddon = deliverable === "editing" ? Math.round(tierBase * mult) : 0;

  const totalPrice = base + travel + deliverableAddon + editingAddon;

  return {
    isComplexScope: false,
    totalPrice,
    displayPrice: currency(totalPrice),
    breakdown: {
      base,
      travel,
      deliverableAddon,
      editingAddon,
    },
  };
}

export default function PromoCalcPage() {
  // Core state
  const [location, setLocation] = useState("Las Vegas");
  const [days, setDays] = useState(1); // 1–5, 7 => "5+"
  const [rooms, setRooms] = useState(1); // 1–3, 6 => "3+"
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

  // Event date state
  const today = new Date();
  const currentYear = today.getFullYear();
  const offsetDate = new Date(today);
  offsetDate.setDate(offsetDate.getDate() + 75);

  const [eventYear, setEventYear] = useState(offsetDate.getFullYear());
  const [eventMonth, setEventMonth] = useState(offsetDate.getMonth() + 1);
  const [eventDay, setEventDay] = useState(offsetDate.getDate());

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = [currentYear, currentYear + 1];

  // Form validation helpers for submission
  const isNonEmpty = (s) => s.trim().length > 0;
  const isValidEmail = (s) => /^[^@ ]+@[^@ ]+[.][^@ ]+$/.test(s.trim());
  const isValidPhone = (s) => {
    const digits = String(s || "")
      .split("")
      .filter((ch) => ch >= "0" && ch <= "9").length;
    return digits >= 7;
  };
  const canSubmit =
    isValidEmail(contactEmail) && isNonEmpty(eventTitle) && isValidPhone(contactPhone);

  // Auto-bump off 1 day if user switches away from Las Vegas
  useEffect(() => {
    if (location !== "Las Vegas" && days === 1) setDays(2);
  }, [location, days]);

  // If editing is selected, default to Basic Editing
  useEffect(() => {
    if (deliverable === "editing") setEditingPreset("button1");
  }, [deliverable]);

  const pricing = useMemo(
    () =>
      computePricing({
        location,
        days,
        rooms,
        hotelOption,
        deliverable,
        editingPreset,
      }),
    [location, days, rooms, hotelOption, deliverable, editingPreset]
  );

  const { displayPrice } = pricing;

  // Email builder reused by button
  const buildEmail = () => {
    const to = "mbashian@bashfilms.com";
    const subject = `Quote request – ${eventTitle || "Conference"} (${location}, ${days} day${
      days > 1 ? "s" : ""
    }, ${rooms} room${rooms > 1 ? "s" : ""})`;

    const monthLabel = months.find((m) => m.value === eventMonth)?.label || String(eventMonth);

    const bodyLines = [
      "Contact info:",
      `Name: ${contactName}`,
      `Email: ${contactEmail}`,
      `Phone: ${contactPhone}`,
      `Event: ${eventTitle}`,
      `Website: ${eventURL}`,
      "",
      "Event start date:",
      `${monthLabel} ${eventDay}, ${eventYear}`,
      "",
      "Selections:",
      `Location: ${location}`,
      `Days: ${days}`,
      `Simultaneous locations: ${rooms}`,
      `Deliverable: ${deliverable === "raw" ? "Raw Footage" : "Editing Services"}`,
      ...(deliverable === "editing" ? [`Editing option: ${editingPreset}`] : []),
      ...(location !== "Las Vegas" ? [`Hotel option: ${hotelOption}`] : []),
      "",
      "Estimate:",
      `Starting price: ${displayPrice}`,
      "",
      "Notes:",
      notesText,
    ];

    const body = bodyLines.join(NL);
    const mailto = `mailto:${to}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    return { mailto };
  };

  const handleSubmitQuote = () => {
    const { mailto } = buildEmail();
    try {
      const w = window.open(mailto, "_self");
      if (w === null) {
        const a = document.createElement("a");
        a.href = mailto;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.warn(
        "Unable to open mail client from preview. Use the link below to open your draft or copy the text.",
        err
      );
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
      {/* Sticky Starting Price (desktop top-right) */}
      <div className="hidden md:block print:hidden">
        <div className="fixed right-4 top-4 z-50">
          <div
            className="rounded-2xl border bg-white p-4 shadow-md w-64"
            role="status"
            aria-live="polite"
          >
            <div className="text-xs text-neutral-500">Starting Price</div>
            <div className="text-2xl font-semibold">{displayPrice}</div>
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
        <span className="text-xl font-semibold">{displayPrice}</span>
      </div>

      {/* Header + What's included (white card) */}
      <div className="rounded-2xl border bg-white p-5 sm:p-8 shadow-sm">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-semibold">{PACKAGE.title}</h1>
          <p className="text-neutral-600 mt-1">
            4K Cinematic Content capturing event highlights, featuring interviews, and filming of custom requests.
            Promotionial Videographer rates start at $1,500 per day.
          </p>
        </div>
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
      <div
        className="mt-6 p-4 border rounded-xl bg-neutral-50"
        role="group"
        aria-labelledby="q-location"
      >
        <h3 id="q-location" className="font-medium mb-3">
          Where is your event?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {["Las Vegas", "Other US City"].map((opt) => (
            <label
              key={opt}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 bg-white cursor-pointer ${
                location === opt
                  ? "border-black"
                  : "border-neutral-300 hover:border-neutral-400"
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
      <div
        className="mt-6 p-4 border rounded-xl bg-neutral-50"
        role="group"
        aria-labelledby="q-rooms"
      >
        <h3 id="q-rooms" className="font-medium mb-3">
          How many Promo Content Videographer(s) do you need?
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[1, 2, 3].map((r) => (
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
              <span className="text-sm">{r}</span>
            </label>
          ))}
          <button
            type="button"
            onClick={() => setRooms(6)}
            className={`rounded-xl border px-3 py-2 bg-white text-sm ${
              rooms === 6 ? "border-black" : "border-neutral-300 hover:border-neutral-400"
            }`}
          >
            3+
          </button>
        </div>
        {rooms === 6 && (
          <p className="text-xs text-neutral-500 mt-2">
            We can absolutely help you, but for events of this size, it's good to have a call. Please use this link to{" "}
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
      <div
        className="mt-6 p-4 border rounded-xl bg-neutral-50"
        role="group"
        aria-labelledby="q-days"
      >
        <h3 id="q-days" className="font-medium mb-3">
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
                <span className="text-sm">
                  {d} {d === 1 ? "day" : "days"}
                </span>
              </label>
            );
          })}
          <button
            type="button"
            onClick={() => setDays(7)}
            className={`rounded-xl border px-3 py-2 bg-white text-sm ${
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
      <div
        className="mt-6 p-4 border rounded-xl bg-neutral-50"
        role="group"
        aria-labelledby="q-deliverable"
      >
        <h3 id="q-deliverable" className="font-medium mb-3">
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
                deliverable === opt.key
                  ? "border-black"
                  : "border-neutral-300 hover:border-neutral-400"
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

      {deliverable === "editing" && (
        <div
          className="mt-6 p-4 border rounded-xl bg-neutral-50"
          role="group"
          aria-labelledby="q-editing-preset"
        >
          <h3 id="q-editing-preset" className="font-medium mb-3">
            When it comes to promotional content, it's a little different for every client. Select an option you believe
            is closest to your needs, for a realistic starting price point.
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: "button1", label: "Basic Editing - Re-cap / Highlight Reel" },
              { key: "button2", label: "Standard Editing Multiple Reels / Social Assets" },
              { key: "button3", label: "Advanced Editing" },
            ].map((opt) => (
              <label
                key={opt.key}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 bg-white cursor-pointer ${
                  editingPreset === opt.key
                    ? "border-black"
                    : "border-neutral-300 hover:border-neutral-400"
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
                {opt.key === "button1" ? (
                  <div className="flex flex-col items-center text-center w-full">
                    <div className="text-sm text-neutral-800">
                      Basic Editing
                      <br />
                      Re-cap / Highlight Reel
                    </div>
                    <div className="w-full h-px bg-neutral-200 my-2" />
                    <div className="text-xs text-neutral-500">
                      A reel featuring highlights and interviews that showcase your event. Most reels are ~ 2 to 3
                      minutes.
                    </div>
                    <div className="w-full h-px bg-neutral-200 my-2" />
                    <div className="text-sm text-neutral-800">~ $500+</div>
                  </div>
                ) : opt.key === "button2" ? (
                  <div className="flex flex-col items-center text-center w-full">
                    <div className="text-sm text-neutral-800">
                      Standard Editing
                      <br />
                      Multiple Reels / Social Assets
                    </div>
                    <div className="w-full h-px bg-neutral-200 my-2" />
                    <div className="text-xs text-neutral-500">
                      A highlight reel, a 30-second promo video, some social media clips, some full interviews cut
                      together, etc.
                    </div>
                    <div className="w-full h-px bg-neutral-200 my-2" />
                    <div className="text-sm text-neutral-800">~ $1,000+</div>
                  </div>
                ) : opt.key === "button3" ? (
                  <div className="flex flex-col items-center text-center w-full">
                    <div className="text-sm text-neutral-800">
                      Advanced Editing
                      <br />
                      <em>to be discussed</em>
                    </div>
                    <div className="w-full h-px bg-neutral-200 my-2" />
                    <div className="text-xs text-neutral-500">
                      Multiple promotional edits, multiple short segments, multiple interviews, plus delivery of all the
                      raw media, etc.
                    </div>
                    <div className="w-full h-px bg-neutral-200 my-2" />
                    <div className="text-sm text-neutral-800">~$1,250+</div>
                  </div>
                ) : (
                  <span className="text-sm text-neutral-800">{opt.label}</span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Delivery / Turnaround Deadlines */}
      <div
        className="mt-6 p-4 border rounded-xl bg-neutral-50"
        role="group"
        aria-labelledby="q-delivery"
      >
        <h3 id="q-delivery" className="font-medium mb-3">
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
      <div
        className="mt-6 p-4 border rounded-xl bg-neutral-50"
        role="group"
        aria-labelledby="q-event-start"
      >
        <h3 id="q-event-start" className="font-medium mb-3">
          When does your event start?
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:max-w-md">
          <div className="col-span-3 sm:col-span-2">
            <span className="block text-xs text-neutral-500 mb-1">Month</span>
            <select
              className="border rounded-xl px-3 py-2 w-full bg-white"
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
              className="border rounded-xl px-3 py-2 w-full bg-white"
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
              className="border rounded-xl px-3 py-2 w-full bg-white"
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
        <div
          className="mt-6 p-4 border rounded-xl bg-neutral-50"
          role="group"
          aria-labelledby="q-hotel"
        >
          <h3 id="q-hotel" className="font-medium mb-3">
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

      {/* Email + Notes */}
      <div className="mt-6 p-4 border rounded-xl bg-white">
        <h3 className="font-medium mb-3">Event and contact information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            className="border rounded-xl px-3 py-2"
            placeholder="Your name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
          <input
            type="email"
            className="border rounded-xl px-3 py-2"
            placeholder="Your email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <input
            type="tel"
            className="border rounded-xl px-3 py-2"
            placeholder="Your phone number"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            aria-required="true"
          />
          <input
            type="text"
            className="border rounded-xl px-3 py-2"
            placeholder="Event Name"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
          />
          <input
            type="url"
            className="border rounded-xl px-3 py-2"
            placeholder="Event Website"
            value={eventURL}
            onChange={(e) => setEventURL(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 p-4 border rounded-xl bg-white">
        <h3 className="font-medium mb-3">Notes</h3>
        <textarea
          className="w-full h-28 border rounded-xl px-3 py-2"
          placeholder="Anything else we should know?"
          value={notesText}
          onChange={(e) => setNotesText(e.target.value)}
        />
      </div>

      {/* Submit section */}
      <div className="mt-6 p-4 border rounded-xl bg-white">
        <h3 className="font-medium mb-3">Let's start discussing your event</h3>
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
              canSubmit
                ? "bg-black hover:opacity-90 cursor-pointer"
                : "bg-neutral-400 cursor-not-allowed opacity-60"
            }`}
          >
            Submit quote
          </button>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Once your quote is received, we will follow up via email to schedule a call and discuss your event.
        </p>
      </div>

      {/* Starting price row (mirrors sticky cards) */}
      <div className="mt-6 p-4 border rounded-xl bg-white flex items-center justify-between">
        <div className="text-sm text-neutral-500">Starting Price</div>
        <div className="text-2xl font-semibold">{displayPrice}</div>
      </div>
    </div>
  );
}

// ----------------------
// Minimal unit tests
// ----------------------
// These tests are inert in production builds because `describe`/`it` are not defined.
// They run in Vitest/Jest-like environments.
/* eslint-disable no-undef */
if (typeof describe === "function" && typeof it === "function" && typeof expect === "function") {
  describe("computePricing (current calculator)", () => {
    it("LV raw adds $100", () => {
      const p = computePricing({
        location: "Las Vegas",
        days: 1,
        rooms: 1,
        hotelOption: "bash_pays",
        deliverable: "raw",
      });
      expect(p.isComplexScope).toBe(false);
      expect(p.totalPrice).toBe(1600);
      expect(p.displayPrice).toBe("$1,600.00");
    });

    it("LV basic editing scales (2 days)", () => {
      const p = computePricing({
        location: "Las Vegas",
        days: 2,
        rooms: 1,
        hotelOption: "bash_pays",
        deliverable: "editing",
        editingPreset: "button1",
      });
      expect(p.totalPrice).toBe(3600);
      expect(p.displayPrice).toBe("$3,600.00");
    });

    it("LV standard editing scales (5 days)", () => {
      const p = computePricing({
        location: "Las Vegas",
        days: 5,
        rooms: 1,
        hotelOption: "bash_pays",
        deliverable: "editing",
        editingPreset: "button2",
      });
      expect(p.totalPrice).toBe(9000);
      expect(p.displayPrice).toBe("$9,000.00");
    });

    it("LV advanced editing scales (5 days)", () => {
      const p = computePricing({
        location: "Las Vegas",
        days: 5,
        rooms: 1,
        hotelOption: "bash_pays",
        deliverable: "editing",
        editingPreset: "button3",
      });
      expect(p.totalPrice).toBe(9375);
      expect(p.displayPrice).toBe("$9,375.00");
    });

    it("Other US City includes travel + updated luggage and ground", () => {
      const p = computePricing({
        location: "Other US City",
        days: 2,
        rooms: 1,
        hotelOption: "bash_pays",
        deliverable: "raw",
      });
      expect(p.totalPrice).toBe(5400);
      expect(p.displayPrice).toBe("$5,400.00");
    });

    it("Contact for quote for 3+ videographers or 5+ days", () => {
      const p1 = computePricing({
        location: "Las Vegas",
        days: 7,
        rooms: 1,
        hotelOption: "bash_pays",
        deliverable: "raw",
      });
      expect(p1.isComplexScope).toBe(true);
      expect(p1.displayPrice).toBe("Contact for quote");

      const p2 = computePricing({
        location: "Other US City",
        days: 2,
        rooms: 6,
        hotelOption: "bash_pays",
        deliverable: "editing",
        editingPreset: "button2",
      });
      expect(p2.isComplexScope).toBe(true);
      expect(p2.displayPrice).toBe("Contact for quote");
    });
  });
}
/* eslint-enable no-undef */
