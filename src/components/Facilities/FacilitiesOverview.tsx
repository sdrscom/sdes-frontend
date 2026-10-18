import React, { useEffect, useRef, useState } from "react";
import {
  Warehouse,
  Container,
  Snowflake,
  Droplet,
  Truck,
  Package,
  Boxes,
  Building2,
  ArrowRightLeft,
  LayoutGrid,
  ClipboardCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Pattern from "../../components/Pattern/Pattern";
import GradientButton from "../../ui/GradientButton";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import { useMedia } from "../../cms/useMedia";
import type { FacilityContent } from "../../locales/translations";

type IconComponent = LucideIcon;

interface Facility {
  icon: IconComponent;
  name: string;
  area?: number;
  image: string;
}

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  unit?: string;
}

// CMS fields are free text ("12,000 m²"); blank means "don't show".
const toCount = (value: string) => {
  const n = Number(String(value || "").replace(/[^\d.]/g, ""));
  return value && Number.isFinite(n) && n > 0 ? n : undefined;
};

const FacilitiesOverview: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const media = useMedia();

  const heroImage = media("facilities.heroImage");
  const heroTitle = t("facilities.heroTitle");
  const heroDescription = t("facilities.heroDescription");
  const totalArea = toCount(t("facilities.totalArea"));
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [heroAnimated, setHeroAnimated] = useState<boolean>(false);

  const statsRef = useRef<HTMLDivElement>(null);

  const iconMap: { [key: string]: IconComponent } = {
    "Closed Warehouses": Warehouse,
    "المستودعات المغلقة": Warehouse,
    "AutoZone Area": Package,
    "منطقة المركبات": Package,
    "Shed Area": Boxes,
    "منطقة الهنغارات": Boxes,
    "Cold Chamber": Snowflake,
    "الغرفة الباردة": Snowflake,
    "Chemical Storage Area": Droplet,
    "تخزين المواد الكيميائية": Droplet,
    "Containers Stacking Area": Container,
    "رصّ الحاويات": Container,
    "Transit Area": ArrowRightLeft,
    "منطقة العبور": ArrowRightLeft,
    "Inspection Shed Area": ClipboardCheck,
    "منطقة التفتيش": ClipboardCheck,
    "Truck Parking Area": Truck,
    "مواقف الشاحنات": Truck,
    "Multipurpose Area": LayoutGrid,
    "منطقة متعددة الاستخدامات": LayoutGrid,
  };

  const toFacilities = (key: string): Facility[] => {
    const items = t(key, { returnObjects: true });
    if (!Array.isArray(items)) return [];
    return (items as FacilityContent[])
      .filter((item) => item?.name)
      .map((item) => ({
        icon: iconMap[item.name.trim()] || Building2,
        name: item.name.trim(),
        area: toCount(item.area),
        image: item.image || "",
      }));
  };

  // [category title key, facilities] for the two cards.
  const categories: [string, Facility[]][] = [
    ["storageSpecialized", toFacilities("facilities.storageItems")],
    ["operationsSupport", toFacilities("facilities.operationsItems")],
  ];

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

  const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    end,
    duration = 2000,
    unit = "",
  }) => {
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
      if (!isVisible) return;

      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);

        setCount(Math.floor(eased * end));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(animate);
    }, [isVisible, end, duration]);

    const formattedNumber = count.toLocaleString(
      language === "ar" ? "ar-EG" : "en-US"
    );

    return (
      <span className="font-semibold inline-block">
        {formattedNumber}
        {unit}
      </span>
    );
  };

  return (
    <section className="min-h-screen bg-mainBg">
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

        <div className="relative mx-auto px-6 text-center max-w-5xl">
          <h1
            className={`text-4xl md:text-5xl font-bold mb-6 mx-auto transition-all duration-1000 ease-out ${
              heroAnimated
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
            style={{
              color: "#FFFFFF",
              transitionDelay: "200ms",
              whiteSpace: "pre-line",
              maxWidth: "600px",
            }}
          >
            {heroTitle}
          </h1>
          <p
            className={`text-xl max-w-3xl mx-auto mb-8 transition-all duration-800 ease-out ${
              heroAnimated
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ color: "#E8EAED", transitionDelay: "400ms" }}
          >
            {heroDescription}
          </p>
          <div
            className={`flex gap-4 justify-center flex-wrap transition-all duration-600 ease-out ${
              heroAnimated
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <GradientButton to="/location">
              {t("facilities.cta")}
            </GradientButton>
          </div>
        </div>
      </div>

      <div className="mx-auto sm:px-20 -mt-32 lg:-mt-48 relative z-20 mb-16 px-4">
        <Pattern />
        <div
          className="rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 relative overflow-hidden shadow-2xl backdrop-blur-xl"
          style={{
            background: "rgba(38, 47, 97, 0.3)",
            border: "2px solid rgba(242, 113, 65, 0.4)",
            boxShadow:
              "0 25px 50px -12px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.05),0 0 80px rgba(242,113,65,0.15)",
          }}
        >
          <Pattern />
          <div className="relative z-10 flex flex-col items-center text-center gap-6 md:gap-8">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  background: "rgba(242, 113, 65, 0.2)",
                  animationDuration: "3s",
                }}
              />
              <div
                className="relative p-4 sm:p-5 md:p-6 rounded-full"
                style={{
                  background: "rgba(242, 113, 65, 0.15)",
                  border: "2px solid rgba(242, 113, 65, 0.4)",
                }}
              >
                <Building2
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                  strokeWidth={1.5}
                  color="#F27141"
                />
              </div>
            </div>
            <div className="w-full max-w-full overflow-hidden">
              <h2
                className="text-lg sm:text-xl md:text-2xl font-medium mb-3 md:mb-4 tracking-widest uppercase px-2"
                style={{ color: "#E8EAED" }}
              >
                {t("facilities.totalAreaTitle")}
              </h2>
              <div
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6"
                style={{
                  background:
                    "linear-gradient(135deg, #F27141 0%, #B82227 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 4px 20px rgba(242,113,65,0.3))",
                }}
              >
                <span className="inline-block whitespace-nowrap">
                  {isVisible ? (
                    <AnimatedCounter
                      end={totalArea ?? 0}
                      unit={language === "ar" ? " م²" : "m²"}
                      duration={2500}
                    />
                  ) : (
                    `0 ${language === "ar" ? "م²" : "m²"}`
                  )}
                </span>
              </div>
              <div
                className="flex flex-col md:flex-row gap-3 md:gap-8 justify-center items-center text-sm sm:text-base md:text-lg px-2"
                style={{ color: "#B8BFCC" }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#F27141" }}
                  />
                  <span>{t("facilities.worldClass")}</span>
                </div>
                <div
                  className="hidden md:block w-px h-6"
                  style={{ background: "rgba(242,113,65,0.3)" }}
                />
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#B82227" }}
                  />
                  <span>{t("facilities.strategicLocation")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={statsRef}
        className="relative max-w-7xl mx-auto pb-24 px-6 sm:px-10 md:px-20 z-10"
      >
        <Pattern />
        <h3
          className={`text-4xl md:text-5xl font-extrabold mb-16 text-center transition-all duration-700 text-white relative ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {t("facilities.sectionTitle")}
          <div className="pt-5">
            <span
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 sm:h-[5px] w-1/3 rounded shadow-lg opacity-70"
              style={{
                background:
                  language === "ar"
                    ? "linear-gradient(to left, #F27141, #B82227)"
                    : "linear-gradient(to right, #F27141, #B82227)",
              }}
            />
            <span
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 sm:h-[5px] w-1/3 rounded-full blur-sm opacity-70"
              style={{
                background:
                  language === "ar"
                    ? "linear-gradient(to left, #F27141, #B82227)"
                    : "linear-gradient(to right, #F27141, #B82227)",
              }}
            />
          </div>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
          {categories.map(
            ([categoryKey, categoryFacilities], catIndex) => {
              return (
                <div
                  key={catIndex}
                  className="relative rounded-3xl p-10 shadow-lg border border-[rgba(255,255,255,0.08)] overflow-hidden backdrop-blur-xl"
                  style={{ background: "rgba(38,47,97,0.25)" }}
                >
                  <div className="absolute inset-0 opacity-[0.08]">
                    <Pattern />
                  </div>
                  <h4 className="relative text-2xl font-bold mb-8 text-center text-white tracking-wide z-10">
                    {t(`facilities.categories.${categoryKey}`)}
                  </h4>

                  <div className="relative z-10 grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {categoryFacilities.map((facility, index, arr) => {
                      const Icon = facility.icon;
                      const isLast = index === arr.length - 1;
                      const facilityImage = facility.image;

                      return (
                        <div
                          key={index}
                          className={`relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 h-full flex flex-col ${
                            isVisible
                              ? "opacity-100 translate-y-0 scale-100"
                              : "opacity-0 translate-y-8 scale-95"
                          } ${
                            isLast && arr.length % 2 !== 0
                              ? "lg:col-span-2"
                              : ""
                          }`}
                          style={{
                            transitionDelay: `${index * 100}ms`,
                            background:
                              "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,248,252,1) 100%)",
                          }}
                        >
                          {facilityImage && (
                            <div className="relative h-48 lg:h-64 overflow-hidden">
                              <img
                                src={facilityImage}
                                alt={facility.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30" />
                              <div
                                className={`absolute bottom-4 p-4 rounded-full shadow-2xl ${
                                  language === "ar" ? "left-4" : "right-4"
                                }`}
                                style={{
                                  background:
                                    "linear-gradient(135deg, #F27141 0%, #B82227 100%)",
                                }}
                              >
                                <Icon
                                  size={36}
                                  className="text-white"
                                  strokeWidth={1.8}
                                />
                              </div>
                            </div>
                          )}

                          <div
                            className={`flex-1 p-6 flex flex-col justify-center items-center text-center ${
                              !facilityImage ? "rounded-2xl" : ""
                            } bg-white`}
                          >
                            <h3
                              className="text-base sm:text-lg font-bold mb-4 leading-tight px-4 hyphens-auto break-words"
                              style={{ color: "#2D3B76" }}
                              lang={language}
                            >
                              {facility.name}
                            </h3>

                            {facility.area !== undefined && (
                              <div
                                className="text-3xl sm:text-4xl font-bold mb-4"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #F27141 0%, #B82227 100%)",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                }}
                              >
                                {isVisible ? (
                                  <AnimatedCounter
                                    end={facility.area}
                                    unit={language === "ar" ? " م²" : "m²"}
                                    duration={2000}
                                  />
                                ) : (
                                  "0"
                                )}
                              </div>
                            )}

                            <div
                              className="h-1 rounded-full"
                              style={{
                                width: "60px",
                                background:
                                  language === "ar"
                                    ? "linear-gradient(to left, #F27141, #B82227)"
                                    : "linear-gradient(to right, #F27141, #B82227)",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
};

export default FacilitiesOverview;
