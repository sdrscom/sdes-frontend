// CareerPage.jsx
// ----------------------------------------------------------------------------
// SDRS / SDES — Careers Page
// Job postings and applications are fully managed from Strapi CMS (content-
// types `job-postings` and `job-applications` — see the schema note left
// with the team). Visual style mirrors the rest of the site (News,
// Investment, Gallery): the #262f61 → #2D3B76 navy gradient background, the
// Pattern grid overlay, and the #B82227 → #F27141 brand accent gradient.
// ----------------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import {
  Warehouse,
  Truck,
  ShieldCheck,
  Building2,
  Ship,
  Search,
  MapPin,
  Banknote,
  Briefcase,
  BarChart2,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Loader2,
  Globe2,
  CalendarDays,
  X,
  Upload,
} from "lucide-react";
import Pattern from "../../components/Pattern/Pattern";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../locales/translations";

const API_URL = import.meta.env.VITE_API_URL;
const ACCENT_GRADIENT = "linear-gradient(to right, #B82227, #F27141)";

// Maps a department name to an icon — extend this if a department shows up
// in Strapi that isn't in this list yet; falls back to a generic icon.
const DEPARTMENT_ICONS = {
  Operations: Ship,
  Warehousing: Warehouse,
  "Fleet & Transport": Truck,
  "Customs & Compliance": ShieldCheck,
  "Corporate & Support": Building2,
};
const DEFAULT_DEPT_ICON = Building2;

/* ================================================================ */
/*  STRAPI HELPERS                                                    */
/* ================================================================ */

