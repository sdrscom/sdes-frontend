import React from "react";
import { CheckCircle, Scan, Clock } from "lucide-react";
import Pattern from "../Pattern/Pattern";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

interface Feature {
  icon: React.ReactElement;
  label: string;
  value: string;
}

const FasterClearanceSection: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const features: Feature[] = [
    {
      icon: <CheckCircle className="w-8 h-8 md:w-17 md:h-7 lg:w-10 lg:h-10" />,
      label: t("fasterClearance.onSiteService"),
      value: "100%",
    },
    {
      icon: <Clock className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />,
      label: t("fasterClearance.availability"),
      value: t("fasterClearance.availabilityValue"),
    },
    {
      icon: <Scan className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />,
      label: t("fasterClearance.xRayScanning"),
      value: t("fasterClearance.instantValue"),
    },
  ];

  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 px-4 sm:px-6 md:px-8 lg:px-12 bg-[#262f61]">
      <Pattern />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          <h2 className="text-5xl font-bold mb-4 text-white relative inline-block">
            {t("fasterClearance.title")}
            <div className="pt-4 sm:pt-5 relative">
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 sm:h-[5px] w-1/2 sm:w-2/5 md:w-1/3 lg:w-1/4 bg-gradient-to-r from-[#F27141] to-[#B82227] rounded shadow-lg opacity-70"></span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 sm:h-[5px] w-1/2 sm:w-2/5 md:w-1/3 lg:w-1/4 bg-gradient-to-r from-[#F27141] to-[#B82227] rounded-full blur-sm opacity-70"></span>
            </div>
          </h2>

          <p className="text-xl max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-12 lg:mb-16 text-[#E8EAED]">
            {t("fasterClearance.description")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-8 sm:mb-10 md:mb-12 lg:mb-16 max-w-5xl mx-auto px-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative flex flex-col items-center gap-3 sm:gap-4 px-4 sm:px-5 md:px-6 lg:px-8 py-6 sm:py-7 md:py-8 lg:py-10 rounded-2xl bg-gradient-to-br from-[#F27141]/10 to-[#B82227]/10 border-2 border-[#F27141]/30 shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F27141]/20 to-[#B82227]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-4 w-full">
                  <div className="relative">
                    <div className="text-[#F27141] transition-all duration-300 group-hover:scale-105 group-hover:rotate-6">
                      {feature.icon}
                    </div>
                    <div className="absolute inset-0 blur-lg bg-[#F27141] opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  </div>

                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tabular-nums bg-gradient-to-br from-[#F27141] to-[#B82227] bg-clip-text text-transparent">
                    {feature.value}
                  </div>

                  <p className="text-sm sm:text-base md:text-lg font-semibold text-center text-[#E8EAED]">
                    {feature.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-4 sm:gap-5 md:gap-6 lg:gap-10 mb-8 sm:mb-10 md:mb-12 text-left md:text-center px-2 sm:px-4">
            <div className="flex items-start md:items-center gap-3 sm:gap-4 group">
              <div
                className={`flex-shrink-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full mt-2 md:mt-0 bg-[#F27141] group-hover:scale-150 transition-transform duration-300 ${
                  language === "ar" ? "ml-3" : "mr-3"
                }`}
              ></div>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#E8EAED]">
                {t("fasterClearance.onSiteCustoms")}
              </p>
            </div>

            <div className="flex items-start md:items-center gap-3 sm:gap-4 group">
              <div
                className={`flex-shrink-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full mt-2 md:mt-0 bg-[#F27141] group-hover:scale-150 transition-transform duration-300 ${
                  language === "ar" ? "ml-3" : "mr-3"
                }`}
              ></div>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#E8EAED]">
                {t("fasterClearance.dedicatedCargo")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FasterClearanceSection;
