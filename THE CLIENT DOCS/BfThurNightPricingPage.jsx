import React, { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

// Bash Films — Pricing UI (stable, debug‑fixed)
// - Sticky price (desktop top‑right + mobile bottom)
// - Live pricing: videos + operators + airfare + hotel + per‑diem + luggage + ground transport
// - Hotel section hidden for Las Vegas
// - 1‑day disabled outside Las Vegas + helper text

const PACKAGE = {
  title: "Conference Presentation Recording & Editing Pricing",
  inclusions: [
    "1 day of on‑site pre‑production (operator arrival, setup, and connection tests)",
    "Travel (airfare + hotel + food per diem) included in the starting price",
    "Editing includes color grading, audio cleaning, and custom graphics branded for your event",
    "Human Videographers Only (NEVER robotic cameras)",
  ],
};

export default function PricingResetPreview() {
  // Core state
  const [location, setLocation] = useState("Las Vegas");
  const [days, setDays] = useState(1); // 1–5, 7 => "5+"
  const [rooms, setRooms] = useState(1); // 1–5, 6 => "5+"
  const [turnaround, setTurnaround] = useState("4w"); // 3w | 2w | 1w | custom
  const [hotelOption, setHotelOption] = useState("bash_pays"); // bash_pays | venue_provides
  const [meals, setMeals] = useState("no"); // no | yes

  // Contact/Event info state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventURL, setEventURL] = useState("");
  const [notesText, setNotesText] = useState("");

  // Event date state (used by "When does your event start?" section)
  const today = new Date();
  const currentYear = today.getFullYear();
  const offsetDate = new Date(today);
  offsetDate.setDate(offsetDate.getDate() + 75); // default to 75 days from today
  const defaultEventYear = offsetDate.getFullYear();
  const defaultEventMonth = offsetDate.getMonth() + 1; // 1–12
  const defaultEventDay = offsetDate.getDate();

  const [eventYear, setEventYear] = useState(defaultEventYear);
  const [eventMonth, setEventMonth] = useState(defaultEventMonth);
  const [eventDay, setEventDay] = useState(defaultEventDay);

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
  const currency = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Form validation helpers for submission
  const isNonEmpty = (s) => s.trim().length > 0;
  const isValidEmail = (s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.trim());
  const isValidPhone = (s) => { const digits = String(s||'').split('').filter(ch => ch >= '0' && ch <= '9').length; return digits >= 7; };
  const canSubmit = isValidEmail(contactEmail) && isNonEmpty(eventTitle) && isValidPhone(contactPhone);

  // Auto-bump off 1 day if user switches away from Las Vegas
  useEffect(() => {
    if (location !== "Las Vegas" && days === 1) setDays(2);
  }, [location, days]);

  // Pricing: videos (per-day/per-room) + operators + airfare + hotel + per‑diem + luggage + ground transport
  const isComplexScope = rooms === 6 || days === 7; // 5+ rooms/days => contact for quote
  const estimatedPresentations = isComplexScope ? 0 : days * rooms * 6; // days × locations × 6
  const videos = isComplexScope ? 0 : days * rooms * 7; // 7 videos per day per location
  const perVideo = turnaround === "custom" ? 175 : turnaround === "4w" ? 50 : turnaround === "3w" ? 75 : turnaround === "2w" ? 100 : 135; // UPDATED RATES
  const videoCost = isComplexScope ? 0 : videos * perVideo;

  // Operators: 1 per room, $750/day, +$500 once per operator if not LV (confirmed)
  const operatorDayRate = 750;
  const travelFeePerOperator = 500;
  const operators = isComplexScope ? 0 : rooms;
  const travelFeeApplied = location !== "Las Vegas";
  const operatorCost = isComplexScope ? 0 : operators * (days * operatorDayRate + (travelFeeApplied ? travelFeePerOperator : 0));

  // Airfare per operator by location
  const airfarePerOperator = location === "Other US City" ? 800 : location === "International" ? 3300 : 0;
  const airfareCost = isComplexScope ? 0 : operators * airfarePerOperator;

  // Hotel rooms: 2 operators per room, nights = days; applies only outside Las Vegas, option-dependent
  const hotelRatePerRoomPerNight = 350;
  const hotelRateClientProvides = 150; // client provides rooms — $150/room/night
  const hotelRooms = isComplexScope ? 0 : Math.ceil(operators / 2);
  const hotelNights = isComplexScope ? 0 : days;
  const hotelCost = isComplexScope
    ? 0
    : (location !== "Las Vegas"
        ? (hotelOption === "bash_pays"
            ? hotelRooms * hotelNights * hotelRatePerRoomPerNight
            : hotelRooms * hotelNights * hotelRateClientProvides)
        : 0);

  // Per‑diem: $150 per operator per day; include a travel day => (days + 1). If meals provided, subtract $50 per operator per day.
  const perDiemRatePerOperatorPerDay = 150;
  const mealsCreditPerOperatorPerDay = 50;
  const perDiemDays = isComplexScope ? 0 : (days + 1);
  const perDiemBase = isComplexScope ? 0 : operators * perDiemDays * perDiemRatePerOperatorPerDay;
  const perDiemMealsCredit = isComplexScope ? 0 : (meals === "yes" ? operators * perDiemDays * mealsCreditPerOperatorPerDay : 0);
  const perDiemCost = isComplexScope ? 0 : perDiemBase - perDiemMealsCredit;

  // Luggage: $175 per operator (applies outside Las Vegas)
  const luggageFeePerOperator = 175;
  const luggageCost = isComplexScope ? 0 : (location !== "Las Vegas" ? operators * luggageFeePerOperator : 0);

  // Ground transport (parking & taxi): $75 per operator (applies in all locations)
  const groundTransportFeePerOperator = 75;
  const groundTransportCost = isComplexScope ? 0 : operators * groundTransportFeePerOperator;

  // Total (single number shown everywhere)
  const baseTotal = isComplexScope ? 0 : videoCost + operatorCost + airfareCost + hotelCost + perDiemCost + luggageCost + groundTransportCost;
  const markupMultiplier = isComplexScope
    ? 1
    : (location === "Las Vegas"
        ? (baseTotal < 5000 ? 1.35 : baseTotal < 10000 ? 1.3 : 1.2)
        : (baseTotal < 10000 ? 1.55 : baseTotal < 20000 ? 1.5 : 1.4));
  const rawTotalPrice = isComplexScope ? 0 : baseTotal * markupMultiplier;

  // Special calibration: Las Vegas, 1 day, 1 location, 4-week default, per-diem default => target $2,000
  const isLVOneDayOneRoomDefault = !isComplexScope && location === "Las Vegas" && days === 1 && rooms === 1 && turnaround === "4w" && meals === "no";
  const totalPrice = isLVOneDayOneRoomDefault ? 2000 : rawTotalPrice;
  const displayPrice = isComplexScope ? "Contact for quote" : currency(totalPrice);

  // Email builder reused by button, link and copy fallback
  const buildEmail = () => {
    const to = "mbashian@bashfilms.com";
    const subject = `Quote request – ${eventTitle || "Conference"} (${location}, ${days} day${days > 1 ? "s" : ""}, ${rooms} room${rooms > 1 ? "s" : ""})`;
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
      `Turnaround: ${turnaround}`,
      ...(location !== "Las Vegas" ? [`Hotel option: ${hotelOption}`] : []),
      `Food per diem: ${meals === "yes" ? "Event provides breakfast & lunch (discount)" : "Include crew per diems (default)"}`,
      "",
      "Estimate:",
      `Starting price: ${displayPrice}`,
      "",
      "Notes:",
      notesText,
    ];
    const body = bodyLines.join("\n");
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return { to, subject, body, mailto };
  };

  // Compose and send quote via email with fallbacks (mailto can be blocked in preview sandboxes)
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
      console.warn("Unable to open mail client from preview. Use the link below to open your draft or copy the text.", err);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
      {/* Sticky Starting Price (desktop top-right) */}
      <div className="hidden md:block print:hidden">
        <div className="fixed right-4 top-4 z-50">
          <div className="rounded-2xl border bg-white p-4 shadow-md w-64" role="status" aria-live="polite">
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
            Our flagship service: 4K UHD recording and editing of conference presentations delivered via upload.
          </p>
        </div>

        <h3 className="font-medium mb-2">What is ALWAYS included</h3>
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
        <h3 id="q-location" className="font-medium mb-3">Where is your conference?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {["Las Vegas", "Other US City", "International"].map((opt) => (
            <label
              key={opt}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 bg-white cursor-pointer ${location === opt ? "border-black" : "border-neutral-300 hover:border-neutral-400"}`}
            >
              <input type="radio" name="location" value={opt} checked={location === opt} onChange={() => setLocation(opt)} className="hidden" />
              <span className="text-sm text-neutral-800">{opt}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-2">Bash Films is licensed, insured, and based in Las Vegas, NV. Events local to Las Vegas have different pricing options.</p>
      </div>

      {/* How many days is your conference? */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-days">
        <h3 id="q-days" className="font-medium mb-3">How many days is your conference?</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5].map((d) => {
            const isDisabled = d === 1 && location !== "Las Vegas";
            const selected = days === d;
            return (
              <label
                key={d}
                className={`flex items-center justify-center rounded-xl border px-3 py-2 bg-white ${selected ? "border-black" : "border-neutral-300 hover:border-neutral-400"} ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                aria-disabled={isDisabled}
              >
                <input type="radio" name="days" value={d} checked={selected} onChange={() => { if (!isDisabled) setDays(d); }} className="hidden" disabled={isDisabled} />
                <span className="text-sm">{d} {d === 1 ? "day" : "days"}</span>
              </label>
            );
          })}
          <button type="button" onClick={() => setDays(7)} className={`rounded-xl border px-3 py-2 bg-white text-sm ${days === 7 ? "border-black" : "border-neutral-300 hover:border-neutral-400"}`}>
            5+
          </button>
        </div>
        {location !== "Las Vegas" && (
          <p className="text-xs text-neutral-500 mt-2">We only service 1-day conferences in Las Vegas.</p>
        )}
      </div>

      {/* How many locations (simultaneous) */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-rooms">
        <h3 id="q-rooms" className="font-medium mb-3">How many locations need filming at the same time (at the most)?</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5].map((r) => (
            <label key={r} className={`flex items-center justify-center rounded-xl border px-3 py-2 bg-white cursor-pointer ${rooms === r ? "border-black" : "border-neutral-300 hover:border-neutral-400"}`}>
              <input type="radio" name="rooms" value={r} checked={rooms === r} onChange={() => setRooms(r)} className="hidden" />
              <span className="text-sm">{r}</span>
            </label>
          ))}
          <button type="button" onClick={() => setRooms(6)} className={`rounded-xl border px-3 py-2 bg-white text-sm ${rooms === 6 ? "border-black" : "border-neutral-300 hover:border-neutral-400"}`}>
            5+
          </button>
        </div>
        {rooms === 6 && (
          <p className="text-xs text-neutral-500 mt-2">
            We can absolutely help you, but for events of this size, it's good to have a call. Please use this link to{" "}
            <a href="https://calendly.com/mbashian/30min?month=2025-10" target="_blank" rel="noopener noreferrer" className="underline">schedule a meeting</a>.
          </p>
        )}
      </div>

      {/* Estimated hours of content/videos */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-est-videos">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
          <h3 id="q-est-videos" className="font-medium">
            Estimated hours of content/videos: (auto updates based on above selections)
          </h3>
          <div className="border rounded-xl bg-white px-3 py-2 text-sm text-neutral-800 select-none text-center w-full sm:w-32">
            {isComplexScope ? "We’ll estimate this for larger, multi-room, multi-day events in your custom quote." : estimatedPresentations}
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Estimate is ~6 hours p/day(s) p/location(s) understanding individual edits delivered may incorporate long keynote presentations or shorter lightning session content.<br /><br />
          Many events have an opening keynote, then a full day of breakouts, and many events end mid-day on the last day. We get it and will work with your schedule, but that is why we estimate ~ 6 hours.
        </p>
      </div>

      {/* When does your event start? */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-event-start">
        <h3 id="q-event-start" className="font-medium mb-3">When does your event start?</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:max-w-md">
          <div className="col-span-3 sm:col-span-2">
            <span className="block text-xs text-neutral-500 mb-1">Month</span>
            <select className="border rounded-xl px-3 py-2 w-full bg-white" value={eventMonth} onChange={(e) => setEventMonth(Number(e.target.value))}>
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="block text-xs text-neutral-500 mb-1">Day</span>
            <select className="border rounded-xl px-3 py-2 w-full bg-white" value={eventDay} onChange={(e) => setEventDay(Number(e.target.value))}>
              {daysInMonth.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="block text-xs text-neutral-500 mb-1">Year</span>
            <select className="border rounded-xl px-3 py-2 w-full bg-white" value={eventYear} onChange={(e) => setEventYear(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* How soon would you like your edited videos? */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-turnaround">
        <h3 id="q-turnaround" className="font-medium mb-3">How soon would you like your edited videos?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { key: "4w", label: "4 weeks (default)" },
            { key: "3w", label: "3 weeks" },
            { key: "2w", label: "2 weeks" },
            { key: "1w", label: "1 week" },
          ].map((opt) => (
            <label key={opt.key} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 bg-white cursor-pointer ${turnaround === opt.key ? "border-black" : "border-neutral-300 hover:border-neutral-400"}`}>
              <div className="flex items-center gap-2">
                <input type="radio" name="turnaround" value={opt.key} checked={turnaround === opt.key} onChange={() => setTurnaround(opt.key)} />
                <span className="text-sm text-neutral-800">{opt.label}</span>
              </div>
            </label>
          ))}
          <div className="sm:col-span-4 flex justify-center">
            <label className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 bg-white cursor-pointer w-full sm:w-auto ${turnaround === "custom" ? "border-black" : "border-neutral-300 hover:border-neutral-400"}`}>
              <div className="flex items-center gap-2">
                <input type="radio" name="turnaround" value="custom" checked={turnaround === "custom"} onChange={() => setTurnaround("custom")} />
                <span className="text-sm text-neutral-800">Same Day / Custom Deadline(s) for some content. May require additional on-site editor(s)/labor</span>
              </div>
            </label>
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-2">Rush delivery estimates adjust based on the number of presentations to be recorded. The number of presentations estimates 6 hours of content, per filming location, per day.</p>
      </div>

      {/* Hotel rooms — only for non-Las Vegas */}
      {location !== "Las Vegas" && (
        <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-hotel">
          <h3 id="q-hotel" className="font-medium mb-3">Discount Option: Can your event provide our hotel room(s)?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "bash_pays", label: "Bash Films pays for their hotel rooms (default)" },
              { key: "venue_provides", label: "We will book and pay for your crew's hotel rooms." },
            ].map((opt) => (
              <label key={opt.key} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 bg-white cursor-pointer ${hotelOption === opt.key ? "border-black" : "border-neutral-300 hover:border-neutral-400"}`}>
                <div className="flex items-center gap-2">
                  <input type="radio" name="hotel" value={opt.key} checked={hotelOption === opt.key} onChange={() => setHotelOption(opt.key)} />
                  <span className="text-sm text-neutral-800">{opt.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Meals Provided? */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-meals">
        <h3 id="q-meals" className="font-medium mb-3">Discount Option: Food per diem(s)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: "no", label: "Include crew food per diems (default)" },
            { key: "yes", label: "Discount - Event provides breakfast & lunch" },
          ].map((opt) => (
            <label key={opt.key} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 bg-white cursor-pointer ${meals === opt.key ? "border-black" : "border-neutral-300 hover:border-neutral-400"}`}>
              <div className="flex items-center gap-2">
                <input type="radio" name="meals" value={opt.key} checked={meals === opt.key} onChange={() => setMeals(opt.key)} />
                <span className="text-sm text-neutral-800">{opt.label}</span>
              </div>
            </label>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-2">Per‑diem discounted if breakfast and lunch provided.</p>
      </div>

      {/* Email + Notes */}
      <div className="mt-6 p-4 border rounded-xl bg-white">
        <h3 className="font-medium mb-3">Event and contact information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" className="border rounded-xl px-3 py-2" placeholder="Your name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          <input type="email" className="border rounded-xl px-3 py-2" placeholder="Your email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          <input type="tel" className="border rounded-xl px-3 py-2" placeholder="Your phone number" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} aria-required="true" />
          <input type="text" className="border rounded-xl px-3 py-2" placeholder="Event Name" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
          <input type="url" className="border rounded-xl px-3 py-2" placeholder="Event Website" value={eventURL} onChange={(e) => setEventURL(e.target.value)} />
        </div>
      </div>

      <div className="mt-6 p-4 border rounded-xl bg-white">
        <h3 className="font-medium mb-3">Notes</h3>
        <textarea className="w-full h-28 border rounded-xl px-3 py-2" placeholder="Anything else we should know?" value={notesText} onChange={(e) => setNotesText(e.target.value)}></textarea>
      </div>

      {/* Submit section */}
      <div className="mt-6 p-4 border rounded-xl bg-white">
        <h3 className="font-medium mb-3">Let's start discussing your event</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => { if (!canSubmit) return; handleSubmitQuote(); }}
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            className={`rounded-xl px-4 py-2 border text-white shadow ${canSubmit ? "bg-black hover:opacity-90 cursor-pointer" : "bg-neutral-400 cursor-not-allowed opacity-60"}`}
          >
            Submit quote
          </button>
        </div>
        <p className="text-xs text-neutral-500 mt-2">Once your quote is received, we will follow up via email to schedule a call and discuss your event.</p>
      </div>

      {/* Starting price row (mirrors sticky cards) */}
      <div className="mt-6 p-4 border rounded-xl bg-white flex items-center justify-between">
        <div className="text-sm text-neutral-500">Starting Price</div>
        <div className="text-2xl font-semibold">{displayPrice}</div>
      </div>

      
    </div>
  );
}