// Handles both Strapi v4 (`attributes` wrapper, relations under `.data`)
// and v5 (flattened) response shapes.
function normalizeStrapiJob(entry) {
  const a = entry.attributes ?? entry;
  return {
    id: entry.id,
    title: a.title,
    department: a.department,
    locationType: a.location_type,
    countryCity: a.country_city,
    jobType: a.job_type,
    experienceLevel: a.experience_level,
    salaryRange: a.salary_range,
    description: a.description,
    requirements: (a.requirements ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    isFeatured: Boolean(a.is_featured),
    publishedAt: a.publishedAt,
  };
}

async function fetchJobsFromStrapi(language) {
  const res = await fetch(
    `${API_URL}/api/job-postings?populate=*&locale=${language}&pagination[pageSize]=100&sort=publishedAt:desc`
  );
  if (!res.ok) throw new Error(`Strapi responded with ${res.status}`);
  const json = await res.json();
  return (json.data ?? []).map(normalizeStrapiJob);
}

async function submitApplicationToStrapi(jobId, formValues) {
  const formData = new FormData();
  formData.append(
    "data",
    JSON.stringify({
      job_posting: jobId,
      first_name: formValues.firstName,
      last_name: formValues.lastName,
      email: formValues.email,
      phone: formValues.phone,
      portfolio_url: formValues.portfolioUrl,
      cover_note: formValues.coverNote,
    })
  );
  if (formValues.resumeFile) {
    formData.append("files.resume", formValues.resumeFile);
  }

  const res = await fetch(`${API_URL}/api/job-applications`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Strapi responded with ${res.status}`);
  return res.json();
}

function timeAgo(dateString, labels) {
  if (!dateString) return "";
  const days = Math.floor((new Date() - new Date(dateString)) / 86400000);
  if (days <= 0) return labels.today;
  if (days === 1) return labels.oneDayAgo;
  if (days < 30) return `${days} ${labels.daysAgo}`;
  return `${Math.floor(days / 30)} ${labels.monthsAgo}`;
}

/* ================================================================ */
/*  COMPONENT                                                          */
/* ================================================================ */
export default function CareerPage() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const t = translations[language].careerPage;

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [department, setDepartment] = useState(t.filters.allRoles);
  const [locationType, setLocationType] = useState("all");
  const [jobType, setJobType] = useState("all");

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchJobs() {
      setLoading(true);
      try {
        const liveJobs = await fetchJobsFromStrapi(language);
        if (!cancelled) setJobs(liveJobs);
      } catch (err) {
        console.error("Error fetching job postings:", err);
        if (!cancelled) setJobs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchJobs();
    return () => {
      cancelled = true;
    };
  }, [language]);

  useEffect(() => {
    setDepartment(t.filters.allRoles);
  }, [language, t.filters.allRoles]);

  const departmentCounts = useMemo(() => {
    const unique = [];
    for (const job of jobs) {
      if (job.department && !unique.includes(job.department)) unique.push(job.department);
    }
    return unique.map((name) => ({
      name,
      count: jobs.filter((j) => j.department === name).length,
    }));
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchesKeyword =
        keyword === "" ||
        j.title?.toLowerCase().includes(keyword.toLowerCase()) ||
        j.department?.toLowerCase().includes(keyword.toLowerCase());
      const matchesDept = department === t.filters.allRoles || j.department === department;
      const matchesLocation = locationType === "all" || j.locationType === locationType;
      const matchesJobType = jobType === "all" || j.jobType === jobType;
      return matchesKeyword && matchesDept && matchesLocation && matchesJobType;
    });
  }, [jobs, keyword, department, locationType, jobType, t.filters.allRoles]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || null;

  const openJob = useCallback((id) => {
    setSelectedJobId(id);
    setApplicationSubmitted(false);
    setSubmitError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const clearFilters = () => {
    setKeyword("");
    setDepartment(t.filters.allRoles);
    setLocationType("all");
    setJobType("all");
  };

  if (selectedJob) {
    return (
      <JobDetailView
        job={selectedJob}
        t={t}
        isRTL={isRTL}
        onBack={() => setSelectedJobId(null)}
        submitted={applicationSubmitted}
        submitting={submitting}
        submitError={submitError}
        onSubmit={async (values) => {
          setSubmitting(true);
          setSubmitError("");
          try {
            await submitApplicationToStrapi(selectedJob.id, values);
            setApplicationSubmitted(true);
          } catch (err) {
            console.error("Error submitting application:", err);
            setSubmitError(t.detail.submitError);
          } finally {
            setSubmitting(false);
          }
        }}
      />
    );
  }

  return (
    <section
      className="relative min-h-screen overflow-hidden pb-24 pt-32"
      style={{ background: "linear-gradient(to bottom right, #262f61, #2D3B76)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Pattern />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-300">
            <li className="flex items-center gap-1.5">
              <a href="/" className="transition-colors hover:text-[#F27141]">
                {t.breadcrumbHome}
              </a>
              <ArrowRight
                className={`h-3.5 w-3.5 text-gray-500 ${isRTL ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </li>
            <li className="font-medium text-white">{t.breadcrumbCareers}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#F27141]">
            {t.eyebrow}
          </span>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
            {t.header.title}
          </h1>
          <p className="mt-4 max-w-xl text-gray-300">{t.header.description}</p>
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t.search.placeholder}
            className="w-full rounded-lg border border-white/15 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-500 transition focus:border-[#F27141]/60 focus:outline-none focus:ring-2 focus:ring-[#F27141]/50"
          />
        </div>

        {/* Filters */}
        <div className="mb-10 flex flex-wrap items-center gap-3">
          <select
            value={locationType}
            onChange={(e) => setLocationType(e.target.value)}
            className="rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F27141]/40"
          >
            <option value="all">{t.filters.anyLocationType}</option>
            <option value="Remote">{t.filters.locationTypes.Remote}</option>
            <option value="Hybrid">{t.filters.locationTypes.Hybrid}</option>
            <option value="On-site">{t.filters.locationTypes["On-site"]}</option>
          </select>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F27141]/40"
          >
            <option value="all">{t.filters.anyJobType}</option>
            <option value="Full-Time">{t.filters.jobTypes["Full-Time"]}</option>
            <option value="Contract">{t.filters.jobTypes.Contract}</option>
            <option value="Part-Time">{t.filters.jobTypes["Part-Time"]}</option>
          </select>
        </div>

        {/* Department pills */}
        {!loading && jobs.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <DeptPill active={department === t.filters.allRoles} onClick={() => setDepartment(t.filters.allRoles)}>
              {t.filters.allRoles} <span className="ml-1 opacity-60">{jobs.length}</span>
            </DeptPill>
            {departmentCounts.map((d) => {
              const Icon = DEPARTMENT_ICONS[d.name] || DEFAULT_DEPT_ICON;
              return (
                <DeptPill key={d.name} active={department === d.name} onClick={() => setDepartment(d.name)}>
                  <Icon className="h-3.5 w-3.5" />
                  {d.name} <span className="ml-1 opacity-60">{d.count}</span>
                </DeptPill>
              );
            })}
          </div>
        )}

        {!loading && (
          <p className="mb-5 text-sm text-gray-400">
            {filteredJobs.length} {filteredJobs.length === 1 ? t.rolesFound.singular : t.rolesFound.plural}
          </p>
        )}

        {/* Job grid */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.loading.title}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/20 bg-white/[0.04] py-16 text-center">
            <p className="mb-1 font-semibold text-white">{t.emptyState.title}</p>
            <p className="mb-4 text-sm text-gray-400">{t.emptyState.description}</p>
            <button onClick={clearFilters} className="text-sm font-semibold text-[#F27141] hover:text-white">
              {t.emptyState.clearButton}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} t={t} onOpen={() => openJob(job.id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
function DeptPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        "relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border px-4 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F27141]/60",
        active ? "border-transparent text-white" : "border-white/15 text-gray-300 hover:text-white",
      ].join(" ")}
    >
      {active && (
        <span className="absolute inset-0 -z-10" style={{ background: ACCENT_GRADIENT }} />
      )}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
