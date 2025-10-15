"use client";

import { useEffect, useState } from "react";

// Minimal Lucide-style icons (inline SVG to avoid external deps)
const CheckCircle2 = (props: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round"
       className={props.className || ""} aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="M22 4 12 14.01l-3-3" />
  </svg>
);

const HelpCircle = (props: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round"
       className={props.className || ""} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4" />
    <line x1="12" y1="17" x2="12" y2="17" />
  </svg>
);

// ----------------- Package & Pricing -----------------
const PACKAGE = {
  title: "Conference Presentation Recording & Editing Pricing",
  inclusions: [
    "1 day of on-site pre-production (operator arrival, setup, and connection tests)",
    "Travel (airfare + hotel) included in the starting price",
    "Operator on site (1 person)",
    "Up to 8 hours/day of recording",
    "Bash Films proprietary 4K motion tracking",
    "Custom graphics branded for your event",
    "Delivery timing chosen below",
    "Upload delivery",
  ],
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState("Las Vegas");
  const [days, setDays] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [turnaround, setTurnaround] = useState("4w");
  const [hotelOption, setHotelOption] = useState("bash_pays");
  const [meals, setMeals] = useState("no");

  useEffect(() => {
    setMounted(true);
  }, []);

  const currency = (n: number | string) =>
    `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  useEffect(() => {
    if (location !== "Las Vegas" && days === 1) setDays(2);
  }, [location, days]);

  const isComplexScope = rooms === 6 || days === 7;
  const videos = isComplexScope ? 0 : days * rooms * 7;
  const perVideo = turnaround === "custom" ? 175 : turnaround === "4w" ? 50 : turnaround === "3w" ? 75 : turnaround === "2w" ? 100 : 135;
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
    : (location !== "Las Vegas"
        ? (hotelOption === "bash_pays"
            ? hotelRooms * hotelNights * hotelRatePerRoomPerNight
            : hotelRooms * hotelNights * hotelRateClientProvides)
        : 0);

  const perDiemRatePerOperatorPerDay = 150;
  const mealsCreditPerOperatorPerDay = 50;
  const perDiemDays = isComplexScope ? 0 : (days + 1);
  const perDiemBase = isComplexScope ? 0 : operators * perDiemDays * perDiemRatePerOperatorPerDay;
  const perDiemMealsCredit = isComplexScope ? 0 : (meals === "yes" ? operators * perDiemDays * mealsCreditPerOperatorPerDay : 0);
  const perDiemCost = isComplexScope ? 0 : perDiemBase - perDiemMealsCredit;

  const luggageFeePerOperator = 175;
  const luggageCost = isComplexScope ? 0 : (location !== "Las Vegas" ? operators * luggageFeePerOperator : 0);

  const groundTransportFeePerOperator = 75;
  const groundTransportCost = isComplexScope ? 0 : operators * groundTransportFeePerOperator;

  const baseTotal = isComplexScope ? 0 : videoCost + operatorCost + airfareCost + hotelCost + perDiemCost + luggageCost + groundTransportCost;
  const markupMultiplier = isComplexScope ? 1 : (location === "Las Vegas" ? (baseTotal < 5000 ? 1.35 : baseTotal < 10000 ? 1.3 : 1.2) : (baseTotal < 10000 ? 1.55 : baseTotal < 20000 ? 1.5 : 1.4));
  const totalPrice = isComplexScope ? 0 : baseTotal * markupMultiplier;
  const displayPrice = isComplexScope ? "Contact for quote" : currency(totalPrice);

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

      {/* Header + What's included (white card) */}
      <div className="rounded-2xl border bg-white p-5 sm:p-8 shadow-sm">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">{PACKAGE.title}</h1>
          <p className="text-neutral-600 mt-1">
            Our flagship service: 4K UHD filming & editing with proprietary 4K motion tracking, color grading, audio mixing, and delivery via upload.
          </p>
        </div>

        <h3 className="font-medium mb-2 text-neutral-900">What is ALWAYS included</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[0, 1].map((col) => (
            <ul key={col} className="space-y-2 text-sm text-neutral-800">
              {PACKAGE.inclusions
                .filter((_, i) => i % 2 === col)
                .map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
            </ul>
          ))}
        </div>
      </div>

      {/* Where is your conference? */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-location">
        <h3 id="q-location" className="font-medium mb-3 text-neutral-900">Where is your conference?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {["Las Vegas", "Other US City", "International"].map((opt) => (
            <label
              key={opt}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 bg-white cursor-pointer ${location === opt ? "border-black" : "border-neutral-300 hover:border-neutral-400"}`}
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
        <p className="text-xs text-neutral-500 mt-2">Bash Films is licensed, insured, and based in Las Vegas, NV. Events local to Las Vegas have different pricing options.</p>
      </div>

      {/* How many days is your conference? */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-days">
        <h3 id="q-days" className="font-medium mb-3 text-neutral-900">How many days is your conference?</h3>
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
                <input
                  type="radio"
                  name="days"
                  value={d}
                  checked={selected}
                  onChange={() => { if (!isDisabled) setDays(d); }}
                  className="hidden"
                  disabled={isDisabled}
                />
                <span className="text-sm text-neutral-900">{d} {d === 1 ? "day" : "days"}</span>
              </label>
            );
          })}
          <button
            type="button"
            onClick={() => setDays(7)}
            className={`rounded-xl border px-3 py-2 bg-white text-sm text-neutral-900 ${days === 7 ? "border-black" : "border-neutral-300 hover:border-neutral-400"}`}
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
        <h3 id="q-rooms" className="font-medium mb-3 text-neutral-900">How many locations need filming at the same time (at the most)?</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5].map((r) => (
            <label
              key={r}
              className={`flex items-center justify-center rounded-xl border px-3 py-2 bg-white cursor-pointer ${rooms === r ? "border-black" : "border-neutral-300 hover:border-neutral-400"}`}
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
            className={`rounded-xl border px-3 py-2 bg-white text-sm text-neutral-900 ${rooms === 6 ? "border-black" : "border-neutral-300 hover:border-neutral-400"}`}
          >
            5+
          </button>
        </div>
        {rooms === 6 && (
          <p className="text-xs text-neutral-500 mt-2">
            We can absolutely help you, but for events of this size, it&apos;s good to have a call. Please use this link to{" "}
            <a href="https://calendly.com/mbashian/30min?month=2025-10" target="_blank" rel="noopener noreferrer" className="underline">schedule a meeting</a>.
          </p>
        )}
      </div>

      {/* Need your videos faster? */}
      <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-turnaround">
        <h3 id="q-turnaround" className="font-medium mb-3 text-neutral-900">Need your videos faster?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: "4w", label: "4 weeks (default)" },
            { key: "3w", label: "3 weeks (standard)" },
            { key: "2w", label: "2 weeks (rush)" },
            { key: "1w", label: "1 week (priority)" },
            { key: "custom", label: "Same Day / Custom Deadline(s) for some content" },
          ].map((opt) => (
            <label
              key={opt.key}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 bg-white cursor-pointer ${turnaround === opt.key ? "border-black" : "border-neutral-300 hover:border-neutral-400"}`}
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
        </div>
        <p className="text-xs text-neutral-500 mt-2">Rush delivery estimates adjust based on the number of presentations to be recorded.</p>
      </div>

      {/* Hotel rooms — only for non-Las Vegas */}
      {location !== "Las Vegas" && (
        <div className="mt-6 p-4 border rounded-xl bg-neutral-50" role="group" aria-labelledby="q-hotel">
          <h3 id="q-hotel" className="font-medium mb-3 text-neutral-900">Would you like to pay for our hotel room(s)?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "bash_pays", label: "Bash Films pays for their hotel rooms (default)" },
              { key: "venue_provides", label: "We will book and pay for your crew's hotel rooms." },
            ].map((opt) => (
              <label
                key={opt.key}
                className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 bg-white cursor-pointer ${hotelOption === opt.key ? "border-black" : "border-neutral-300 hover:border-neutral-400"}`}
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
        <h3 id="q-meals" className="font-medium mb-3 text-neutral-900">Does your event provide breakfast and lunch to your event staff and/or attendees?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: "no", label: "No – include crew per diems (default)" },
            { key: "yes", label: "Yes – we can provide meals to your crew" },
          ].map((opt) => (
            <label
              key={opt.key}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 bg-white cursor-pointer ${meals === opt.key ? "border-black" : "border-neutral-300 hover:border-neutral-400"}`}
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
        <p className="text-xs text-neutral-500 mt-2">Per-diem discounted if breakfast and lunch provided.</p>
      </div>

      {/* Email + Notes */}
      <div className="mt-6 p-4 border rounded-xl bg-white">
        <h3 className="font-medium mb-3 text-neutral-900">Send this estimate</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="border rounded-xl px-3 py-2 text-neutral-900 placeholder:text-neutral-400" placeholder="Your name" />
          <input className="border rounded-xl px-3 py-2 text-neutral-900 placeholder:text-neutral-400" placeholder="Your email" />
        </div>
      </div>

      <div className="mt-6 p-4 border rounded-xl bg-white">
        <h3 className="font-medium mb-3 text-neutral-900">Notes</h3>
        <textarea className="w-full h-28 border rounded-xl px-3 py-2 text-neutral-900 placeholder:text-neutral-400" placeholder="Anything else we should know?"></textarea>
      </div>

      {/* Starting price row (mirrors sticky cards) */}
      <div className="mt-6 p-4 border rounded-xl bg-white flex items-center justify-between">
        <div className="text-sm text-neutral-500">Starting Price</div>
        <div className="text-2xl font-semibold text-neutral-900">{displayPrice}</div>
      </div>

      {/* FAQ */}
      <div className="rounded-2xl border bg-white p-5 sm:p-8 shadow-sm mt-6">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4" />
          <h3 className="font-medium text-neutral-900">FAQ</h3>
        </div>
        <ul className="space-y-3 text-sm text-neutral-800">
          <li><strong>What&apos;s included?</strong> On-site setup day, filming up to 8 hrs/day, one operator, travel included.</li>
          <li><strong>Turnaround options?</strong> Standard is 3 weeks; rush options available.</li>
          <li><strong>Hotel credits?</strong> If the conference provides the room, we deduct a credit in the final quote.</li>
          <li><strong>Half-days?</strong> Crews bill by the day—choose the next whole day for partial days.</li>
          <li><strong>Where is your team based?</strong> Our owner, Mark Bashian, is based in Las Vegas, with several core team members local. Beyond Las Vegas, we collaborate with 10+ videographers in major U.S. markets—professionals Mark has personally trained and worked with over many projects—so coverage scales across cities without compromising Bash Films&apos; standards.</li>
          <li><strong>Ownership & delivery?</strong> Client usage rights to final videos; raw footage available upon request.</li>
        </ul>
      </div>
    </div>
  );
}
