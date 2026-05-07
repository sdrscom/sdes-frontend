import React from "react";
import { useTranslation } from "react-i18next";
import Pattern from "../../components/Pattern/Pattern";

interface BuiltToSuitProps {
  benefitKeys: string[]; // Changed from benefits to benefitKeys
}

const BuiltToSuitWarehouses: React.FC<BuiltToSuitProps> = ({ benefitKeys }) => {
  const { t } = useTranslation();

  return (
    <div
      className="relative py-24 overflow-hidden"
      style={{
        background: "linear-gradient(to bottom right, #262f61, #2D3B76)",
      }}
    >
      <Pattern />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20 relative">
          {/* <span className="font-semibold text-sm uppercase tracking-wider text-orange-500">
            {t("builtToSuit.subtitle")}
          </span> */}
          <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-6 text-white relative z-10">
            {t("builtToSuit.title")}
            {/* Solid Gradient */}
            <div className="pt-5">
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 sm:h-[5px] w-1/3 rounded shadow-lg opacity-70"
                style={{
                  background: "linear-gradient(to right, #F27141, #B82227)",
                }}
              ></span>
              {/* Blurred Gradient Line */}
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 sm:h-[5px] w-1/3 rounded-full blur-sm opacity-70"
                style={{
                  background: "linear-gradient(to right, #F27141, #B82227)",
                }}
              ></span>
            </div>
          </h2>

          <p className="text-lg max-w-3xl mx-auto text-gray-200 mt-8">
            {t("builtToSuit.description")}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {benefitKeys.map((benefitKey, index) => (
            <div
              key={index}
              className="rounded-3xl p-8 flex flex-col items-center text-center transition-transform hover:scale-105 hover:shadow-2xl"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-5 shadow-lg"
                style={{ backgroundColor: "#F27141" }}
              >
                <span className="text-white text-2xl font-bold">✓</span>
              </div>
              <p className="text-gray-200 font-medium text-lg">
                {t(`builtToSuit.benefits.${benefitKey}`)}
              </p>
            </div>
          ))}
        </div>

        <div className="w-full h-1 bg-white/10 rounded-full mt-10"></div>
      </div>
    </div>
  );
};

export default BuiltToSuitWarehouses;
