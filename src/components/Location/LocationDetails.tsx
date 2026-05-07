import Pattern from "../../components/Pattern/Pattern";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../locales/translations";

const LocationDetails = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const currentTranslations = translations[language].locationDetails;
  const berthData = currentTranslations.berthData;

  return (
    <section
      className="py-20 md:py-32 bg-mainBg relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Pattern className="pl-2" />
        <div className="relative z-10 space-y-20">
          <div
            className={`max-w-4xl mx-auto ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            <h2
              className="text-4xl md:text-5xl font-extrabold mb-2"
              style={{ color: "#FFFFFF" }}
            >
              {currentTranslations.mainTitle}
            </h2>
            <p
              className="text-xl font-medium mb-8"
              style={{ color: "#B8BFCC" }}
            >
              {currentTranslations.subtitle}
            </p>

            <p
              className="text-lg leading-relaxed mb-10"
              style={{ color: "#E8EAED" }}
            >
              {currentTranslations.overview}
            </p>

            <h3
              className="text-2xl md:text-3xl font-bold tracking-widest uppercase mb-6"
              style={{
                background: "linear-gradient(to right, #F27141, #B82227)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {currentTranslations.geographicalTitle}
            </h3>

            <p
              className="text-lg leading-relaxed mb-6"
              style={{ color: "#B8BFCC" }}
            >
              {currentTranslations.geographicalDesc1}
            </p>

            <div
              className={`flex flex-col md:flex-row gap-4 md:gap-12 mb-10 ${
                isRTL ? "md:flex-row-reverse" : ""
              }`}
            >
              <p className="text-xl font-semibold" style={{ color: "#F27141" }}>
                {currentTranslations.latitude}
              </p>
              <p className="text-xl font-semibold" style={{ color: "#F27141" }}>
                {currentTranslations.longitude}
              </p>
            </div>

            <p
              className="text-lg leading-relaxed mb-6"
              style={{ color: "#E8EAED" }}
            >
              {currentTranslations.geographicalDesc2}
            </p>

            <div
              className="p-4 rounded-xl inline-block"
              style={{
                background: "rgba(184, 34, 39, 0.2)",
                border: "1px solid #F27141",
              }}
            >
              <p className="text-lg font-semibold" style={{ color: "#FFFFFF" }}>
                {currentTranslations.vesselInfo.text1}{" "}
                <span style={{ color: "#F27141" }}>
                  {currentTranslations.vesselInfo.depth}
                </span>
                {currentTranslations.vesselInfo.text2}{" "}
                <span style={{ color: "#F27141" }}>
                  {currentTranslations.vesselInfo.berths}
                </span>
                {currentTranslations.vesselInfo.text3}
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <h3
              className="text-3xl font-bold mb-8 text-center"
              style={{ color: "#FFFFFF" }}
            >
              {currentTranslations.berthsTitle}
            </h3>
            <div
              className="rounded-xl overflow-hidden shadow-2xl border-2"
              style={{
                borderColor: "rgba(242, 113, 65, 0.4)",
                background: "rgba(38, 47, 97, 0.3)",
              }}
            >
              <div
                className="flex font-bold p-4 text-lg"
                style={{
                  background:
                    "linear-gradient(to right, rgba(242, 113, 65, 0.3), rgba(184, 34, 39, 0.3))",
                  color: "#FFFFFF",
                  borderBottom: "2px solid rgba(242, 113, 65, 0.4)",
                }}
              >
                <div className="w-1/4 flex-shrink-0 text-center">
                  {currentTranslations.tableHeaders.berths}
                </div>
                <div className={`w-3/4 ${isRTL ? "pr-4" : "pl-4"}`}>
                  {currentTranslations.tableHeaders.functions}
                </div>
              </div>

              {berthData.map((item: any, index: number) => (
                <div
                  key={index}
                  className={`flex text-sm md:text-base p-4 transition duration-300 hover:bg-opacity-20`}
                  style={{
                    color: "#E8EAED",
                    background:
                      index % 2 === 0
                        ? "rgba(26, 35, 71, 0.1)"
                        : "rgba(26, 35, 71, 0.3)",
                    borderBottom:
                      index < berthData.length - 1
                        ? "1px solid rgba(242, 113, 65, 0.1)"
                        : "none",
                  }}
                >
                  <div
                    className="w-1/4 flex-shrink-0 text-center font-bold"
                    style={{ color: "#F27141" }}
                  >
                    {item.berths}
                  </div>
                  <div className={`w-3/4 ${isRTL ? "pr-4" : "pl-4"}`}>
                    {item.functionList ? (
                      <ul
                        className={`${isRTL ? "list-arabic" : "list-disc"} ${
                          isRTL ? "pr-5" : "pl-5"
                        } space-y-1`}
                      >
                        {item.functionList.map((func: string, idx: number) => (
                          <li key={idx}>{func}</li>
                        ))}
                      </ul>
                    ) : (
                      item.function
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationDetails;
