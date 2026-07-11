import React, { useState } from "react";
import {
  Search,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Circle,
  Ship,
  ClipboardCheck,
  ShieldCheck,
  Warehouse,
  Truck,
  MapPin,
  Calendar,
  Box,
  AlertCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  MOCK DATA — swap for a real API response shaped like this object   */
/* ------------------------------------------------------------------ */
const SHIPMENTS = {
  "SDRS-88213": {
    trackingId: "SDRS-88213",
    refType: "Container Number",
    origin: "Jebel Ali, UAE",
    destination: "King Abdulaziz Port, Dammam",
    commodity: "Industrial Machinery Parts",
    weight: "18,400 kg",
    eta: "14 Jul 2026",
    status: "In Customs Clearance",
    currentStep: 2,
    milestones: [
      {
        title: "Booking Confirmed",
        icon: Box,
        location: "Jebel Ali Port, UAE",
        timestamp: "02 Jul 2026 · 09:12",
        detail: "Shipment booked and container sealed for export.",
      },
      {
        title: "Container Discharged",
        icon: Ship,
        location: "King Abdulaziz Port, Dammam",
        timestamp: "09 Jul 2026 · 06:40",
        detail: "Vessel berthed and container offloaded to port yard.",
      },
      {
        title: "On-Site Inspection",
        icon: ClipboardCheck,
        location: "Customs Inspection Yard, Dammam",
        timestamp: "10 Jul 2026 · 14:05",
        detail: "Physical inspection scheduled by Saudi Customs authority.",
      },
      {
        title: "Customs Cleared",
        icon: ShieldCheck,
        location: "Dammam Customs Office",
        timestamp: "Pending",
        detail: "Final duty assessment and clearance certificate issue.",
      },
      {
        title: "Stored in Bonded Warehouse",
        icon: Warehouse,
        location: "SDRS Bonded Facility, Dammam",
        timestamp: "Pending",
        detail: "Held under bond ahead of final-mile dispatch.",
      },
      {
        title: "Released for Delivery",
        icon: Truck,
        location: "—",
        timestamp: "Pending",
        detail: "Handover to inland transport for final delivery.",
      },
    ],
  },
  "MSCU7654321": {
    trackingId: "MSCU7654321",
    refType: "Container Number",
    origin: "Rotterdam, Netherlands",
    destination: "Jeddah Islamic Port",
    commodity: "Packaged Consumer Electronics",
    weight: "9,120 kg",
    eta: "11 Jul 2026 (Delivered)",
    status: "Delivery Complete",
    currentStep: 5,
    milestones: [
      {
        title: "Booking Confirmed",
        icon: Box,
        location: "Rotterdam Port, NL",
        timestamp: "18 Jun 2026 · 11:00",
        detail: "Shipment booked and container sealed for export.",
      },
      {
        title: "Container Discharged",
        icon: Ship,
        location: "Jeddah Islamic Port",
        timestamp: "05 Jul 2026 · 08:22",
        detail: "Vessel berthed and container offloaded to port yard.",
      },
      {
        title: "On-Site Inspection",
        icon: ClipboardCheck,
        location: "Customs Inspection Yard, Jeddah",
        timestamp: "06 Jul 2026 · 10:47",
        detail: "Physical inspection completed, no discrepancies found.",
      },
      {
        title: "Customs Cleared",
        icon: ShieldCheck,
        location: "Jeddah Customs Office",
        timestamp: "07 Jul 2026 · 16:30",
        detail: "Duty assessed and clearance certificate issued.",
      },
      {
        title: "Stored in Bonded Warehouse",
        icon: Warehouse,
        location: "SDRS Bonded Facility, Jeddah",
        timestamp: "08 Jul 2026 · 09:15",
        detail: "Held under bond ahead of final-mile dispatch.",
      },
      {
        title: "Released for Delivery",
        icon: Truck,
        location: "Riyadh Distribution Center",
        timestamp: "11 Jul 2026 · 13:52",
        detail: "Delivered and signed for by consignee.",
      },
    ],
  },
  "BL-2026-00456": {
    trackingId: "BL-2026-00456",
    refType: "Bill of Lading",
    origin: "Shanghai, China",
    destination: "King Abdulaziz Port, Dammam",
    commodity: "Steel Coil, Grade A36",
    weight: "42,000 kg",
    eta: "22 Jul 2026",
    status: "Container Discharged",
    currentStep: 1,
    milestones: [
      {
        title: "Booking Confirmed",
        icon: Box,
        location: "Shanghai Port, CN",
        timestamp: "28 Jun 2026 · 07:50",
        detail: "Shipment booked and container sealed for export.",
      },
      {
        title: "Container Discharged",
        icon: Ship,
        location: "King Abdulaziz Port, Dammam",
        timestamp: "10 Jul 2026 · 22:18",
        detail: "Vessel berthed and container offloaded to port yard.",
      },
      {
        title: "On-Site Inspection",
        icon: ClipboardCheck,
        location: "Customs Inspection Yard, Dammam",
        timestamp: "Pending",
        detail: "Physical inspection scheduled by Saudi Customs authority.",
      },
      {
        title: "Customs Cleared",
        icon: ShieldCheck,
        location: "Dammam Customs Office",
        timestamp: "Pending",
        detail: "Final duty assessment and clearance certificate issue.",
      },
      {
        title: "Stored in Bonded Warehouse",
        icon: Warehouse,
        location: "SDRS Bonded Facility, Dammam",
        timestamp: "Pending",
        detail: "Held under bond ahead of final-mile dispatch.",
      },
      {
        title: "Released for Delivery",
        icon: Truck,
        location: "—",
        timestamp: "Pending",
        detail: "Handover to inland transport for final delivery.",
      },
    ],
  },
};

const SAMPLE_IDS = Object.keys(SHIPMENTS);

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */
export default function TrackingPage() {
  const [query, setQuery] = useState("");
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const key = query.trim().toUpperCase();
    if (!key) return;
    const match = SHIPMENTS[key];
    if (match) {
      setError("");
      setShipment(match);
    } else {
      setShipment(null);
      setError(
        `No shipment found for "${query.trim()}". Try one of the sample references below.`
      );
    }
  };

  const reset = () => {
    setShipment(null);
    setError("");
    setQuery("");
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans">
      {/* subtle port-grid backdrop */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 py-14">
        {/* Brand header */}
        <div className="flex items-center gap-3 mb-12">
          <div className="h-9 w-9 rounded-md bg-emerald-500 flex items-center justify-center shrink-0">
            <Ship className="h-5 w-5 text-slate-950" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-slate-100">
              SDRS
            </p>
            <p className="text-[11px] tracking-wide text-slate-500 -mt-0.5">
              Saudi Development &amp; Export Services
            </p>
          </div>
        </div>

        {!shipment && (
          <div className="mt-4">
            <p className="text-xs font-semibold tracking-[0.25em] text-emerald-400 uppercase mb-3">
              Shipment Tracking
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 leading-tight mb-3">
              Track your cargo through
              <br className="hidden sm:block" /> customs, live.
            </h1>
            <p className="text-slate-400 max-w-xl mb-10">
              Enter a Tracking ID, Container Number, or Bill of Lading to view
              real-time customs clearance status.
            </p>

            <form onSubmit={handleSearch} className="w-full">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. SDRS-88213"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-11 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/60 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-lg px-7 py-3.5 transition active:scale-[0.98]"
                >
                  Track Shipment
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 flex items-start gap-2 text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-10 pt-8 border-t border-slate-900">
              <p className="text-[11px] uppercase tracking-widest text-slate-600 mb-3">
                Try a sample reference
              </p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_IDS.map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                      setQuery(id);
                      setShipment(SHIPMENTS[id]);
                      setError("");
                    }}
                    className="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 hover:border-emerald-500/50 hover:text-emerald-400 transition"
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {shipment && (
          <ShipmentDashboard shipment={shipment} onBack={reset} />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DASHBOARD                                                          */
/* ------------------------------------------------------------------ */
function ShipmentDashboard({ shipment, onBack }) {
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-400 transition mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        New search
      </button>

      {/* Summary card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 sm:p-7 mb-10">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">
              {shipment.refType}
            </p>
            <p className="text-xl font-mono font-semibold text-slate-50">
              {shipment.trackingId}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full px-3.5 py-1.5 text-xs font-semibold">
            <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
            {shipment.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-5 border-t border-slate-800">
          <Field icon={MapPin} label="Origin" value={shipment.origin} />
          <Field
            icon={MapPin}
            label="Destination"
            value={shipment.destination}
          />
          <Field icon={Box} label="Commodity" value={shipment.commodity} />
          <Field icon={Calendar} label="ETA" value={shipment.eta} />
        </div>
      </div>

      {/* Timeline */}
      <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-6">
        Customs Milestone Timeline
      </p>
      <div className="relative pl-2">
        {shipment.milestones.map((m, i) => {
          const isComplete = i < shipment.currentStep;
          const isCurrent = i === shipment.currentStep;
          const isLast = i === shipment.milestones.length - 1;
          const Icon = m.icon;

          return (
            <div key={m.title} className="relative flex gap-5 pb-10 last:pb-0">
              {/* connector line */}
              {!isLast && (
                <div
                  className={`absolute left-[19px] top-10 w-[2px] h-[calc(100%-1.5rem)] ${
                    isComplete ? "bg-emerald-500" : "bg-slate-800"
                  }`}
                />
              )}

              {/* node */}
              <div className="relative shrink-0">
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping" />
                )}
                <div
                  className={`relative h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                    isComplete
                      ? "bg-emerald-500 border-emerald-500"
                      : isCurrent
                      ? "bg-slate-900 border-emerald-500"
                      : "bg-slate-900 border-slate-700"
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-slate-950" />
                  ) : (
                    <Icon
                      className={`h-4.5 w-4.5 ${
                        isCurrent ? "text-emerald-400" : "text-slate-600"
                      }`}
                    />
                  )}
                </div>
              </div>

              {/* content */}
              <div className="pt-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={`text-sm font-semibold ${
                      isComplete || isCurrent
                        ? "text-slate-100"
                        : "text-slate-600"
                    }`}
                  >
                    {m.title}
                  </h3>
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400 bg-emerald-500/10 rounded px-1.5 py-0.5">
                      <Clock3 className="h-3 w-3" />
                      In progress
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mb-1.5 ${
                    isComplete || isCurrent ? "text-slate-400" : "text-slate-700"
                  }`}
                >
                  {m.detail}
                </p>
                <div
                  className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono ${
                    isComplete || isCurrent ? "text-slate-500" : "text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {m.location}
                  </span>
                  <span>{m.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500 mb-1">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="text-sm text-slate-200 font-medium truncate">{value}</p>
    </div>
  );
}
