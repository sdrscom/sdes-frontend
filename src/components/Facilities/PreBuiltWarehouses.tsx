import React from "react";
import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

export interface WarehouseSize {
  size: number;
  categoryKey: string;
  featureKeys: string[];
}

interface PreBuiltWarehousesProps {
  warehouses: WarehouseSize[];
}

const PreBuiltWarehouses: React.FC<PreBuiltWarehousesProps> = ({
  warehouses,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  // Function to convert numbers to Arabic
  const toArabicNumber = (num: number): string => {
    if (language !== "ar") return num.toString();

    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num
      .toString()
      .split("")
      .map((digit) => arabicNumbers[parseInt(digit)] || digit)
      .join("");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-10 bg-bgSecondary">
      {/* Section Header */}
      <div className="text-center mb-12">
        <span className="font-semibold text-sm uppercase tracking-wider text-section">
          {t("preBuiltWarehouses.subtitle")}
        </span>
        <h3 className="text-4xl md:text-5xl font-extrabold mb-6 text-center text-primaryMain">
          {t("preBuiltWarehouses.title")}
        </h3>
        <p className="max-w-2xl mx-auto text-gray-800">
          {t("preBuiltWarehouses.description")}
        </p>
      </div>

      {/* Warehouse Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {warehouses.map((wh, index) => (
          <div
            key={index}
            className="warehouse-card group rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-cardBg border border-borderDark"
          >
            {/* Card Header */}
            <div className="relative overflow-hidden text-white p-6 bg-primaryMain rounded-t-xl">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 bg-white/10" />

              <div className="flex flex-col items-center">
                {/* Category */}
                <div className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-2">
                  {t(`preBuiltWarehouses.categories.${wh.categoryKey}`)}
                </div>

                {/* Size and m² */}
                <div className="flex items-end gap-1">
                  <div className="text-5xl font-bold">
                    {toArabicNumber(wh.size)}
                  </div>
                  <div className="text-lg opacity-90 mb-1">
                    {language === "ar" ? "م²" : "m²"}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Features */}
            <div className="p-6">
              <ul className="space-y-3">
                {wh.featureKeys.map((featureKey, idx) => (
                  <li key={idx} className="flex items-start text-sm">
                    <span
                      className={`mt-0.5 text-section ${
                        language === "ar" ? "ml-2" : "mr-2"
                      }`}
                    >
                      ✓
                    </span>
                    <span className="text-gray-800">
                      {t(`preBuiltWarehouses.features.${featureKey}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* High-Value Cargo Info Box */}
      <div
        className={`mt-8 rounded-lg p-6 bg-bgSecondary ${
          language === "ar" ? "border-r-4" : "border-l-4"
        } border-primaryAlt`}
      >
        <div className="flex items-start gap-4">
          <div className="mt-1 text-primaryAlt">
            <Package size={24} />
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-primaryMain">
              {t("preBuiltWarehouses.infoTitle")}
            </h3>
            <p className="text-sm text-gray-700">
              {t("preBuiltWarehouses.infoDescription")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreBuiltWarehouses;
