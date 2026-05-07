import { CheckCircle, Globe, TrendingUp, Zap } from "lucide-react";
import Pattern from "../../components/Pattern/Pattern";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

const WhyInvestInSaudi = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const economicPillars = [
    {
      title: t("whySaudi.pillars.market"),
      description: t("whySaudi.pillars.marketDesc"),
      icon: TrendingUp,
      iconColor: "text-white",
    },
    {
      title: t("whySaudi.pillars.gateway"),
      description: t("whySaudi.pillars.gatewayDesc"),
      icon: Globe,
      iconColor: "text-white",
    },
    {
      title: t("whySaudi.pillars.vision"),
      description: t("whySaudi.pillars.visionDesc"),
      icon: Zap,
      iconColor: "text-white",
    },
  ];

  const investorBenefits = t("whySaudi.benefits", {
    returnObjects: true,
  }) as string[];

  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{ backgroundColor: "#262F61" }}
    >
      <Pattern className="pl-2" />

      <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-8 relative">
          <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-3 text-white relative z-10 inline-block">
            {t("whySaudi.title")}

            {/* الخط الملون السفلي */}
            <div className="pt-5">
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 sm:h-[5px] w-1/3 rounded shadow-lg opacity-70"
                style={{
                  background:
                    language === "ar"
                      ? "linear-gradient(to left, #F27141, #B82227)"
                      : "linear-gradient(to right, #F27141, #B82227)",
                }}
              />
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 sm:h-[5px] w-1/3 rounded-full blur-sm opacity-70"
                style={{
                  background:
                    language === "ar"
                      ? "linear-gradient(to left, #F27141, #B82227)"
                      : "linear-gradient(to right, #F27141, #B82227)",
                }}
              />
            </div>
          </h2>
        </div>

        <p className="mt-4 text-xl text-gray-200 max-w-3xl mx-auto">
          {t("whySaudi.description")}
        </p>

        {/* الأعمدة الثلاثة */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          {economicPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={index}
                className="p-8 rounded-xl shadow-2xl transition duration-500 text-center relative overflow-hidden hover:shadow-[0_0_25px_rgba(242,113,65,0.7)]"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                <div className="absolute top-0 right-0 w-1/4 h-1/4 bg-white opacity-[0.03] rounded-bl-full"></div>

                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl bg-gradient-to-r from-[#F27141] to-[#B82227]">
                  <Icon size={30} className={pillar.iconColor} />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  {pillar.title}
                </h3>
                <p className="text-gray-300 text-base">{pillar.description}</p>
              </div>
            );
          })}
        </div>

        {/* بيئة مؤيدة للمستثمرين */}
        <div className="mt-20">
          <h3
            className="text-3xl font-bold mb-6 text-center md:text-left"
            style={{
              background: "#B82227",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("whySaudi.proInvestorTitle")}
          </h3>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 list-none p-0">
            {investorBenefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle
                  size={20}
                  className="text-[#F27141] flex-shrink-0 mt-1"
                />
                <span className="text-lg text-white">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default WhyInvestInSaudi;
