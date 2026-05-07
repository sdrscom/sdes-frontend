import React from "react";
import { DollarSign, UserCheck, MapPin, CheckCircle } from "lucide-react";
import Pattern from "../Pattern/Pattern";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

interface PillarItem {
  icon: any;
  title: string;
  description: string;
}

const InvestorForeignAdvantages: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const corePillars: PillarItem[] = [
    {
      icon: UserCheck,
      title: t("investorAdvantages.pillars.ownership"),
      description: t("investorAdvantages.pillars.ownershipDesc"),
    },
    {
      icon: DollarSign,
      title: t("investorAdvantages.pillars.tax"),
      description: t("investorAdvantages.pillars.taxDesc"),
    },
    {
      icon: MapPin,
      title: t("investorAdvantages.pillars.location"),
      description: t("investorAdvantages.pillars.locationDesc"),
    },
  ];

  const detailedBenefits = t("investorAdvantages.benefits", {
    returnObjects: true,
  }) as string[];

  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{
        backgroundColor: "#262F61",
      }}
    >
      <Pattern />
      <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
        <div className="text-center mb-8 relative">
          {/* <p className="text-[#F27141] font-semibold text-sm uppercase tracking-widest mb-3">
            {t("investorAdvantages.subtitle")}
          </p> */}
          <h2 className="text-4xl md:text-5xl font-bold text-white relative z-10">
            {t("investorAdvantages.title")}
            {/* Gradient Divider */}
            <div className="pt-5">
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 sm:h-[5px] w-1/3 rounded shadow-lg opacity-70"
                style={{
                  background:
                    language === "ar"
                      ? "linear-gradient(to left, #F27141, #B82227)"
                      : "linear-gradient(to right, #F27141, #B82227)",
                }}
              ></span>
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 sm:h-[5px] w-1/3 rounded-full blur-sm opacity-70"
                style={{
                  background:
                    language === "ar"
                      ? "linear-gradient(to left, #F27141, #B82227)"
                      : "linear-gradient(to right, #F27141, #B82227)",
                }}
              ></span>
            </div>
          </h2>
        </div>

        <p className="mt-4 text-xl text-gray-200 max-w-3xl mx-auto">
          {t("investorAdvantages.description")}
        </p>

        {/* --- Cards --- */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          {corePillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={index}
                className={`
                  p-8 rounded-xl shadow-2xl transition duration-500 text-center relative overflow-hidden h-full
                  hover:shadow-[0_0_25px_rgba(242,113,65,0.7)] 
                `}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                <div className="absolute top-0 right-0 w-1/4 h-1/4 bg-white opacity-[0.03] rounded-bl-full"></div>

                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl bg-gradient-to-r from-[#F27141] to-[#B82227]">
                  <Icon size={30} className="text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-3">
                  {pillar.title}
                </h3>
                {/* Description */}
                <p className="text-gray-300 text-base">{pillar.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-20 text-left max-w-5xl mx-auto">
          {/* Sub-Heading */}
          <h3 className="text-3xl font-bold mb-6 text-center md:text-left text-white">
            {t("investorAdvantages.operationalTitle")}
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 list-none p-0">
            {detailedBenefits.map((benefit, index) => (
              <li key={index} className="flex items-start space-x-3">
                {/* Icon */}
                <CheckCircle
                  size={20}
                  className="text-[#F27141] flex-shrink-0 mt-1"
                />
                {/* Text */}
                <span className="text-lg text-white">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full mt-10"></div>
      </div>
    </section>
  );
};

export default InvestorForeignAdvantages;
