import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Pattern from "../Pattern/Pattern";
import GradientButton from "../../ui/GradientButton";
import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import PrimeLocationImage from "../../assets/Picture3.png";

gsap.registerPlugin(ScrollTrigger);

const API_URL = import.meta.env.VITE_API_URL;

export default function PrimeLocation() {
  const { i18n, t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const [primeText, setPrimeText] = useState("");

  const googleMapsLink =
    "https://www.google.com/maps/@26.4843881,50.1959136,14z";

  useEffect(() => {
    const fetchText = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/home-text-collections?populate=*&locale=${i18n.language}`
        );
        const data = await res.json();

        const rawText = data?.data?.[0]?.PrimeLocation || "";
        setPrimeText(rawText);
      } catch (error) {
        console.error("Error fetching Prime Location text:", error);
      }
    };

    fetchText();
  }, [i18n.language]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (textRef.current) {
      gsap.fromTo(
        Array.from(textRef.current.children),
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.3,
        }
      );
    }

    // Animate map on load
    if (mapRef.current) {
      gsap.fromTo(
        mapRef.current,
        { x: 100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          delay: 0.5,
        }
      );
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: "#262f61" }}
    >
      <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-screen relative z-10 pt-16 sm:pt-20 lg:pt-6">
        {/* Background Pattern */}
        <Pattern />

        {/* Left Side - Text */}
        <div
          ref={textRef}
          className="flex flex-col justify-center items-start p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 2xl:p-20 relative z-10 order-1"
        >
          <h2
            className="relative text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-5 md:mb-6 leading-tight ps-4 sm:ps-5"
            style={{ color: "#FFFFFF" }}
          >
            <span
              className={`absolute top-0 ${
                language === "ar" ? "right-0" : "left-0"
              } w-1 sm:w-[5px] lg:w-[6px] h-full rounded shadow-lg opacity-70`}
              style={{
                background: "linear-gradient(to bottom, #F27141, #B82227)",
              }}
            />
            <span
              className={`absolute top-0 ${
                language === "ar" ? "right-0" : "left-0"
              } w-1 sm:w-[5px] lg:w-[6px] h-full rounded-full blur-sm opacity-70`}
              style={{
                background: "linear-gradient(to bottom, #F27141, #B82227)",
              }}
            />

            {t("primeLocation.title")}

            <div
              className="absolute inset-x-0 -bottom-2 sm:-bottom-3 h-0.5 rounded-full"
              style={{
                backgroundImage:
                  language === "ar"
                    ? "linear-gradient(to left, rgba(242, 113, 65, 0.3), rgba(184, 34, 39, 0.3))"
                    : "linear-gradient(to right, rgba(242, 113, 65, 0.3), rgba(184, 34, 39, 0.3))",
              }}
            />
          </h2>

          <p
            className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-7 md:mb-8 max-w-full lg:max-w-xl font-light"
            style={{ color: "#E8EAED" }}
          >
            {primeText}
          </p>

          <div className="flex flex-wrap gap-2 md:gap-3 mb-6 sm:mb-7 md:mb-8">
            <span
              className="group px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default backdrop-blur-sm"
              style={{
                background:
                  "linear-gradient(to right, rgba(45, 59, 118, 0.3), rgba(255, 255, 255, 0.15))",
                color: "#FFFFFF",
                borderColor: "rgba(74, 85, 120, 0.4)",
              }}
            >
              <span className="flex items-center gap-1.5 md:gap-2">
                <div
                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: "#F27141" }}
                ></div>
                {t("primeLocation.strategic")}
              </span>
            </span>

            <span
              className="group px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default backdrop-blur-sm"
              style={{
                background:
                  "linear-gradient(to right, rgba(242, 113, 65, 0.25), rgba(184, 34, 39, 0.15))",
                color: "#FFFFFF",
                borderColor: "rgba(242, 113, 65, 0.4)",
              }}
            >
              <span className="flex items-center gap-1.5 md:gap-2">
                <div
                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: "#F27141",
                    animationDelay: "300ms",
                  }}
                ></div>
                {t("primeLocation.customs")}
              </span>
            </span>

            <span
              className="group px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default backdrop-blur-sm"
              style={{
                background:
                  "linear-gradient(to right, rgba(184, 34, 39, 0.25), rgba(242, 113, 65, 0.15))",
                color: "#FFFFFF",
                borderColor: "rgba(184, 34, 39, 0.4)",
              }}
            >
              <span className="flex items-center gap-1.5 md:gap-2">
                <div
                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: "#B82227",
                    animationDelay: "500ms",
                  }}
                ></div>
                {t("primeLocation.distribution")}
              </span>
            </span>
          </div>

          {/* CTA Button */}
          <GradientButton to="/location">
            {t("primeLocation.learnMore")}
          </GradientButton>
        </div>

        {/* Right Side - Map Image */}
        <div
          ref={mapRef}
          className="flex flex-col items-center justify-center p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 2xl:p-20 relative z-10 order-2"
          style={{ direction: "ltr" }}
        >
          {/* Image Container */}
          <div className="relative w-full flex flex-col items-center justify-center gap-3 sm:gap-4">
            <div className="relative block w-full">
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full group cursor-pointer"
              >
                <img
                  src={PrimeLocationImage}
                  alt="SDES Location Map"
                  className="w-full h-auto max-h-[50vh] sm:max-h-[55vh] md:max-h-[60vh] lg:max-h-[65vh] xl:max-h-[70vh] object-contain transition-transform duration-300 group-hover:scale-[1.02] rounded-xl sm:rounded-2xl shadow-2xl mx-auto"
                  style={{
                    border: "2px solid #F27141",
                    borderRadius: "0.75rem"
                  }}
                />
              </a>

              {/* Port Distance Badge - Top Right of Image */}
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                <div
                  className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full backdrop-blur-lg shadow-xl flex items-center gap-1.5 sm:gap-2 border border-white/30 transition-all duration-300 hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(242, 113, 65, 0.95), rgba(184, 34, 39, 0.95))",
                    boxShadow: "0 4px 20px rgba(242, 113, 65, 0.4)",
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse shadow-lg"
                    style={{
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
                    }}
                  ></div>
                  <span className="text-white text-[10px] sm:text-xs md:text-sm font-bold tracking-wide whitespace-nowrap">
                    {t("primeLocation.portDistance")}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Features - Compact List Below */}
            <div className="w-full max-w-full lg:max-w-2xl">
              <div
                className="backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-lg"
                style={{
                  background: "rgba(38, 47, 97, 0.85)",
                  border: "1px solid rgba(242, 113, 65, 0.25)",
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                      color="#F27141"
                      strokeWidth={2}
                    />
                    <span className="text-white text-[11px] sm:text-xs md:text-sm font-light leading-tight">
                      {t("primeLocation.terminalDistance")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                      color="#F27141"
                      strokeWidth={2}
                    />
                    <span className="text-white text-[11px] sm:text-xs md:text-sm font-light leading-tight">
                      {t("primeLocation.industrialDistance")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                      color="#F27141"
                      strokeWidth={2}
                    />
                    <span className="text-white text-[11px] sm:text-xs md:text-sm font-light leading-tight">
                      {t("primeLocation.gateway")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                      color="#F27141"
                      strokeWidth={2}
                    />
                    <span className="text-white text-[11px] sm:text-xs md:text-sm font-light leading-tight">
                      {t("primeLocation.freeDays")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}