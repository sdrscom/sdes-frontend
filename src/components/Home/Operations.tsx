import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle, CreditCard, Zap, Bell } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Pattern from "../Pattern/Pattern";
import GradientButton from "../../ui/GradientButton";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import creditImage from "../../assets/Streamlined/Credit.jpg";
import governmentImage from "../../assets/Streamlined/Government.jpg";
import realTimeImage from "../../assets/Streamlined/RealTime.jpg";
import paymentImage from "../../assets/Streamlined/Payment.jpg";

gsap.registerPlugin(ScrollTrigger);

const API_URL = import.meta.env.VITE_API_URL;

interface Feature {
  icon: LucideIcon;
  src: string;
  caption: string;
  description: string;
  tag: string;
  color: string;
}

export default function StreamlinedOperations() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const [descriptions, setDescriptions] = useState<string[]>([]);

  const features: Feature[] = [
    {
      icon: CheckCircle,
      src: paymentImage,
      caption: t("streamlinedOperations.singlePayment"),
      description: t("streamlinedOperations.singlePayment"),
      tag: t("streamlinedOperations.payment"),
      color: "#F27141",
    },
    {
      icon: CreditCard,
      src: creditImage,
      caption: t("streamlinedOperations.creditFacility"),
      description: t("streamlinedOperations.creditFacility"),
      tag: t("streamlinedOperations.finance"),
      color: "#2D3B76",
    },
    {
      icon: Zap,
      src: governmentImage,
      caption: t("streamlinedOperations.eGovernment"),
      description: t("streamlinedOperations.eGovernment"),
      tag: t("streamlinedOperations.integration"),
      color: "#B82227",
    },
    {
      icon: Bell,
      src: realTimeImage,
      caption: t("streamlinedOperations.realTime"),
      description: t("streamlinedOperations.realTime"),
      tag: t("streamlinedOperations.tracking"),
      color: "#F27141",
    },
  ];

  // Fetch data
  useEffect(() => {
    const fetchText = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/home-text-collections?populate=*`
        );
        const data = await res.json();

        const currentLocale =
          language === "ar" ? data.data[0].localizations[0] : data.data[0];

        const rawText = currentLocale?.StreamlinedOperations || "";

        const list = rawText
          .split("\n")
          .map((line: string) => line.trim())
          .filter((line: string) => line !== "");

        setDescriptions(list);
      } catch (err) {
        console.error("Error fetching StreamlinedOperations:", err);
      }
    };

    fetchText();
  }, [language]);

  // ---------------- GSAP ANIMATIONS ---------------- //

  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return;

    // Animate text elements with stagger
    if (textRef.current) {
      const textChildren = Array.from(textRef.current.children).filter(
        (child) => child !== buttonRef.current
      );
      
      gsap.fromTo(
        textChildren,
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

    // Animate button smoothly
    if (buttonRef.current) {
      gsap.set(buttonRef.current, { y: 50, opacity: 0 });
      gsap.to(buttonRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.9,
      });
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const applyScrollTrigger = () => {
      if (mediaQuery.matches && wrapperRef.current && containerRef.current) {
        const totalScroll = 700;
        gsap.to(wrapperRef.current, {
          y: -totalScroll,
          ease: "power1.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: () => `+=${totalScroll + 800}`,
            scrub: 0.6,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            onEnter: () => {
              if (scrollIndicatorRef.current) {
                gsap.to(scrollIndicatorRef.current, {
                  opacity: 0,
                  duration: 0.3,
                });
              }
            },
            onLeaveBack: () => {
              if (scrollIndicatorRef.current) {
                gsap.to(scrollIndicatorRef.current, {
                  opacity: 1,
                  duration: 0.3,
                });
              }
            },
          },
        });
      }
    };

    applyScrollTrigger();

    const handleResize = () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      applyScrollTrigger();
    };

    mediaQuery.addEventListener("change", handleResize);
    window.addEventListener("resize", handleResize);

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      mediaQuery.removeEventListener("change", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen lg:h-screen overflow-hidden bg-[#262f61]"
    >
      <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-screen lg:h-full relative z-10 pt-6">
        <Pattern />

        <div
          ref={textRef}
          className="flex flex-col justify-center items-start p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 2xl:p-20 relative z-10 lg:order-1 order-1"
        >
          <h2
            className="relative text-4xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-10 leading-tight inline-block"
            style={{ color: "#FFFFFF" }}
          >
            <span
              className={`absolute top-0 ${
                language === "ar" ? "right-0" : "left-0"
              } w-1 sm:w-[4px] lg:w-[5px] h-full rounded shadow-lg opacity-70`}
              style={{
                background: "linear-gradient(to bottom, #F27141, #B82227)",
              }}
            />
            <span
              className={`absolute top-0 ${
                language === "ar" ? "right-0" : "left-0"
              } w-1 sm:w-[4px] lg:w-[5px] h-full rounded-full blur-sm opacity-70`}
              style={{
                background: "linear-gradient(to bottom, #F27141, #B82227)",
              }}
            />

            <span
              className={language === "ar" ? "pr-3 sm:pr-4" : "pl-3 sm:pl-4"}
            >
              {t("streamlinedOperations.title")}
            </span>

            <div
              className="bg-clip-text text-transparent block mt-1 sm:mt-2 relative"
              style={{
                backgroundImage:
                  language === "ar"
                    ? "linear-gradient(to left, #F27141, #B82227)"
                    : "linear-gradient(to right, #F27141, #B82227)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              <div
                className="absolute inset-x-0 -bottom-1 sm:-bottom-2 h-0.5 rounded-full"
                style={{
                  backgroundImage:
                    language === "ar"
                      ? "linear-gradient(to left, rgba(242, 113, 65, 0.3), rgba(184, 34, 39, 0.3))"
                      : "linear-gradient(to right, rgba(242, 113, 65, 0.3), rgba(184, 34, 39, 0.3))",
                }}
              />
            </div>
          </h2>

          <ul className="space-y-4 mb-8 max-w-full lg:max-w-xl">
            {descriptions.map((desc, i) => (
              <li key={i}>
                <p className="text-[#cbd0da] text-lg leading-relaxed">{desc}</p>
              </li>
            ))}
          </ul>

          <div ref={buttonRef}>
            <GradientButton to="/investment">
              {t("streamlinedOperations.learnMore")}
            </GradientButton>
          </div>
        </div>

        <div className="flex items-start justify-center relative w-full h-auto lg:order-2 order-2 lg:overflow-hidden lg:pt-6">
          <div
            className="absolute top-0 left-0 right-0 h-20 z-10 hidden lg:block pointer-events-none"
            style={{
              background: `linear-gradient(to bottom,#262f61,rgba(38,47,97,0.8),rgba(38,47,97,0.4),transparent)`,
            }}
          />

          <div
            className="absolute bottom-0 left-0 right-0 h-20 z-10 hidden lg:block pointer-events-none"
            style={{
              background: `linear-gradient(to top,#262f61,rgba(38,47,97,0.8),rgba(38,47,97,0.4),transparent)`,
            }}
          />

          <div
            ref={wrapperRef}
            className="w-full h-full flex flex-col gap-4 p-6 items-center justify-center
             sm:gap-6 sm:p-8
             md:flex-row md:flex-wrap md:items-start
             lg:flex-col lg:gap-8 lg:px-12 lg:py-8 lg:justify-start lg:h-auto lg:overflow-visible"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group relative flex-shrink-0 w-full max-w-sm h-[300px] mx-auto 
                  sm:max-w-md sm:h-[320px]
                  md:w-[calc(50%-12px)] md:h-[350px]
                  lg:w-[85%] lg:max-w-5xl lg:h-[280px] xl:h-[320px]
                  rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl 
                  transition-all duration-500 transform hover:scale-[1.02] cursor-pointer"
                >
                  <div className="absolute inset-0 overflow-hidden rounded-2xl lg:rounded-3xl">
                    <img
                      src={feature.src}
                      alt={feature.caption}
                      className="w-full h-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-110 group-hover:brightness-110"
                      loading="lazy"
                    />

                    <div
                      className="absolute inset-0 opacity-75 group-hover:opacity-85 transition-opacity duration-500"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(45,59,118,0.75), rgba(45,59,118,0.25), transparent)",
                      }}
                    />

                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background:
                          "linear-gradient(to bottom right, rgba(242,113,65,0.12), rgba(184,34,39,0.12))",
                      }}
                    />

                    <div className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-0 transition-transform duration-900">
                      <div
                        style={{
                          width: "60%",
                          height: "100%",
                          transform: "skewX(-12deg)",
                          background:
                            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%)",
                        }}
                        className="absolute right-0 top-0"
                      />
                    </div>
                  </div>

                  <div
                    className={`absolute top-3 ${
                      language === "ar" ? "right-3" : "left-3"
                    } z-10`}
                  >
                    <span
                      className="px-2 py-1 sm:px-3 sm:py-1 text-white text-xs font-medium rounded-full border shadow-lg transition-transform duration-300"
                      style={{
                        backgroundColor: "rgba(45, 59, 118, 0.7)",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      {feature.tag}
                    </span>
                  </div>

                  <div
                    className={`absolute top-3 ${
                      language === "ar" ? "left-3" : "right-3"
                    } z-10`}
                  >
                    <div
                      className="p-2 rounded-full backdrop-blur-sm transition-transform duration-400 transform-gpu group-hover:scale-110 group-hover:-rotate-6"
                      style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10 transition-transform duration-400">
                    {/* <h3 className="text-lg font-bold drop-shadow-lg">
                      {feature.caption}
                    </h3> */}
                    <div className="flex items-start gap-2 mt-1">
                      <div
                        className="w-1 h-4 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: feature.color }}
                      />
                      <p className="text-base font-semibold drop-shadow-lg">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-300 pointer-events-none group-hover:border-[rgba(242,113,65,0.18)]">
                    <div
                      className="absolute inset-0 rounded-2xl border"
                      style={{ borderColor: "rgba(255,255,255,0.06)" }}
                    />
                  </div>

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                    <svg
                      width="100%"
                      height="100%"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <pattern
                          id={`dots-${i}`}
                          width="20"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <circle cx="10" cy="10" r="1" fill="white" />
                        </pattern>
                      </defs>
                      <rect
                        width="100%"
                        height="100%"
                        fill={`url(#dots-${i})`}
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}