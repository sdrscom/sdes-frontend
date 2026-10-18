import { useLanguage } from "../context/LanguageContext";
import { getMedia } from "./siteContent";

/**
 * Returns a lookup for CMS-replaceable images: `media("home.heroImage", bundledImg)`.
 * Subscribing to the language context re-renders the caller when CMS content arrives.
 */
export function useMedia() {
  useLanguage();
  return getMedia;
}
