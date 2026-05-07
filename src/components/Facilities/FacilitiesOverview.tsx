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
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

type IconComponent = LucideIcon;

interface Facility {
  icon: IconComponent;
  name: string;
  area: number;
  image: string;
}

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  unit?: string;
}

const FacilitiesOverview: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const API_URL = import.meta.env.VITE_API_URL;

  const [heroImage, setHeroImage] = useState<string>("");
  const [heroTitle, setHeroTitle] = useState<string>("");
  const [heroDescription, setHeroDescription] = useState<string>("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [storageImages, setStorageImages] = useState<{ [key: string]: string }>(
    {}
  );
  const [operationsImages, setOperationsImages] = useState<{
    [key: string]: string;
  }>({});
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

  const categoryMap: {
    [key: string]: "Storage" | "Specialized" | "Operations" | "Support";
  } = {
    "Closed Warehouses": "Storage",
    "المستودعات المغلقة": "Storage",
    "AutoZone Area": "Storage",
    "منطقة المركبات": "Storage",
    "Shed Area": "Storage",
    "منطقة الهنغارات": "Storage",
    "Cold Chamber": "Specialized",
    "الغرفة الباردة": "Specialized",
    "Chemical Storage Area": "Specialized",
    "تخزين المواد الكيميائية": "Specialized",
    "Containers Stacking Area": "Operations",
    "رصّ الحاويات": "Operations",
    "Transit Area": "Operations",
    "منطقة العبور": "Operations",
    "Inspection Shed Area": "Operations",
    "منطقة التفتيش": "Operations",
    "Truck Parking Area": "Support",
    "مواقف الشاحنات": "Support",
    "Multipurpose Area": "Support",
    "منطقة متعددة الاستخدامات": "Support",
  };

  const imageNameMap: { [key: string]: string } = {
    "المستودعات المغلقة": "Closed Warehouses",
    "منطقة المركبات": "AutoZone Area",
    "منطقة الهنغارات": "Shed Area",
    "الغرفة الباردة": "Cold Chamber",
    "تخزين المواد الكيميائية": "Chemical Storage Area",
    "رصّ الحاويات": "Containers Stacking Area",
    "منطقة العبور": "Transit Area",
    "منطقة التفتيش": "Inspection Shed Area",
    "مواقف الشاحنات": "Truck Parking Area",
    "منطقة متعددة الاستخدامات": "Multipurpose Area",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/facilities-text-collections?populate=*&locale=en`
        );

        const data = response.data.data[0];
        if (!data) return;

        const arabicData = data.localizations?.find(
          (loc: any) => loc.locale === "ar"
        );

        if (language === "ar" && arabicData) {
          setHeroTitle(arabicData.FacilitiesHeroTitle);
          setHeroDescription(arabicData.FacilitiesHeroDescription);

          if (arabicData.FacilitiesNumbers) {
            const blocks = arabicData.FacilitiesNumbers.trim().split("\n\n");
            const facilitiesList: Facility[] = blocks.map((block: string) => {
              const [name, area] = block.split("\n");
              return {
                icon: iconMap[name.trim()],
                name: name.trim(),
                area: parseInt(area.replace(/[^\d]/g, ""), 10),
                image: "",
              };
            });
            setFacilities(facilitiesList);
          }
        } else {
          setHeroTitle(data.FacilitiesHeroTitle);
          setHeroDescription(data.FacilitiesHeroDescription);

          if (data.FacilitiesNumbers) {
            const blocks = data.FacilitiesNumbers.trim().split("\n\n");
            const facilitiesList: Facility[] = blocks.map((block: string) => {
              const [name, area] = block.split("\n");
              return {
                icon: iconMap[name.trim()],
                name: name.trim(),
                area: parseInt(area.replace(/[^\d]/g, ""), 10),
                image: "",
              };
            });
            setFacilities(facilitiesList);
          }
        }

        if (data.StorageSpecializedImages) {
          const images: { [key: string]: string } = {};
          data.StorageSpecializedImages.forEach((img: any) => {
            let name = img.name.replace(/\.(png|jpg|jpeg)$/i, "");
            if (name === "Auto Zone") name = "AutoZone Area";
            const url =
              img.formats?.large?.url || img.formats?.medium?.url || img.url;
            const fullUrl = url?.startsWith("http") ? url : `${API_URL}${url}`;
            images[name] = fullUrl;
          });
          setStorageImages(images);
        }

        if (data.OperationsSupportImages) {
          const images: { [key: string]: string } = {};
          data.OperationsSupportImages.forEach((img: any) => {
            let name = img.name.replace(/\.(png|jpg|jpeg)$/i, "");
            if (name === "Transit") name = "Transit Area";
            if (name === "Multipurpose area") name = "Multipurpose Area";
            const url =
              img.formats?.large?.url || img.formats?.medium?.url || img.url;
            const fullUrl = url?.startsWith("http") ? url : `${API_URL}${url}`;
            images[name] = fullUrl;
          });
          setOperationsImages(images);
        }
      } catch (error) {
        console.error("Error fetching facilities data:", error);
      }
    };

    fetchData();
  }, [API_URL, language]);

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/facilities-hero?populate=*`
        );
        const data = response.data.data;
        if (data?.facilitiesHero) {
          const media = data.facilitiesHero;
          const url =
            media.formats?.large?.url ||
            media.formats?.medium?.url ||
            media.url;
          const fullUrl = url?.startsWith("http") ? url : `${API_URL}${url}`;
          setHeroImage(fullUrl);
        }
      } catch (error) {
        console.error("Error fetching hero image:", error);
      }
    };

    fetchHeroImage();
  }, [API_URL]);

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

  const getFacilityImage = (facilityName: string, category: string): string => {
    const englishName =
      language === "ar" ? imageNameMap[facilityName] : facilityName;

    if (category === "Storage" || category === "Specialized") {
      return storageImages[englishName] || "";
    } else {
      return operationsImages[englishName] || "";
    }
  };

  return (
    <section className="min-h-screen bg-mainBg">
      <div
        className="bg-cover bg-center pt-28 pb-44 lg:py-28 relative overflow-hidden flex items-center justify-center min-h-screen"
        style={{
          backgroundImage: `url(${heroImage})`,
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
                      end={351000}
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
          {["Storage & Specialized", "Operations & Support"].map(
            (categoryName, catIndex) => {
              const categoryFacilities = facilities.filter((f) => {
                const category = categoryMap[f.name];
                return categoryName === "Storage & Specialized"
                  ? category === "Storage" || category === "Specialized"
                  : category === "Operations" || category === "Support";
              });

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
                    {t(
                      `facilities.categories.${
                        catIndex === 0
                          ? "storageSpecialized"
                          : "operationsSupport"
                      }`
                    )}
                  </h4>

                  <div className="relative z-10 grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {categoryFacilities.map((facility, index, arr) => {
                      const Icon = facility.icon;
                      const isLast = index === arr.length - 1;
                      const category = categoryMap[facility.name];
                      const facilityImage = getFacilityImage(
                        facility.name,
                        category
                      );

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
