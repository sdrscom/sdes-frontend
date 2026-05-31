import React from "react";
import { User } from "lucide-react";
import Pattern from "../../components/Pattern/Pattern";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../locales/translations";

const TeamMemberCard: React.FC<{
  name: string;
  title: string;
  image?: string;
  isRTL: boolean;
}> = ({ name, title, image, isRTL }) => {
  return (
    <div className="w-full rounded-xl overflow-hidden shadow-2xl relative transition duration-300">
      <div className="h-[400px] w-full overflow-hidden relative">
       <div className="w-full h-full bg-gray-800 flex items-center justify-center">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
       ) : (
         <User size={96} className="text-gray-500 opacity-60" />
       )}
      </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

        <div
          className={`absolute bottom-0 left-0 right-0 p-6 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          <h3 className="text-2xl font-bold text-white leading-tight mb-2">
            {name}
          </h3>
          <p className="text-sm font-semibold text-[#F27141] uppercase tracking-wide">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
};

const AboutSections: React.FC = () => {
  const { language } = useLanguage();

  const t = (key: string) => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  const isRTL = language === "ar";

  const ceoData = {
    name: t("aboutSections.ceoMessage.ceoName"),
    role: t("aboutSections.ceoMessage.ceoRole"),
  };

  const teamMembers = t("aboutSections.teamMembers");

  return (
    <>
      <section
        id="ceo-message"
        className="relative py-10 overflow-hidden bg-[#262F61]"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <Pattern />
        <div className="relative max-w-7xl mx-auto px-6 z-10">
          <div className="mb-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              {t("aboutSections.hero.title")}{" "}
              <span
                style={{
                  background: "linear-gradient(to right, #F27141, #B82227)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t("aboutSections.hero.titleHighlight")}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="relative">
              <div className="w-full max-w-sm lg:max-w-md mx-auto lg:mt-10 rounded-xl overflow-hidden shadow-2xl transition duration-500 transform">
                <div className="w-full h-96 lg:h-[500px] bg-gray-800 flex items-center justify-center">
          <img src="/ceo.jpg" alt="CEO" className="w-full h-full object-cover" />
         </div>
                <div
                  className="absolute bottom-0 left-0 w-full h-1"
                  style={{
                    background: "linear-gradient(to right, #F27141, #B82227)",
                  }}
                ></div>
              </div>
            </div>

            <div className={`lg:pt-8 ${isRTL ? "text-right" : "text-left"}`}>
              <h3 className="text-3xl font-semibold mb-4 text-white">
                {t("aboutSections.ceoMessage.sectionTitle")}{" "}
                <span className="text-[#B82227] font-extrabold">
                  {t("aboutSections.ceoMessage.sectionTitleHighlight")}
                </span>
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                {t("aboutSections.ceoMessage.paragraph1")}
              </p>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                {t("aboutSections.ceoMessage.paragraph2")}
              </p>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                {t("aboutSections.ceoMessage.paragraph3")}
              </p>

              <div className="mt-6">
                <h4 className="text-2xl font-bold text-white mb-1">
                  {ceoData.name}
                </h4>
                <p className="text-base font-semibold text-[#B82227] uppercase tracking-wider">
                  {ceoData.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          id="leadership-team-profiles"
          className="relative pt-12 pb-28 md:pb-40 overflow-hidden bg-[#262F61]"
        >
          <Pattern />

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className={`px-6 mb-12 ${isRTL ? "text-right" : "text-left"}`}>
              <h3 className="text-3xl md:text-4xl text-white font-bold">
                {t("aboutSections.managementTeam.title")}
              </h3>
            </div>

            <div className="px-6">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={32}
                slidesPerView="auto"
                navigation={{
                  nextEl: ".swiper-button-next-custom",
                  prevEl: ".swiper-button-prev-custom",
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                breakpoints={{
                  320: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                  },
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 24,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 32,
                  },
                }}
                className="!pb-12"
                dir={isRTL ? "rtl" : "ltr"}
              >
                {teamMembers.map((member: any, index: number) => (
                  <SwiperSlide key={index}>
                    <TeamMemberCard {...member} isRTL={isRTL} />
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="flex justify-center gap-4">
                <button className="swiper-button-prev-custom w-12 h-12 rounded-full flex items-center justify-center border border-gray-600 text-white hover:bg-[#F27141] hover:border-[#F27141] transition">
                  {isRTL ? "→" : "←"}
                </button>
                <button className="swiper-button-next-custom w-12 h-12 rounded-full flex items-center justify-center border border-gray-600 text-white hover:bg-[#F27141] hover:border-[#F27141] transition">
                  {isRTL ? "←" : "→"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default AboutSections;
