import { useEffect, useState } from "react";
import Pattern from "../Pattern/Pattern";
import { useTranslation } from "react-i18next";

export default function Hero() {
  const { t, i18n } = useTranslation();

  const [videoUrl, setVideoUrl] = useState("");
  const [heroTitle, setHeroTitle] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await fetch(`${API_URL}/api/home-hero?populate=*`);
        const data = await res.json();

        const videoData = data?.data?.homeHero;

        if (videoData?.url) {
          const fullUrl = videoData.url.startsWith("http")
            ? videoData.url
            : `${API_URL}${videoData.url}`;

          setVideoUrl(fullUrl);
        }
      } catch (error) {
        console.log("Error fetching video:", error);
      }
    };

    const fetchHeroTitle = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/home-text-collections?locale=${i18n.language}`
        );

        const data = await res.json();
        const titleData = data?.data?.[0]?.HomeHeroTitle;

        if (titleData) {
          setHeroTitle(titleData);
        }
      } catch (error) {
        console.log("Error fetching hero title:", error);
      }
    };

    fetchVideo();
    fetchHeroTitle();
  }, [API_URL, i18n.language]);

  return (
    <section className="">
      <style>{`
        .animate-slow-zoom {
          animation: slowZoom 4s ease-out forwards;
        }
        
        @keyframes slowZoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.03);
          }
        }
      `}</style>

      <div className="relative min-h-screen h-screen flex items-center justify-center overflow-hidden">
        {videoUrl ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
           <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <img
            src="/hero-bg.jpg"
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(to top, rgba(26,35,71,0.6), rgba(38,47,97,0.3))",
          }}
        />

        <Pattern />

        <div className="absolute top-44 left-0 right-0 z-10 w-full px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-0 pb-8 xs:pb-10 sm:pb-12 md:pb-16 lg:pb-20">
          <div className="max-w-7xl mx-auto">
            <h1 className="uppercase text-white font-semibold text-xs xs:text-sm sm:text-sm md:text-base lg:text-base mb-3 xs:mb-4 sm:mb-4 md:mb-2 tracking-wider sm:tracking-widest">
              {t("hero.welcome")}
            </h1>

            <h1 className="text-3xl xs:text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold w-full lg:w-10/12 xl:w-9/12 2xl:w-8/12 mb-3 xs:mb-4 sm:mb-4 md:mb-5 lg:mb-6 text-white leading-tight sm:leading-tight md:leading-tight lg:leading-tight">
              {heroTitle}
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6 sm:mt-7 lg:mt-8">
              <a
                href="/services"
                className="bg-[#2D3B76] hover:bg-[#162472] transition-all duration-300 py-3 lg:py-3.5 text-white uppercase px-6 lg:px-8 text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transform w-full sm:w-auto inline-flex items-center justify-center"
              >
                <span className="tracking-widest">{t("hero.services")}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
