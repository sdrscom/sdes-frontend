import { useState, useEffect } from "react";
import Pattern from "../../components/Pattern/Pattern";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../locales/translations";

const LocationHero = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const currentTranslations = translations[language].locationHero;
  const advantages = currentTranslations.advantages;

  const [heroAnimated, setHeroAnimated] = useState(false);
  const [cardAnimated, setCardAnimated] = useState(false);
  const [heroImage, setHeroImage] = useState<string>("");
  const [heroTitle, setHeroTitle] = useState<string>("");
  const [heroDescription, setHeroDescription] = useState<string>("");

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/location-text-collections?populate=*&locale=${language}`
        );
        const data = await res.json();
        const content = data?.data?.[0];

        if (content?.LocationHeroTitle) {
          setHeroTitle(content.LocationHeroTitle);
        } else {
          setHeroTitle(currentTranslations.title);
        }

        if (content?.locationHeroDescription) {
          setHeroDescription(content.locationHeroDescription);
        } else {
          setHeroDescription(currentTranslations.description);
        }
      } catch (err) {
        console.error("Error fetching hero content:", err);
        setHeroTitle(currentTranslations.title);
        setHeroDescription(currentTranslations.description);
      }
    };

    fetchHeroContent();
  }, [API_URL, language]);

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const res = await fetch(`${API_URL}/api/location-hero?populate=*`);
        const data = await res.json();

        const imageUrl =
          data?.data?.locationHero?.url ||
          data?.data?.locationHero?.formats?.small?.url ||
          "";

        const fullUrl = imageUrl?.startsWith("http")
          ? imageUrl
          : `${API_URL}${imageUrl}`;

        setHeroImage(fullUrl);
      } catch (error) {
        console.error("Error loading hero image", error);
      }
    };

    fetchHeroImage();
  }, [API_URL]);

  useEffect(() => {
    const heroTimer = setTimeout(() => setHeroAnimated(true), 200);
    const cardTimer = setTimeout(() => setCardAnimated(true), 800);

    return () => {
      clearTimeout(heroTimer);
      clearTimeout(cardTimer);
    };
  }, []);

  return (
    <section
      className="min-h-screen bg-mainBg relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className="relative flex items-center justify-center min-h-screen bg-cover bg-center pt-28 pb-44 lg:py-28"
        style={{
          backgroundImage: heroImage ? `url(${heroImage})` : "none",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(26,35,71,0.6), rgba(38,47,97,0.3))",
          }}
        />
        <Pattern />

        <div className="relative z-10 text-center max-w-5xl px-6">
          <h1
            className={`text-4xl md:text-5xl font-bold mb-6 transition-all duration-1000 ease-out ${
              heroAnimated
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ color: "#FFFFFF" }}
          >
            {heroTitle}
          </h1>

          <p
            className={`text-lg md:text-xl max-w-3xl mx-auto mb-10 transition-all duration-1000 ease-out ${
              heroAnimated
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5"
            }`}
            style={{ color: "#E8EAED", transitionDelay: "200ms" }}
          >
            {heroDescription}
          </p>

          <div
            className={`transition-all duration-700 ease-out ${
              heroAnimated
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            {/* <GradientButton>Explore Location</GradientButton> */}
          </div>
        </div>
      </div>

      <div
        className={`mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 -mt-32 lg:-mt-48 relative z-20 mb-8 transition-all duration-1000 ease-out ${
          cardAnimated
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-16"
        }`}
      >
        <div
          className="rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl backdrop-blur-xl"
          style={{
            background: "rgba(38, 47, 97, 0.3)",
            border: "2px solid rgba(242, 113, 65, 0.4)",
            boxShadow:
              "0 25px 50px -12px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.05),0 0 80px rgba(242,113,65,0.15)",
          }}
        >
          <Pattern />
          <div className="relative z-10 flex flex-col items-center text-center gap-10">
            <div className="w-full">
              <ul
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 text-base md:text-lg ${
                  isRTL ? "text-right" : "text-left"
                }`}
                style={{ color: "#B8BFCC" }}
              >
                {advantages.map((advantage: any, index: number) => (
                  <li
                    key={index}
                    className={`flex items-start ${
                      isRTL ? "space-x-reverse" : ""
                    } space-x-3`}
                  >
                    <span
                      className="flex-shrink-0 mt-1"
                      style={{
                        background: "linear-gradient(135deg, #F27141, #B82227)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: "700",
                      }}
                    >
                      &#x2714;
                    </span>

                    <div>
                      <h3
                        className="font-semibold"
                        style={{
                          background:
                            "linear-gradient(135deg, #F27141, #B82227)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {advantage.title}
                      </h3>
                      <p className="mt-1 text-sm md:text-base text-gray-300">
                        {advantage.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationHero;
