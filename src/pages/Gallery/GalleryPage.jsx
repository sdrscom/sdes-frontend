// GalleryPage.jsx
// ----------------------------------------------------------------------------
// SDRS / SDES — Facility Gallery Page
// Fetches gallery items from the Strapi CMS (content-type API ID:
// `gallery-items`, fields: title, category, caption, image — see the schema
// note left with the team). Content is managed entirely from Strapi; there is
// no local/mock data fallback other than the loading and empty states below.
// Visual style mirrors the rest of the site (News, Investment): the
// #262f61 → #2D3B76 navy gradient background, the Pattern grid overlay, and
// the #B82227 → #F27141 brand accent gradient.
// ----------------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import Pattern from "../../components/Pattern/Pattern";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../locales/translations";

const API_URL = import.meta.env.VITE_API_URL;
const ACCENT_GRADIENT = "linear-gradient(to right, #B82227, #F27141)";

// ----------------------------------------------------------------------------
// Strapi helpers
// ----------------------------------------------------------------------------
function getStrapiImageUrl(image, size = "original") {
  if (!image) return null;
  if (typeof image === "string") return image;

  const candidate = size !== "original" ? image.formats?.[size]?.url : undefined;
  const resolvedUrl =
    candidate ??
    image.formats?.large?.url ??
    image.formats?.medium?.url ??
    image.formats?.small?.url ??
    image.formats?.thumbnail?.url ??
    image.url;

  if (!resolvedUrl) return null;
  return /^https?:\/\//i.test(resolvedUrl) ? resolvedUrl : `${API_URL}${resolvedUrl}`;
}

function normalizeGalleryEntry(entry) {
  const attrs = entry.attributes ?? entry; // supports Strapi v4 or v5 response shape
  const img = attrs.image?.data?.attributes ?? attrs.image ?? null;
  return {
    id: entry.id,
    title: attrs.title,
    category: attrs.category,
    caption: attrs.caption,
    image: img,
  };
}