function locationBadgeStyle(type) {
  if (type === "Remote") return { color: "#F27141" };
  return {};
}

function JobCard({ job, t, onOpen }) {
  const Icon = DEPARTMENT_ICONS[job.department] || DEFAULT_DEPT_ICON;

  return (
    <div
      className={[
        "flex flex-col rounded-3xl border bg-white/[0.06] p-6",
        job.isFeatured ? "border-[#F27141]/40 ring-1 ring-[#F27141]/20" : "border-white/15",
      ].join(" ")}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-gray-200">
          <Icon className="h-3.5 w-3.5" />
          {job.department}
        </span>
        {job.isFeatured && (
          <span
            className="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
            style={{ background: ACCENT_GRADIENT }}
          >
            {t.card.featured}
          </span>
        )}
      </div>

      <h3 className="mb-2 text-base font-semibold leading-snug text-white">{job.title}</h3>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <span
          className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-medium text-gray-300"
          style={locationBadgeStyle(job.locationType)}
        >
          {job.locationType}
        </span>
        <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-medium text-gray-300">
          {job.jobType}
        </span>
        <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-medium text-gray-300">
          {job.experienceLevel}
        </span>
      </div>

      <p className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
        <MapPin className="h-3.5 w-3.5" />
        {job.countryCity}
      </p>
      {job.salaryRange && (
        <p className="mb-4 flex items-center gap-1.5 text-xs text-gray-400">
          <Banknote className="h-3.5 w-3.5" />
          {job.salaryRange}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-[11px] text-gray-500">
          {timeAgo(job.publishedAt, t.timeAgo)}
        </span>
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#F27141] hover:text-white"
        >
          {t.card.viewDetails}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  JOB DETAIL + APPLICATION MODAL                                      */
/* ------------------------------------------------------------------ */

// Job descriptions are written in Markdown in the CMS. Render them as
// formatted text, sanitized because the HTML is injected into the page.
function renderMarkdown(text) {
  return DOMPurify.sanitize(marked.parse(text || "", { breaks: true }));
}

function JobDetailView({ job, t, isRTL, onBack, submitted, submitting, submitError, onSubmit }) {
  const Icon = DEPARTMENT_ICONS[job.department] || DEFAULT_DEPT_ICON;
  const [applyOpen, setApplyOpen] = useState(false);
  const descriptionHtml = useMemo(() => renderMarkdown(job.description), [job.description]);

  const facts = [
    { icon: Building2, label: t.detail.labels.department, value: job.department },
    { icon: MapPin, label: t.detail.labels.location, value: job.countryCity },
    { icon: Globe2, label: t.detail.labels.workplace, value: job.locationType },
    { icon: Briefcase, label: t.detail.labels.jobType, value: job.jobType },
    { icon: BarChart2, label: t.detail.labels.experience, value: job.experienceLevel },
    { icon: Banknote, label: t.detail.labels.salary, value: job.salaryRange },
    { icon: CalendarDays, label: t.detail.posted, value: timeAgo(job.publishedAt, t.timeAgo) },
  ].filter((f) => f.value);

  const applyButton = (
    <button
      type="button"
      onClick={() => setApplyOpen(true)}
      disabled={submitted}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-default disabled:opacity-70"
      style={{ background: ACCENT_GRADIENT }}
    >
      {submitted ? (
        <>
          <CheckCircle2 className="h-4 w-4" />
          {t.detail.applied}
        </>
      ) : (
        <>
          {t.detail.applyNow}
          <ArrowRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
        </>
      )}
    </button>
  );

  return (
    <section
      className="relative min-h-screen overflow-hidden pb-28 pt-32 lg:pb-24"
      style={{ background: "linear-gradient(to bottom right, #262f61, #2D3B76)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Pattern />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-1.5 text-sm text-gray-300 transition hover:text-[#F27141]"
        >
          <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
          {t.detail.back}
        </button>

        {/* Header */}
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-200">
              <Icon className="h-3.5 w-3.5" />
              {job.department}
            </span>
            {job.isFeatured && (
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ background: ACCENT_GRADIENT }}
              >
                {t.card.featured}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">{job.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-300">
            {job.countryCity && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#F27141]" />
                {job.countryCity}
              </span>
            )}
            {job.jobType && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-[#F27141]" />
                {job.jobType}
              </span>
            )}
            {job.experienceLevel && (
              <span className="flex items-center gap-1.5">
                <BarChart2 className="h-4 w-4 text-[#F27141]" />
                {job.experienceLevel}
              </span>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          {/* Main content */}
          <article className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 sm:p-8">
            {job.description && (
              <>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#F27141]">
                  {t.detail.aboutRole}
                </h2>
                <div className="job-prose" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
              </>
            )}

            {job.requirements.length > 0 && (
              <div className={job.description ? "mt-8 border-t border-white/10 pt-8" : ""}>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#F27141]">
                  {t.detail.requirements}
                </h2>
                <ul className="space-y-3">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed text-gray-200">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F27141]/15">
                        <Check className="h-3.5 w-3.5 text-[#F27141]" />
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Apply call-to-action beneath the description; the form opens in a popup */}
            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#F27141]/30 bg-[#F27141]/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-base font-semibold text-white">{t.detail.applyTitle}</p>
                {!submitted && <p className="mt-1 text-sm text-gray-400">{t.detail.applyHint}</p>}
              </div>
              <div className="sm:w-56 sm:shrink-0">{applyButton}</div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 lg:sticky lg:top-28">
            <h2 className="mb-5 text-sm font-semibold text-white">{t.detail.overview}</h2>
            <dl className="space-y-4">
              {facts.map(({ icon: FactIcon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.08]">
                    <FactIcon className="h-4 w-4 text-[#F27141]" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</dt>
                    <dd className="break-words text-sm font-medium text-white">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="mt-6 hidden border-t border-white/10 pt-6 lg:block">
              {applyButton}
              {!submitted && <p className="mt-3 text-center text-xs text-gray-400">{t.detail.applyHint}</p>}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile: apply bar pinned to the bottom of the screen. Right padding
          keeps it clear of the chat button, which always sits bottom-right. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#262f61]/95 py-4 pl-4 pr-24 backdrop-blur lg:hidden">
        {applyButton}
      </div>

      {applyOpen && (
        <ApplyModal
          job={job}
          t={t}
          isRTL={isRTL}
          onClose={() => setApplyOpen(false)}
          submitted={submitted}
          submitting={submitting}
          submitError={submitError}
          onSubmit={onSubmit}
        />
      )}

      {/* Formatting for the Markdown job description */}
      <style>{`
        .job-prose { color: rgb(209 213 219); font-size: 15px; line-height: 1.75; }
        .job-prose > :first-child { margin-top: 0; }
        .job-prose h1, .job-prose h2, .job-prose h3, .job-prose h4 { color: #fff; font-weight: 700; line-height: 1.35; }
        .job-prose h1 { font-size: 1.25rem; margin: 0 0 1rem; }
        .job-prose h2 { font-size: 1.125rem; margin: 2rem 0 0.75rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); }
        .job-prose h3 { font-size: 1rem; margin: 1.5rem 0 0.5rem; color: #F27141; }
        .job-prose h4 { font-size: 0.95rem; margin: 1.25rem 0 0.5rem; }
        .job-prose p { margin: 0 0 1rem; }
        .job-prose strong { color: #fff; font-weight: 600; }
        .job-prose a { color: #F27141; text-decoration: underline; }
        .job-prose ul, .job-prose ol { margin: 0 0 1.25rem; padding-inline-start: 1.25rem; }
        .job-prose ul { list-style: none; padding-inline-start: 0; }
        .job-prose ul > li { position: relative; padding-inline-start: 1.25rem; margin: 0.4rem 0; }
        .job-prose ul > li::before { content: ""; position: absolute; inset-inline-start: 0; top: 0.7em; width: 6px; height: 6px; border-radius: 9999px; background: #F27141; }
        .job-prose ol { list-style: decimal; }
        .job-prose ol > li { margin: 0.4rem 0; padding-inline-start: 0.25rem; }
        .job-prose ol > li::marker { color: #F27141; font-weight: 600; }
        .job-prose hr { border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 1.5rem 0; }
        .job-prose blockquote { border-inline-start: 3px solid #F27141; padding-inline-start: 1rem; color: rgb(229 231 235); margin: 0 0 1rem; }
        .job-prose table { width: 100%; border-collapse: collapse; margin: 0 0 1rem; font-size: 14px; }
        .job-prose th, .job-prose td { border: 1px solid rgba(255,255,255,0.15); padding: 0.5rem 0.75rem; text-align: start; }
        .job-prose th { color: #fff; background: rgba(255,255,255,0.05); }
      `}</style>
    </section>
  );
}

/* ------------------------------------------------------------------ */
function ApplyModal({ job, t, isRTL, onClose, submitted, submitting, submitError, onSubmit }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    portfolioUrl: "",
    resumeFile: null,
    coverNote: "",
  });
  const firstFieldRef = useRef(null);

  // Lock page scroll, close on Escape, and focus the first field.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    firstFieldRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, submitting]);

  const update = (field) => (e) =>
    setForm((f) => ({
      ...f,
      [field]: e.target.type === "file" ? e.target.files[0] : e.target.value,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div
      // Above the chat widget (z-index 10000) so it can't cover the form.
      className="fixed inset-0 z-[10050] flex items-end justify-center bg-[#0d1330]/75 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/15 shadow-2xl sm:rounded-3xl"
        style={{ background: "linear-gradient(to bottom right, #2D3B76, #262f61)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-8">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F27141]">{t.detail.applyTitle}</p>
            <h2 id="apply-modal-title" className="mt-1 truncate text-lg font-bold text-white sm:text-xl">
              {job.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label={t.detail.close}
            className="rounded-lg p-2 text-gray-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-12 text-center sm:px-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F27141]/15">
              <CheckCircle2 className="h-7 w-7 text-[#F27141]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">{t.detail.success.title}</h3>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-gray-300">
              {t.detail.success.descriptionPrefix} {job.title}. {t.detail.success.descriptionSuffix}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-8 rounded-lg border border-white/20 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t.detail.close}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="grid grid-cols-1 gap-4 overflow-y-auto px-6 py-6 sm:grid-cols-2 sm:px-8">
              <Field label={t.detail.fields.firstName} required>
                <input ref={firstFieldRef} required type="text" autoComplete="given-name" value={form.firstName} onChange={update("firstName")} className="career-input" />
              </Field>
              <Field label={t.detail.fields.lastName} required>
                <input required type="text" autoComplete="family-name" value={form.lastName} onChange={update("lastName")} className="career-input" />
              </Field>
              <Field label={t.detail.fields.email} required>
                <input required type="email" autoComplete="email" value={form.email} onChange={update("email")} className="career-input" />
              </Field>
              <Field label={t.detail.fields.phone}>
                <input type="tel" autoComplete="tel" value={form.phone} onChange={update("phone")} className="career-input" />
              </Field>
              <Field label={t.detail.fields.portfolio} full>
                <input type="url" placeholder="https://" value={form.portfolioUrl} onChange={update("portfolioUrl")} className="career-input" />
              </Field>
              <Field label={t.detail.fields.resume} full required>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/25 bg-white/[0.04] px-4 py-4 transition hover:border-[#F27141]/60 hover:bg-white/[0.07]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F27141]/15">
                    <Upload className="h-5 w-5 text-[#F27141]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white">
                      {form.resumeFile ? form.resumeFile.name : t.detail.fields.resume}
                    </span>
                    <span className="block text-xs text-gray-400">PDF, DOCX</span>
                  </span>
                  <input required type="file" accept=".pdf,.docx" onChange={update("resumeFile")} className="sr-only" />
                </label>
              </Field>
              <Field label={t.detail.fields.coverNote} full>
                <textarea
                  rows={4}
                  placeholder={t.detail.fields.coverNotePlaceholder}
                  value={form.coverNote}
                  onChange={update("coverNote")}
                  className="career-input resize-y"
                />
              </Field>

              {submitError && <p className="text-sm text-amber-400 sm:col-span-2">{submitError}</p>}
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-gray-200 transition hover:bg-white/10 disabled:opacity-50"
              >
                {t.detail.close}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
                style={{ background: ACCENT_GRADIENT }}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? t.detail.submitting : t.detail.submit}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Scoped input styling shared by all fields above */}
      <style>{`
        .career-input {
          width: 100%;
          font-size: 0.875rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 0.5rem;
          padding: 0.625rem 0.875rem;
          color: rgb(241 245 249);
        }
        .career-input::placeholder { color: rgb(148 163 184); }
        .career-input:focus {
          outline: none;
          border-color: rgba(242, 113, 65, 0.6);
          box-shadow: 0 0 0 2px rgba(242, 113, 65, 0.4);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children, full = false, required = false }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-xs font-medium text-gray-300">
        {label}
        {required && <span className="text-[#F27141]"> *</span>}
      </label>
      {children}
    </div>
  );
}
