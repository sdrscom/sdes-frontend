"use client";
import { useEffect, useRef, useState } from "react";
import { Truck, Package, Car, Boxes, Wrench, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import Pattern from "../../components/Pattern/Pattern";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// import ScrollDownIndicator from "../../ui/ScrollDownIndicator";
import containerImg from "../../assets/img7.jpg";
import generalImg from "../../assets/cargo steel.jpg";
import vehicleImg from "../../assets/statsBg.jpg";
import freightImg from "../../assets/background3.jpg";
import labourImg from "../../assets/File249.jpg";
import tradeImg from "../../assets/img3.jpg";

gsap.registerPlugin(ScrollTrigger);

export default function ServicesSection() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [modalService, setModalService] = useState<null | {
    titleKey: string;
    pointKeys: string[];
    descriptionKey: string;
    image: string;
  }>(null);

  const services = [
    {
      titleKey: "containerServices",
      pointKeys: [
        "shuttling",
        "loading",
        "crossStuffing",
        "inspection",
        "stripping",
      ],
      descriptionKey: "containerServices",
      icon: <Package className="w-10 h-10 text-[#F27141]" />,
      image: containerImg,
    },
    {
      titleKey: "generalCargo",
      pointKeys: ["shuttling", "handling", "loading"],
      descriptionKey: "generalCargo",
      icon: <Boxes className="w-10 h-10 text-[#B82227]" />,
      image: generalImg,
    },
    {
      titleKey: "vehicleServices",
      pointKeys: ["vinCheck", "odometer", "damageCheck", "stickering"],
      descriptionKey: "vehicleServices",
      icon: <Car className="w-10 h-10 text-[#F27141]" />,
      image: vehicleImg,
    },
    {
      titleKey: "freightServices",
      pointKeys: ["reExport", "importExport", "inTransit", "bondedShipments"],
      descriptionKey: "freightServices",
      icon: <Truck className="w-10 h-10 text-[#B82227]" />,
      image: freightImg,
    },
    {
      titleKey: "tradeDistribution",
      pointKeys: [
        "palletization",
        "customization",
        "fasterMarket",
        "costSavings",
      ],
      descriptionKey: "tradeDistribution",
      icon: <Globe className="w-10 h-10 text-[#B82227]" />,
      image: tradeImg,
    },
    {
      titleKey: "labourEquipment",
      pointKeys: ["forklift", "skilledLabor"],
      descriptionKey: "labourEquipment",
      icon: <Wrench className="w-10 h-10 text-[#F27141]" />,
      image: labourImg,
    },
  ];

  useEffect(() => {
    sectionsRef.current.forEach((section, index) => {
      if (!section) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        gsap.fromTo(
          section,
          { opacity: 0, x: index % 2 === 0 ? -60 : 60 },
          {
            opacity: 1,
            x: 0,
            duration: 1.3,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 50%",
              toggleActions: "play none none none",
            },
          }
        );

        gsap.fromTo(
          section.querySelectorAll("li"),
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      mm.add("(max-width: 767px)", () => {
        gsap.set(section, { opacity: 1, x: 0 });
        gsap.set(section.querySelectorAll("li"), { opacity: 1, y: 0 });
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      id="services-section"
      className="relative py-20 px-6 md:px-16 text-[#E8EAED] overflow-hidden bg-mainBg"
    >
      {/* <ScrollDownIndicator /> */}
      <Pattern className="pl-2" />

      <div
        className="relative z-10 max-w-7xl mx-auto"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <h3 className="text-5xl font-bold text-white text-center mb-10">
          {t("servicesSection.title")}
          <div className="pt-5 relative">
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 sm:h-[5px] w-1/2 md:w-1/4 rounded shadow-lg opacity-70 bg-gradient-to-r from-[#F27141] to-[#B82227]"></span>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 sm:h-[5px] w-1/2 md:w-1/4 rounded-full blur-sm opacity-70 bg-gradient-to-r from-[#F27141] to-[#B82227]"></span>
          </div>
        </h3>

        <div className="flex flex-col gap-16">
          {services.map((service, index) => (
            <div
              key={index}
              ref={(el) => {
                sectionsRef.current[index] = el;
              }}
              className={`flex flex-col md:flex-row items-center gap-10 ${
                index % 2 === 0 ? "" : "md:flex-row-reverse"
              }`}
            >
              <div
                className="flex-1 relative group cursor-pointer overflow-hidden rounded-2xl"
                onClick={() => setModalService(service)}
              >
                <img
                  src={service.image}
                  alt={t(`servicesSection.services.${service.titleKey}.title`)}
                  className="w-full h-72 object-cover rounded-2xl shadow-lg border border-[rgba(242,113,65,0.25)] transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
                />
              </div>

              <div className="flex-1 flex flex-col gap-5 w-full">
                <div className="flex items-center gap-3">
                  {service.icon}
                  <h3 className="text-2xl md:text-3xl font-semibold text-white">
                    {t(`servicesSection.services.${service.titleKey}.title`)}
                  </h3>
                </div>
                <ul className="list-none space-y-3 text-[#E8EAED]/90 w-full">
                  {service.pointKeys.map((pointKey, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-start w-full pl-0"
                    >
                      <span className="text-[#F27141] text-xl font-bold mt-0.5 flex-shrink-0 w-4">
                        •
                      </span>
                      <span className="text-base md:text-lg leading-relaxed flex-1">
                        {t(
                          `servicesSection.services.${service.titleKey}.points.${pointKey}`
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={() => setModalService(null)}
        >
          <div
            className="bg-[#262F61] rounded-3xl max-w-3xl w-full p-8 pt-16 relative shadow-2xl transform transition-all duration-500 scale-95 animate-fadeIn my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            <button
              className={`fixed top-4 ${
                language === "ar" ? "left-4" : "right-4"
              } text-white text-3xl hover:text-red-400 transition-colors bg-[#262F61]/90 rounded-full w-10 h-10 flex items-center justify-center shadow-lg z-10`}
              onClick={() => setModalService(null)}
            >
              &times;
            </button>

            <img
              src={modalService.image}
              alt={t(`servicesSection.services.${modalService.titleKey}.title`)}
              className="w-full h-64 object-cover rounded-xl mb-6 shadow-lg"
            />

            <h3 className="text-3xl md:text-4xl font-extrabold text-gradient mb-4">
              {t(`servicesSection.services.${modalService.titleKey}.title`)}
            </h3>

            <ul className="list-none space-y-3 text-[#E8EAED]/90 text-lg w-full">
              {modalService.pointKeys.map((pointKey, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-start w-full"
                >
                  <span className="text-[#F27141] text-xl font-bold mt-0.5 flex-shrink-0 w-4">
                    •
                  </span>
                  <span className="leading-relaxed flex-1">
                    {t(
                      `servicesSection.services.${modalService.titleKey}.points.${pointKey}`
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-[#E8EAED]/80 text-base leading-relaxed">
              {t(
                `servicesSection.services.${modalService.descriptionKey}.modalDescription`
              )}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .text-gradient {
          background: linear-gradient(90deg, #f27141, #b82227);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
      <div className="w-full h-1 bg-white/10 rounded-full mt-10"></div>
    </section>
  );
}