// ----------------------------------------------------------------------------
// CategoryFilter — animated tab bar
// ----------------------------------------------------------------------------
function CategoryFilter({ categories, activeCategory, onChange, counts }) {
  return (
    <div
      role="tablist"
      aria-label="Filter gallery by facility category"
      className="sticky top-0 z-20 -mx-6 flex gap-2 overflow-x-auto bg-[#262f61]/90 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-[#262f61]/75 sm:mx-0 sm:flex-wrap sm:overflow-visible lg:px-0"
    >
      {categories.map((category) => {
        const isActive = category === activeCategory;
        return (
          <button
            key={category}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(category)}
            className={[
              "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F27141]",
              isActive
                ? "border-transparent text-white"
                : "border-white/15 text-gray-300 hover:text-white",
            ].join(" ")}
          >
            {isActive && (
              <motion.span
                layoutId="active-category-pill"
                className="absolute inset-0 rounded-full"
                style={{ background: ACCENT_GRADIENT }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{category}</span>
            {counts?.[category] !== undefined && (
              <span
                className={[
                  "relative z-10 rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  isActive ? "bg-white/20 text-white" : "bg-white/10 text-gray-300",
                ].join(" ")}
              >
                {counts[category]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ----------------------------------------------------------------------------
// GalleryCard — single tile with hover overlay + scale
// ----------------------------------------------------------------------------
function GalleryCard({ item, onOpen, spanVariant }) {
  const aspectByVariant = {
    tall: "aspect-[3/4]",
    short: "aspect-[4/3]",
    regular: "aspect-square",
  };

  return (
    <motion.button
      layout
      layoutId={`card-${item.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onClick={() => onOpen(item)}
      className={[
        "group relative w-full overflow-hidden rounded-3xl bg-white/[0.06] text-left shadow-lg outline-none transition-all duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[#F27141] focus-visible:ring-offset-2 focus-visible:ring-offset-[#262f61]",
        "border border-white/15",
        aspectByVariant[spanVariant],
      ].join(" ")}
      aria-label={`Open ${item.title} in full view`}
    >
      <img
        src={getStrapiImageUrl(item.image, "medium")}
        alt={item.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
      />

      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#161c3f]/95 via-[#161c3f]/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
        <div className="translate-y-3 p-4 transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
            style={{ background: ACCENT_GRADIENT }}
          >
            {item.category}
          </span>
          <h3 className="mt-2 text-sm font-semibold leading-snug text-white">{item.title}</h3>
        </div>
      </div>

      <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
        <Search className="h-4 w-4 text-[#262f61]" aria-hidden="true" />
      </div>
    </motion.button>
  );
}

// ----------------------------------------------------------------------------
// GallerySkeleton — loading placeholder
// ----------------------------------------------------------------------------
function GallerySkeleton({ count = 8, label }) {
  const aspects = ["aspect-square", "aspect-[3/4]", "aspect-[4/3]"];
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      role="status"
      aria-label={label}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] ${aspects[i % aspects.length]}`}
        >
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}

// ----------------------------------------------------------------------------
// EmptyState — shown when a filtered category has no images
// ----------------------------------------------------------------------------
function EmptyState({ category, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/[0.04] px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
        <ImageOff className="h-6 w-6 text-gray-300" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">
        {title} {category}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-gray-300">{description}</p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// LightboxModal — accessible full-screen modal with keyboard + button nav
// ----------------------------------------------------------------------------
function LightboxModal({ items, activeIndex, onClose, onNavigate }) {
  const closeButtonRef = useRef(null);
  const isOpen = activeIndex !== null;
  const item = isOpen ? items[activeIndex] : null;

  const goPrev = useCallback(() => {
    if (activeIndex === null) return;
    onNavigate((activeIndex - 1 + items.length) % items.length);
  }, [activeIndex, items.length, onNavigate]);

  const goNext = useCallback(() => {
    if (activeIndex === null) return;
    onNavigate((activeIndex + 1) % items.length);
  }, [activeIndex, items.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, goPrev, goNext, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#161c3f]/95 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} — full view`}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F27141] sm:right-6 sm:top-6"
            aria-label="Close full view"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          {items.length > 1 && (
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F27141] sm:left-6"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
          )}

          {items.length > 1 && (
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F27141] sm:right-6"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          )}

          <motion.div
            key={item.id}
            layoutId={`card-${item.id}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex max-h-full w-full max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex max-h-[70vh] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <img
                src={getStrapiImageUrl(item.image, "large")}
                alt={item.title}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            <div className="mt-5 flex w-full flex-col items-center gap-2 text-center">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
                style={{ background: ACCENT_GRADIENT }}
              >
                {item.category}
              </span>
              <h2 className="text-lg font-semibold text-white sm:text-xl">{item.title}</h2>
              {item.caption && (
                <p className="max-w-2xl text-sm text-gray-300">{item.caption}</p>
              )}
              <span className="text-xs text-gray-400">
                {activeIndex + 1} / {items.length}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ----------------------------------------------------------------------------
// GalleryPage — main exported component
// ----------------------------------------------------------------------------
export default function GalleryPage() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const t = translations[language].galleryPage;

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(t.filters.all);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchGallery() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/gallery-items?populate=*&locale=${language}&pagination[pageSize]=100&sort=createdAt:desc`
        );
        const json = await res.json();
        const raw = json.data ?? [];
        if (!cancelled) setItems(raw.map(normalizeGalleryEntry));
      } catch (err) {
        console.error("Error fetching gallery items:", err);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchGallery();
    return () => {
      cancelled = true;
    };
  }, [language]);

  // Reset the active filter whenever the language changes, since category
  // labels come translated from Strapi and won't match the previous locale.
  useEffect(() => {
    setActiveCategory(t.filters.all);
  }, [language, t.filters.all]);

  const categories = useMemo(() => {
    const unique = [];
    for (const item of items) {
      if (item.category && !unique.includes(item.category)) unique.push(item.category);
    }
    return [t.filters.all, ...unique];
  }, [items, t.filters.all]);

  const filteredItems = useMemo(() => {
    if (activeCategory === t.filters.all) return items;
    return items.filter((item) => item.category === activeCategory);
  }, [items, activeCategory, t.filters.all]);

  const countsByCategory = useMemo(() => {
    const counts = { [t.filters.all]: items.length };
    for (const item of items) counts[item.category] = (counts[item.category] ?? 0) + 1;
    return counts;
  }, [items, t.filters.all]);

  function handleOpenItem(item) {
    const index = filteredItems.findIndex((i) => i.id === item.id);
    if (index !== -1) setLightboxIndex(index);
  }

  function getSpanVariant(id) {
    const r = id % 5;
    if (r === 0) return "tall";
    if (r === 3) return "short";
    return "regular";
  }

  return (
    <section
      className="relative min-h-screen overflow-hidden pb-24 pt-32"
      style={{ background: "linear-gradient(to bottom right, #262f61, #2D3B76)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Pattern />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-300">
            <li className="flex items-center gap-1.5">
              <a href="/" className="transition-colors hover:text-[#F27141]">
                {t.breadcrumbHome}
              </a>
              <ChevronRight className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
            </li>
            <li className="font-medium text-white">{t.breadcrumbGallery}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-12 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t.header.title}
          </h1>
          <div className="pt-4">
            <span
              className="block h-1 w-24 rounded-full sm:h-[5px]"
              style={{ background: ACCENT_GRADIENT }}
            />
          </div>
          <p className="mt-6 text-base text-gray-200 sm:text-lg">{t.header.description}</p>
        </div>

        {/* Filters + Grid */}
        {!isLoading && items.length > 0 && (
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
            counts={countsByCategory}
          />
        )}

        <div className="mt-8">
          {isLoading ? (
            <GallerySkeleton count={8} label={t.loading.title} />
          ) : filteredItems.length === 0 ? (
            <EmptyState
              category={activeCategory}
              title={t.emptyState.titlePrefix}
              description={t.emptyState.description}
            />
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <GalleryCard
                    key={item.id}
                    item={item}
                    onOpen={handleOpenItem}
                    spanVariant={getSpanVariant(item.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <LightboxModal
        items={filteredItems}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </section>
  );
}
