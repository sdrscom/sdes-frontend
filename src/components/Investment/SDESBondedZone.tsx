import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  DollarSign,
  Truck,
  Zap,
  Shield,
  TrendingUp,
  Clock,
} from "lucide-react";
import Pattern from "../Pattern/Pattern";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

interface CardItem {
  icon: any;
  title: string;
  description: string;
}

interface CardProps {
  item: CardItem;
}

const SDESBondedZone: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const sectionRef = useRef(null);
  const pinWrapRef = useRef(null);
  const rightColumnRef = useRef(null);
  const leftColumnRef = useRef(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=1000",
            scrub: 0.1,
            pin: pinWrapRef.current,
            pinSpacing: true,
            anticipatePin: 1,
          },
        });

        tl.to(rightColumnRef.current, { y: -160, ease: "none" }, 0);
        tl.to(leftColumnRef.current, { y: 160, ease: "none" }, 0);
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  const leftCards: CardItem[] = [
    {
      icon: DollarSign,
      title: t("sdesBondedZone.cards.tax"),
      description: t("sdesBondedZone.cards.taxDesc"),
    },
    {
      icon: Truck,
      title: t("sdesBondedZone.cards.port"),
      description: t("sdesBondedZone.cards.portDesc"),
    },
    {
      icon: Zap,
      title: t("sdesBondedZone.cards.integration"),
      description: t("sdesBondedZone.cards.integrationDesc"),
    },
  ];

  const rightCards: CardItem[] = [
    {
      icon: Shield,
      title: t("sdesBondedZone.cards.clearance"),
      description: t("sdesBondedZone.cards.clearanceDesc"),
    },
    {
      icon: TrendingUp,
      title: t("sdesBondedZone.cards.reexport"),
      description: t("sdesBondedZone.cards.reexportDesc"),
    },
    {
      icon: Clock,
      title: t("sdesBondedZone.cards.facilities"),
      description: t("sdesBondedZone.cards.facilitiesDesc"),
    },
  ];

  const allCards = [...leftCards, ...rightCards];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden lg:min-h-[150vh]"
      style={{ backgroundColor: "#262F61" }}
    >
      <Pattern className="pl-2" />

      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,.03) 0px, rgba(255,255,255,.03) 2px, transparent 2px, transparent 4px)",
        }}
      ></div>

      {/* Desktop Layout */}
      <div
        ref={pinWrapRef}
        className="hidden lg:block w-full h-screen overflow-hidden relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6 h-full">
          <div className="grid grid-cols-2 gap-8 h-full items-center">
            {/* Left Section */}
            <div className="flex flex-col justify-center">
              <div className="max-w-xl">
                {/* <p className="text-[#F27141] font-semibold text-sm uppercase tracking-wider mb-3">
                  {t("sdesBondedZone.subtitle")}
                </p> */}

                <h2
                  className="relative text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 md:mb-5 lg:mb-6 leading-tight ps-4 sm:ps-5"
                  style={{ color: "#FFFFFF" }}
                >
                  <span
                    className={`absolute top-0 ${
                      language === "ar" ? "right-0" : "left-0"
                    } w-1 sm:w-[4px] lg:w-[5px] h-full rounded shadow-lg opacity-70`}
                    style={{
                      background:
                        "linear-gradient(to bottom, #F27141, #B82227)",
                    }}
                  ></span>
                  <span
                    className={`absolute top-0 ${
                      language === "ar" ? "right-0" : "left-0"
                    } w-1 sm:w-[4px] lg:w-[5px] h-full rounded-full blur-sm opacity-70`}
                    style={{
                      background:
                        "linear-gradient(to bottom, #F27141, #B82227)",
                    }}
                  ></span>
                  <span className="text-white">
                    {t("sdesBondedZone.titlePrefix")}
                  </span>
                </h2>

                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  {t("sdesBondedZone.description")}
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className="h-full flex items-center overflow-hidden">
              <div className="flex gap-4 w-full overflow-hidden">
                <div
                  ref={leftColumnRef}
                  className="flex flex-col gap-4 flex-1 mt-8"
                >
                  {leftCards.map((item, index) => (
                    <Card key={`left-${index}`} item={item} />
                  ))}
                </div>

                <div
                  ref={rightColumnRef}
                  className="flex flex-col gap-4 flex-1 mt-20 mb-8"
                >
                  {rightCards.map((item, index) => (
                    <Card key={`right-${index}`} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Section */}
      <div className="lg:hidden relative z-10 py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12 text-center">
            {/* <p className="text-[#F27141] font-semibold text-sm uppercase tracking-wider mb-3">
              {t("sdesBondedZone.subtitle")}
            </p> */}

            <h1 className="text-4xl font-bold mb-6 leading-tight">
              <span className="text-white">
                {t("sdesBondedZone.titlePrefix")}
              </span>
            </h1>

            <p className="text-gray-300 text-base mb-6 leading-relaxed">
              {t("sdesBondedZone.description")}
            </p>

            <div className="h-1 w-20 bg-gradient-to-r from-[#F27141] to-[#B82227] rounded-full mx-auto"></div>
          </div>

          <div className="space-y-6">
            {allCards.map((item, index) => (
              <Card key={`mobile-${index}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Card: React.FC<CardProps> = ({ item }) => {
  const IconComponent = item.icon;

  return (
    <div
      className="rounded-2xl p-6 shadow-2xl transition-all duration-300 lg:h-[320px] flex flex-col"
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(5px)",
      }}
    >
      <div className="bg-gradient-to-r from-[#F27141] to-[#B82227] rounded-xl p-3 w-fit mb-4 shadow-lg">
        <IconComponent size={30} className="text-white" />
      </div>

      <h3 className="text-white font-bold text-xl mb-3 leading-tight">
        {item.title}
      </h3>

      <p className="text-gray-300 text-base leading-relaxed flex-1">
        {item.description}
      </p>
    </div>
  );
};

export default SDESBondedZone;
