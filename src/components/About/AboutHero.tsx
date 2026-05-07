import React, { useEffect, useState } from "react";
import { Target, TrendingUp } from "lucide-react";

import Pattern from "../../components/Pattern/Pattern";
import GradientButton from "../../ui/GradientButton";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../locales/translations";

const AboutHero: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { language } = useLanguage();

  const t = (key: string) => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  const [visible, setIsVisible] = useState(false);
  const [heroAnimated, setHeroAnimated] = useState(false);
  const [heroImage, setHeroImage] = useState<string>("");
  const [heroTitle, setHeroTitle] = useState<string>("");
  const [heroDescription, setHeroDescription] = useState<string>("");

  const isRTL = language === "ar";

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/about-text-collections?populate=*&locale=${language}`
        );
        const data = await res.json();

        const content = data?.data?.[0];

        if (content?.AboutHeroTitle) {
          setHeroTitle(content.AboutHeroTitle);
        } else {
          setHeroTitle(t("aboutHero.title"));
        }

        if (content?.AboutHeroDescription) {
          setHeroDescription(content.AboutHeroDescription);
        } else {
          setHeroDescription(t("aboutHero.description"));
        }
      } catch (err) {
        console.error("Error fetching hero content:", err);
        setHeroTitle(t("aboutHero.title"));
        setHeroDescription(t("aboutHero.description"));
      }
    };

    fetchHeroContent();
  }, [API_URL, language]);

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const res = await fetch(`${API_URL}/api/about-us-hero?populate=*`);
        const data = await res.json();

        const imageUrl =
          data?.data?.aboutHero?.url ||
          data?.data?.aboutHero?.formats?.large?.url ||
          "";

        const fullUrl = imageUrl?.startsWith("http")
          ? imageUrl
          : `${API_URL}${imageUrl}`;

        setHeroImage(fullUrl);
      } catch (error) {
        console.error("Error loading hero image", error);
      }
    };

    fetchHeroImage();
  }, [API_URL]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setHeroAnimated(true);
  }, []);

  const microStatsHighlights = [
    { text: t("aboutHero.microStats.established"), color: "#B82227" },
    { text: t("aboutHero.microStats.portDistance"), color: "#F27141" },
    { text: t("aboutHero.microStats.integrated"), color: "#B82227" },
    { text: t("aboutHero.microStats.visionSupported"), color: "#F27141" },
  ];

  return (
    <section className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      <div
        className="bg-cover bg-center pt-28 pb-44 lg:py-28 relative overflow-hidden flex items-center justify-center min-h-screen"
        style={{
          backgroundImage: heroImage ? `url(${heroImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(26,35,71,0.6), rgba(38,47,97,0.3))",
          }}
        />
        <Pattern />

        <div
          className={`relative z-10 flex flex-col lg:grid lg:grid-cols-2 items-center gap-16 px-5 max-w-7xl mx-auto text-center lg:${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          <div
            className={`transition-all duration-1000 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            } w-full`}
          >
            {/* <p
              className="text-base sm:text-lg font-bold mb-2 uppercase"
              style={{ color: "#B82227" }}
            >
              {t("aboutHero.subtitle")}
            </p> */}

            <h1
              className={`text-4xl md:text-5xl font-bold mb-6 transition-all duration-1000 ease-out leading-tight ${
                heroAnimated
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{
                color: "#FFFFFF",
                transitionDelay: "200ms",
                whiteSpace: "pre-line",
              }}
            >
              {heroTitle}
            </h1>

            <p
              className={`mt-6 text-sm sm:text-base md:text-lg text-[#E8EAED] leading-relaxed max-w-xl ${
                isRTL ? "lg:mr-0 mx-auto" : "lg:ml-0 mx-auto"
              }`}
            >
              {heroDescription}
            </p>

            <div
              className={`my-10 flex flex-col items-center ${
                isRTL ? "lg:items-start" : "lg:items-start"
              }`}
            >
              <GradientButton to="#ceo-message">
                {t("aboutHero.cta")}
              </GradientButton>
            </div>
          </div>

          <div className="w-full lg:mt-0">
            <div
              className={`space-y-8 transition-all duration-1000 ${
                heroAnimated
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <div
                className="p-6 rounded-xl shadow-xl backdrop-blur-sm"
                style={{
                  backgroundColor: "rgba(38, 47, 97, 0.85)",
                  borderLeft: isRTL ? "none" : "4px solid #F27141",
                  borderRight: isRTL ? "4px solid #F27141" : "none",
                }}
              >
                <div className="flex items-start mb-3">
                  <Target
                    size={24}
                    className={`text-[#F27141] ${
                      isRTL ? "ml-3" : "mr-3"
                    } mt-1 flex-shrink-0`}
                  />
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                    {t("aboutHero.missionVision.missionTitle")}
                  </h3>
                </div>
                <p className="text-base text-gray-300">
                  {t("aboutHero.missionVision.mission")}
                </p>
              </div>

              <div
                className="p-6 rounded-xl shadow-xl backdrop-blur-sm"
                style={{
                  backgroundColor: "rgba(38, 47, 97, 0.85)",
                  borderLeft: isRTL ? "none" : "4px solid #B82227",
                  borderRight: isRTL ? "4px solid #B82227" : "none",
                }}
              >
                <div className="flex items-start mb-3">
                  <TrendingUp
                    size={24}
                    className={`text-[#B82227] ${
                      isRTL ? "ml-3" : "mr-3"
                    } mt-1 flex-shrink-0`}
                  />
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                    {t("aboutHero.missionVision.visionTitle")}
                  </h3>
                </div>
                <p className="text-base text-gray-300">
                  {t("aboutHero.missionVision.vision")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 sm:bottom-6 w-full flex justify-center px-3">
          <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-3 bg-[rgba(38,47,97,0.55)] backdrop-blur-md rounded-2xl px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4 border border-[rgba(242,113,65,0.25)] shadow-lg w-[95%] sm:w-[90%] max-w-6xl">
            {microStatsHighlights.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[#E8EAED] text-xs sm:text-sm whitespace-nowrap"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
