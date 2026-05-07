import React from "react";
import { TrendingDown, Clock } from "lucide-react";
import SaudiRiyalIcon from "../../ui/SaudiRiyalIcon";
import Pattern from "../Pattern/Pattern";
import { useTranslation } from "react-i18next";
import { useLanguage } from "./../../context/LanguageContext";

interface Benefit {
  icon: React.ReactElement;
  title: string;
  description: string;
  highlight: string;
}

const TaxBenefits: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const benefits: Benefit[] = [
    {
      icon: <SaudiRiyalIcon className="w-12 h-12" />,
      title: t("taxBenefits.vatTitle"),
      description: t("taxBenefits.vatDesc"),
      highlight: t("taxBenefits.zeroVat"),
    },
    {
      icon: <TrendingDown className="w-12 h-12" />,
      title: t("taxBenefits.deferredTitle"),
      description: t("taxBenefits.deferredDesc"),
      highlight: t("taxBenefits.payLater"),
    },
    {
      icon: <Clock className="w-12 h-12" />,
      title: t("taxBenefits.extendedTitle"),
      description: t("taxBenefits.extendedDesc"),
      highlight: t("taxBenefits.saveMore"),
    },
  ];

  return (
    <section className="relative pt-8 pb-20 px-6 bg-[#262f61]">
      <Pattern className="pl-2" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-8 animate-fade-up">
          <h2 className="text-5xl font-bold mb-4 text-white relative inline-block">
            {t("taxBenefits.title")}
            <div className="pt-5 relative">
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 sm:h-[5px] w-1/2 md:w-1/4 bg-gradient-to-r from-[#F27141] to-[#B82227] rounded shadow-lg opacity-70"></span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 sm:h-[5px] w-1/2 md:w-1/4 bg-gradient-to-r from-[#F27141] to-[#B82227] rounded-full blur-sm opacity-70"></span>
            </div>
          </h2>
          <p className="text-xl max-w-2xl mx-auto text-[#E8EAED]">
            {t("taxBenefits.description")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit: Benefit, index: number) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-[#D9D9D9] border-2 border-transparent transition-all duration-500 cursor-pointer hover:-translate-y-3 hover:scale-105 hover:border-[#B82227] hover:shadow-2xl"
            >
              <div
                className={`absolute top-4 px-4 py-1 rounded-full text-white text-sm font-semibold bg-[#F27141] ${
                  language === "ar" ? "left-4" : "right-4"
                }`}
              >
                {benefit.highlight}
              </div>

              <div className="p-8">
                <div className="mb-6 text-[#B82227]">{benefit.icon}</div>

                <h3 className="text-2xl font-bold mb-4 text-[#2D3B76] transition-colors duration-300 group-hover:text-[#B82227]">
                  {benefit.title}
                </h3>

                <p className="text-base leading-relaxed text-[#6A6A6A]">
                  {benefit.description}
                </p>
              </div>

              <div className="absolute bottom-0 left-0 h-2 w-0 bg-[#B82227] transition-all duration-500 group-hover:w-full"></div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fade-up 0.8s ease-out;
        }
      `}</style>
    </section>
  );
};

export default TaxBenefits;
