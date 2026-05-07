import { useEffect, useState } from "react";
import Pattern from "../Pattern/Pattern";
// import GradientButton from "../../ui/GradientButton";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

const InvestmentHero = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const API_URL = import.meta.env.VITE_API_URL;

  const [visible, setIsVisible] = useState(false);
  const [heroAnimated, setHeroAnimated] = useState(false);

  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  const [heroTitle, setHeroTitle] = useState("");
  const [heroDescription, setHeroDescription] = useState("");

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/overview-hero?populate=*`);
        const data = await res.json();
        const imagesData = data?.data?.overviewImages;

        const imgs =
          imagesData?.map((img: any) => {
            const url = img?.url || img?.formats?.large?.url;
            return url?.startsWith("http") ? url : `${API_URL}${url}`;
          }) || [];

        setBackgrounds(imgs);
      } catch (error) {
        console.error("Error loading images", error);
      }
    };

    fetchImages();
  }, [API_URL]);

  useEffect(() => {
    const fetchTextContent = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/overview-text-collections?locale=${language}&populate=*`
        );
        const data = await res.json();
        const textData = data?.data?.[0];

        setHeroTitle(textData?.OverViewTitle || "");
        setHeroDescription(textData?.OverViewHeroDescription || "");
      } catch (error) {
        console.error("Error loading text content", error);
      }
    };

    fetchTextContent();
  }, [API_URL, language]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => setHeroAnimated(true), []);

  useEffect(() => {
    if (backgrounds.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % backgrounds.length);
      setAnimationKey((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [backgrounds]);

  const microStatsHighlights = [
    { key: "operator", color: "#B82227" },
    { key: "ownership", color: "#F27141" },
    { key: "gateway", color: "#B82227" },
    { key: "vision", color: "#F27141" },
  ];

  return (
    <section className="min-h-screen">
      <style>{`
        .animate-slow-zoom {
          animation: slowZoom 4s ease-out forwards;
        }
        @keyframes slowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.03); }
        }
      `}</style>

      <div className="relative pt-28 pb-44 lg:py-28 overflow-hidden min-h-screen">
        {backgrounds.map((bg, index) => (
          <div
            key={`${index}-${animationKey}`}
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
              index === currentIndex
                ? "opacity-100 animate-slow-zoom"
                : "opacity-0"
            }`}
          />
        ))}

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(26,35,71,0.9), rgba(38,47,97,0.3))",
          }}
        />

        <Pattern />

        {/* Content moved to top */}
        <div
          dir={language === "ar" ? "rtl" : "ltr"}
          className={`absolute top-32 sm:top-36 md:top-40 left-0 right-0 z-10 px-5 max-w-7xl mx-auto
            ${
              language === "ar"
                ? "text-right lg:text-right"
                : "text-center lg:text-left"
            }`}
        >
          <div
            className={`transition-all duration-1000 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            } w-full lg:w-1/2`}
          >
            <h1
              className={`text-4xl md:text-5xl font-bold mb-6 transition-all duration-1000 ease-out text-white ${
                heroAnimated
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              {heroTitle || t("investment.title")}
            </h1>

            <p className="mt-6 text-sm sm:text-base md:text-lg text-[#E8EAED] leading-relaxed max-w-xl lg:mx-0">
              {heroDescription || t("investment.description")}
            </p>
          </div>
        </div>

        {/* Highlights at bottom */}
        <div className="absolute bottom-4 sm:bottom-6 w-full flex justify-center px-3">
          <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-3 bg-[rgba(38,47,97,0.55)] backdrop-blur-md rounded-2xl px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4 border border-[rgba(242,113,65,0.25)] shadow-lg w-[95%] sm:w-[90%] max-w-6xl">
            {microStatsHighlights.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[#E8EAED] text-xs sm:text-sm whitespace-nowrap"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium">
                  {t(`investment.highlights.${item.key}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestmentHero;
