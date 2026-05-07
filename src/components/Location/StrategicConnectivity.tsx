import React from "react";
import Pattern from "../../components/Pattern/Pattern";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../locales/translations";

interface DistanceItem {
  city: string;
  distance: string;
}

interface DistanceCardProps {
  title: string;
  data: DistanceItem[];
  isRTL: boolean;
}

const DistanceCard: React.FC<DistanceCardProps> = ({ title, data, isRTL }) => {
  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden shadow-2xl h-full"
      style={{
        border: "2px solid rgba(242, 113, 65, 0.4)",
        background: "rgba(38, 47, 97, 0.3)",
      }}
    >
      <div
        className="p-4 text-xl font-bold text-center"
        style={{
          background:
            "linear-gradient(to right, rgba(242, 113, 65, 0.3), rgba(184, 34, 39, 0.3))",
          color: "#FFFFFF",
          borderBottom: "2px solid rgba(242, 113, 65, 0.4)",
        }}
      >
        {title}
      </div>

      <div className="flex-grow">
        {data.map((item: DistanceItem, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-3 sm:p-4 text-sm md:text-base transition duration-300 hover:bg-opacity-20"
            style={{
              background:
                index % 2 === 0
                  ? "rgba(26, 35, 71, 0.1)"
                  : "rgba(26, 35, 71, 0.3)",
              color: "#E8EAED",
              borderBottom:
                index < data.length - 1
                  ? "1px solid rgba(242, 113, 65, 0.1)"
                  : "none",
            }}
          >
            <span
              className={`font-medium ${isRTL ? "text-right" : "text-left"}`}
            >
              {item.city}
            </span>
            <span
              className={`font-bold ${isRTL ? "text-left" : "text-right"}`}
              style={{ color: "#F27141" }}
            >
              {item.distance}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StrategicConnectivity: React.FC = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const currentTranslations = translations[language].strategicConnectivity;

  return (
    <section
      className="py-20 md:py-32 bg-mainBg relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Pattern />
        <div className="relative z-10 space-y-12">
          <h2
            className="text-3xl md:text-4xl font-extrabold text-center mb-12"
            style={{ color: "#FFFFFF" }}
          >
            {currentTranslations.mainTitle}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <DistanceCard
              title={currentTranslations.cards.ksa.title}
              data={currentTranslations.cards.ksa.data}
              isRTL={isRTL}
            />

            <DistanceCard
              title={currentTranslations.cards.gcc.title}
              data={currentTranslations.cards.gcc.data}
              isRTL={isRTL}
            />

            <DistanceCard
              title={currentTranslations.cards.mena.title}
              data={currentTranslations.cards.mena.data}
              isRTL={isRTL}
            />
          </div>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full mt-10"></div>
      </div>
    </section>
  );
};

export default StrategicConnectivity;
