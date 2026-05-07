import { useEffect, useState, useRef } from "react";
import { Container, Warehouse, Car, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import Pattern from "../../components/Pattern/Pattern";
// import GradientButton from "../../ui/GradientButton";

const ServicesHero = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [visible, setIsVisible] = useState(false);
  const [heroAnimated, setHeroAnimated] = useState<boolean>(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const [heroImage, setHeroImage] = useState<string>("");
  const [heroTitle, setHeroTitle] = useState<string>(
    "Comprehensive Logistics & Bonded Zone Solutions"
  );
  const [heroDescription, setHeroDescription] = useState<string>(
    "From terminal shuttling and cargo handling to customs clearance, vehicle inspection, and value-added distribution — SDES delivers seamless logistics inside the bonded zone."
  );

  const toArabicNumber = (num: string): string => {
    if (language !== "ar") return num;

    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num
      .split("")
      .map((char) => {
        if (char >= "0" && char <= "9") {
          return arabicNumbers[parseInt(char)];
        }
        return char;
      })
      .join("");
  };

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/services-text-collections?populate=*&locale=${language}`
        );
        const data = await res.json();

        const content = data?.data?.[0];

        if (content?.ServicesHeroTitle) {
          setHeroTitle(content.ServicesHeroTitle);
        }

        if (content?.servicesHeroDescription) {
          setHeroDescription(content.servicesHeroDescription);
        }
      } catch (err) {
        console.error("Error fetching hero content:", err);
      }
    };

    fetchHeroContent();
  }, [API_URL, language]);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch(`${API_URL}/api/services-hero?populate=*`);
        const data = await res.json();

        const img = data?.data?.servicesHero;

        const imageUrl = img?.formats?.large?.url || img?.url;

        const fullUrl = imageUrl?.startsWith("http")
          ? imageUrl
          : `${API_URL}${imageUrl}`;

        setHeroImage(fullUrl);
      } catch (err) {
        console.error("Error fetching hero image:", err);
      }
    };

    fetchHero();
  }, [API_URL]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setHeroAnimated(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.01, rootMargin: "200px" }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const serviceIcons = [
    {
      Icon: Container,
      size: 100,
      color: "#F27141",
      position: "top-0 left-1/2 -translate-x-1/2",
      animation: "animate-float-slow",
    },
    {
      Icon: Truck,
      size: 80,
      color: "#B82227",
      position: "bottom-6 right-6",
      animation: "animate-float-medium",
    },
    {
      Icon: Car,
      size: 75,
      color: "#2D3B76",
      position: "top-10 left-6",
      animation: "animate-float-fast",
    },
    {
      Icon: Warehouse,
      size: 76,
      color: "#E8EAED",
      position: "bottom-10 left-10",
      animation: "animate-float-slow",
    },
  ];

  const serviceHighlights = [
    { key: "containerCargo", color: "#F27141" },
    { key: "vehicleServices", color: "#B82227" },
    { key: "freightCustoms", color: "#F27141" },
    { key: "tradeDistribution", color: "#B82227" },
  ];

  return (
    <section className="min-h-screen bg-mainBg">
      <div
        className="bg-cover bg-center pt-28 pb-44 lg:py-28 relative overflow-hidden flex items-center justify-center min-h-screen bg-[#1a2347]"
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

        <div className="relative z-10 flex flex-col-reverse lg:grid lg:grid-cols-2 items-center gap-10 px-5 max-w-7xl mx-auto text-center lg:text-start">
          <div
            className={`transition-all duration-1000 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            } w-full`}
            dir={language === "ar" ? "rtl" : "ltr"}
          >
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

            <p className="mt-6 text-sm sm:text-base md:text-lg text-[#E8EAED] leading-relaxed max-w-xl mx-auto lg:mx-0 text-start">
              {heroDescription}
            </p>

            <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 text-[#E8EAED] text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-[#B82227]">
                  {t("servicesHero.stats.onSite")}
                </span>
                <span>{t("servicesHero.stats.customsFacilities")}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-[#F27141]">
                  {toArabicNumber(t("servicesHero.stats.available"))}
                </span>
                <span>{t("servicesHero.stats.zoneOperations")}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-[#F27141]">
                  {toArabicNumber(t("servicesHero.stats.divisions"))}
                </span>
                <span>{t("servicesHero.stats.specializedDivisions")}</span>
              </div>
            </div>

            {/* <div className="my-10 flex flex-col items-center lg:items-start">
              <GradientButton
                onClick={() => {
                  const element = document.getElementById("services-section");
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
              >
                {t("servicesHero.cta")}
              </GradientButton>
            </div> */}
          </div>

          <div
            className={`relative hidden lg:flex justify-center items-center transition-all duration-1000 delay-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            } w-full`}
          >
            <div className="relative w-[320px] h-[320px] xl:w-[380px] xl:h-[380px]">
              {serviceIcons.map(
                ({ Icon, size, color, position, animation }, i) => (
                  <div key={i} className={`absolute ${position} ${animation}`}>
                    <Icon size={size} strokeWidth={1.4} color={color} />
                  </div>
                )
              )}
              <div className="absolute inset-0 rounded-full blur-3xl bg-gradient-to-tr from-[#F27141]/20 to-[#B82227]/20 animate-pulse-slow" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 sm:bottom-6 w-full flex justify-center px-3">
          <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-3 bg-[rgba(38,47,97,0.55)] backdrop-blur-md rounded-2xl px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4 border border-[rgba(242,113,65,0.25)] shadow-lg w-[95%] sm:w-[90%] max-w-6xl">
            {serviceHighlights.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[#E8EAED] text-xs sm:text-sm whitespace-nowrap"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>{t(`servicesHero.highlights.${item.key}`)}</span>
              </div>
            ))}
          </div>
        </div>

        <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-slow { animation: float 6s ease-in-out infinite; }
        .animate-float-medium { animation: float 8s ease-in-out infinite; }
        .animate-float-fast { animation: float 10s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 12s ease-in-out infinite; }
      `}</style>
      </div>
    </section>
  );
};

export default ServicesHero;
