// Applies page text and images edited in the CMS on top of the site's
// built-in content (src/locales/translations.ts).
//
// Components read text either via i18next `t()` or straight from the
// `translations` object, so overrides are written into both. The last
// response is cached so returning visitors see edited text on first paint.
import i18n from "i18next";
import { translations } from "../locales/translations";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type SiteContent = {
  en?: Record<string, Json>;
  ar?: Record<string, Json>;
  media?: Record<string, string>;
};

const API_URL = import.meta.env.VITE_API_URL;
const CACHE_KEY = "sdes_site_content";
const LOCALES = ["en", "ar"] as const;

// Pristine copy so a section reset in the CMS falls back to the default.
const defaults = structuredClone({ en: translations.en, ar: translations.ar });
let media: Record<string, string> = {};

const isPlainObject = (v: unknown): v is Record<string, Json> =>
  !!v && typeof v === "object" && !Array.isArray(v);

// CMS uploads are served from the CMS host as /media/...
function resolveUrls(value: Json): Json {
  if (typeof value === "string") {
    return value.startsWith("/media/") ? `${API_URL}${value}` : value;
  }
  if (Array.isArray(value)) return value.map(resolveUrls);
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveUrls(v)]));
  }
  return value;
}

// Override wins; arrays are replaced wholesale; keys missing from the
// override keep their default.
function merge(base: Json | undefined, over: Json): Json {
  if (isPlainObject(base) && isPlainObject(over)) {
    const out: Record<string, Json> = { ...base };
    for (const [k, v] of Object.entries(over)) out[k] = merge(base[k], v);
    return out;
  }
  return over;
}

function apply(content: SiteContent) {
  for (const locale of LOCALES) {
    const target = translations[locale] as unknown as Record<string, Json>;
    const base = defaults[locale] as unknown as Record<string, Json>;
    const overrides = content[locale] || {};

    for (const section of Object.keys(base)) {
      target[section] =
        section in overrides
          ? merge(structuredClone(base[section]), resolveUrls(overrides[section]))
          : structuredClone(base[section]);
    }
    // Replace rather than deep-merge: i18next merges arrays index by index,
    // which would keep list items that were deleted in the CMS.
    i18n.removeResourceBundle(locale, "translation");
    i18n.addResourceBundle(locale, "translation", target);
  }

  media = {};
  for (const [key, url] of Object.entries(content.media || {})) {
    if (url) media[key] = resolveUrls(url) as string;
  }
}

function readCache(): SiteContent | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as SiteContent) : null;
  } catch {
    return null;
  }
}

function writeCache(content: SiteContent) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(content));
  } catch {
    // Storage full or blocked: the next visit just fetches again.
  }
}

/** Apply the cached content synchronously (call before first render). */
export function applyCachedSiteContent() {
  const cached = readCache();
  if (cached) apply(cached);
}

/** Fetch the latest content from the CMS. Resolves true when it changed what is shown. */
export async function loadSiteContent(): Promise<boolean> {
  if (!API_URL) return false;
  try {
    const res = await fetch(`${API_URL}/api/site-content`, { cache: "no-cache" });
    if (!res.ok) return false;
    const { data } = (await res.json()) as { data: SiteContent };
    const before = JSON.stringify(readCache());
    if (JSON.stringify(data) === before) return false;
    apply(data);
    writeCache(data);
    return true;
  } catch {
    // CMS unreachable: keep the built-in or cached content.
    return false;
  }
}

/** URL for a CMS-replaceable image/video slot, or the bundled fallback. */
export function getMedia(key: string, fallback: string): string;
export function getMedia(key: string, fallback?: string): string | undefined;
export function getMedia(key: string, fallback?: string) {
  return media[key] || fallback;
}
