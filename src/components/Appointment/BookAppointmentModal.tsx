// Site-visit booking popup, opened from the home hero. Submissions go to the
// CMS (POST /api/appointments) and are processed on its Appointments screen.
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CalendarCheck, CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../locales/translations";

const API_URL = import.meta.env.VITE_API_URL;
const ACCENT_GRADIENT = "linear-gradient(to right, #B82227, #F27141)";
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

type IdType = "national_id" | "iqama" | "passport";
type DocKey = "idDocument" | "vehicleRegistration";

const todayInRiyadh = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(new Date());

// Phone photos are often 3–8 MB; shrink images so both documents fit the
// upload limit. PDFs are sent as they are.
async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= 1.5 * 1024 * 1024) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.82));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

export default function BookAppointmentModal({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const t = translations[language].appointment;

  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    idType: "national_id" as IdType,
    idNumber: "",
    phone: "",
    email: "",
    visitDate: "",
    visitTime: "",
    purpose: "",
    vehiclePlate: "",
    notes: "",
    consent: false,
    website: "", // honeypot
  });
  const [files, setFiles] = useState<Record<DocKey, File | null>>({ idDocument: null, vehicleRegistration: null });
  const [fileErrors, setFileErrors] = useState<Record<DocKey, string>>({ idDocument: "", vehicleRegistration: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Lock page scroll, close on Escape, and focus the first field.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    firstFieldRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, submitting]);

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
    };

  const pickFile = (key: DocKey) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    let message = "";
    let file: File | null = null;
    if (!ACCEPTED_TYPES.includes(picked.type)) {
      message = t.errors.fileType;
    } else {
      file = await shrinkImage(picked).catch(() => picked);
      if (file.size > MAX_FILE_BYTES) {
        message = t.errors.fileTooLarge;
        file = null;
      }
    }
    setFiles((f) => ({ ...f, [key]: file }));
    setFileErrors((f) => ({ ...f, [key]: message }));
  };

  const idIsNumeric = form.idType !== "passport";
  const idNumberInvalid = idIsNumeric && form.idNumber !== "" && !/^[12]\d{9}$/.test(form.idNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (idNumberInvalid) return setError(t.errors.idNumber);
    if (!files.idDocument || !files.vehicleRegistration) {
      setFileErrors({
        idDocument: files.idDocument ? "" : t.errors.fileRequired,
        vehicleRegistration: files.vehicleRegistration ? "" : t.errors.fileRequired,
      });
      return setError(t.errors.fileRequired);
    }

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, String(v)));
    data.append("locale", language);
    data.append("idDocument", files.idDocument);
    data.append("vehicleRegistration", files.vehicleRegistration);

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments`, { method: "POST", body: data });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || t.errors.generic);
      setReference(body.data.reference);
      bodyRef.current?.scrollTo({ top: 0 });
    } catch (err) {
      // Server messages are English; show them as-is there, generic text otherwise.
      setError(language === "en" && err instanceof Error ? err.message : t.errors.generic);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10050] flex items-end justify-center bg-[#0d1330]/75 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-title"
        className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-white/15 text-start shadow-2xl sm:rounded-3xl"
        style={{ background: "linear-gradient(to bottom right, #2D3B76, #262f61)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-8">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F27141]/15">
              <CalendarCheck className="h-5 w-5 text-[#F27141]" />
            </span>
            <div className="min-w-0">
              <h2 id="appointment-title" className="text-lg font-bold text-white sm:text-xl">
                {t.title}
              </h2>
              {!reference && <p className="mt-1 text-sm leading-relaxed text-gray-300">{t.subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label={t.cancel}
            className="rounded-lg p-2 text-gray-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {reference ? (
          <div ref={bodyRef} className="overflow-y-auto px-6 py-12 text-center sm:px-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F27141]/15">
              <CheckCircle2 className="h-7 w-7 text-[#F27141]" />
            </div>
            <h3 className="mb-4 text-xl font-semibold text-white">{t.success.title}</h3>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{t.success.reference}</p>
            <p className="mt-2 inline-block rounded-xl border border-[#F27141]/40 bg-[#F27141]/10 px-5 py-2.5 font-mono text-xl font-bold tracking-wider text-white" dir="ltr">
              {reference}
            </p>
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-gray-300">{t.success.description}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-8 rounded-lg px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
              style={{ background: ACCENT_GRADIENT }}
            >
              {t.success.done}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div ref={bodyRef} className="space-y-7 overflow-y-auto px-6 py-6 sm:px-8">
              <p className="text-xs text-gray-400">{t.requiredNote}</p>

              <Section title={t.sections.visitor} step={1}>
                <Field label={t.fields.fullName} required full>
                  <input ref={firstFieldRef} required type="text" autoComplete="name" maxLength={120}
                    placeholder={t.placeholders.fullName} value={form.fullName} onChange={set("fullName")} className="apt-input" />
                </Field>
                <Field label={t.fields.companyName} required full>
                  <input required type="text" autoComplete="organization" maxLength={160}
                    placeholder={t.placeholders.companyName} value={form.companyName} onChange={set("companyName")} className="apt-input" />
                </Field>
                <Field label={t.fields.idType} required>
                  <select required value={form.idType} onChange={set("idType")} className="apt-input">
                    {(Object.keys(t.idTypes) as IdType[]).map((key) => (
                      <option key={key} value={key}>{t.idTypes[key]}</option>
                    ))}
                  </select>
                </Field>
                <Field label={t.fields.idNumber} required error={idNumberInvalid ? t.errors.idNumber : ""}>
                  <input required type="text" dir="ltr" maxLength={idIsNumeric ? 10 : 20}
                    inputMode={idIsNumeric ? "numeric" : "text"} pattern={idIsNumeric ? "[12][0-9]{9}" : "[A-Za-z0-9]{5,20}"}
                    placeholder={idIsNumeric ? t.placeholders.idNumber : t.placeholders.passportNumber}
                    value={form.idNumber}
                    onChange={(e) => setForm((f) => ({ ...f, idNumber: idIsNumeric ? e.target.value.replace(/\D/g, "") : e.target.value }))}
                    className="apt-input" />
                </Field>
                <Field label={t.fields.phone} required>
                  <input required type="tel" dir="ltr" autoComplete="tel" maxLength={20} pattern="\+?[0-9\s\-]{8,20}"
                    placeholder={t.placeholders.phone} value={form.phone} onChange={set("phone")} className="apt-input" />
                </Field>
                <Field label={t.fields.email} required>
                  <input required type="email" dir="ltr" autoComplete="email" maxLength={160}
                    placeholder={t.placeholders.email} value={form.email} onChange={set("email")} className="apt-input" />
                </Field>
              </Section>

              <Section title={t.sections.visit} step={2}>
                <Field label={t.fields.visitDate} required>
                  <input required type="date" min={todayInRiyadh()} value={form.visitDate} onChange={set("visitDate")} className="apt-input" />
                </Field>
                <Field label={t.fields.visitTime} required>
                  <select required value={form.visitTime} onChange={set("visitTime")} className="apt-input">
                    <option value="" disabled>{t.placeholders.select}</option>
                    {t.timeSlots.filter(Boolean).map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                </Field>
                <Field label={t.fields.purpose} required full>
                  <select required value={form.purpose} onChange={set("purpose")} className="apt-input">
                    <option value="" disabled>{t.placeholders.select}</option>
                    {t.purposes.filter(Boolean).map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
              </Section>

              <Section title={t.sections.vehicle} step={3}>
                <Field label={t.fields.vehiclePlate} required full>
                  <input required type="text" maxLength={30} placeholder={t.placeholders.vehiclePlate}
                    value={form.vehiclePlate} onChange={set("vehiclePlate")} className="apt-input uppercase" />
                </Field>
              </Section>

              <Section title={t.sections.documents} step={4}>
                {(["idDocument", "vehicleRegistration"] as DocKey[]).map((key) => (
                  <Field key={key} label={t.fields[key]} required error={fileErrors[key]}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/25 bg-white/[0.04] px-4 py-3.5 transition hover:border-[#F27141]/60 hover:bg-white/[0.07]">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F27141]/15">
                        {files[key] ? <FileText className="h-5 w-5 text-[#F27141]" /> : <Upload className="h-5 w-5 text-[#F27141]" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-white">
                          {files[key]?.name || t.chooseFile}
                        </span>
                        <span className="block text-xs text-gray-400">{t.fileHint}</span>
                      </span>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                        onChange={pickFile(key)} className="sr-only" />
                    </label>
                  </Field>
                ))}
                <Field label={t.fields.notes} full>
                  <textarea rows={3} maxLength={1000} placeholder={t.placeholders.notes}
                    value={form.notes} onChange={set("notes")} className="apt-input resize-y" />
                </Field>
              </Section>

              {/* Honeypot: hidden from people, filled in by bots. */}
              <input type="text" name="website" value={form.website} onChange={set("website")}
                className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <input required type="checkbox" checked={form.consent} onChange={set("consent")}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#F27141]" />
                <span className="text-sm leading-relaxed text-gray-300">{t.consent}</span>
              </label>

              {error && (
                <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-300" role="alert">
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
              <button type="button" onClick={onClose} disabled={submitting}
                className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-gray-200 transition hover:bg-white/10 disabled:opacity-50">
                {t.cancel}
              </button>
              <button type="submit" disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
                style={{ background: ACCENT_GRADIENT }}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? t.submitting : t.submit}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .apt-input {
          width: 100%;
          font-size: 0.875rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 0.5rem;
          padding: 0.625rem 0.875rem;
          color: rgb(241 245 249);
          color-scheme: dark;
        }
        .apt-input::placeholder { color: rgb(148 163 184); text-transform: none; }
        .apt-input option { background: #262f61; color: #fff; }
        .apt-input:focus {
          outline: none;
          border-color: rgba(242, 113, 65, 0.6);
          box-shadow: 0 0 0 2px rgba(242, 113, 65, 0.4);
        }
      `}</style>
    </div>
  );
}

function Section({ title, step, children }: { title: string; step: number; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-4 flex items-center gap-2.5 text-sm font-semibold text-white">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F27141] text-xs font-bold text-white">
          {step}
        </span>
        {title}
      </legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  children,
  full = false,
  required = false,
  error = "",
}: {
  label: string;
  children: ReactNode;
  full?: boolean;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className={`relative ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-medium text-gray-300">
        {label}
        {required && <span className="text-[#F27141]"> *</span>}
      </span>
      {children}
      {error && <p className="mt-1.5 text-xs text-amber-300">{error}</p>}
    </div>
  );
}
