import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Pattern from "../../components/Pattern/Pattern";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../locales/translations";

import image2005 from "../../assets/Location/2005.png";
import image2009 from "../../assets/Location/2009.png";
import image2010 from "../../assets/Location/2010.png";
import image2013 from "../../assets/Location/2013.png";
import image2015 from "../../assets/Location/2015.png";
import image2022 from "../../assets/Location/2022.png";
import image2025 from "../../assets/Location/2025.png";

// Constants
const API_URL = import.meta.env.VITE_API_URL;

const images = [
  image2005,
  image2009,
  image2010,
  image2013,
  image2015,
  image2022,
  image2025,
];

// Types
type TimelineStats = {
  [year: string]: {
    title: string;
    description: string;
    warehouses: number;
    teus: number;
  };
};

type TimelineEvent = {
  year: number;
  title: string;
  description: string;
  imagePath: string;
  imageAlt: string;
  warehouses?: number;
  teus?: number;
  isLeft?: boolean;
};

// Components
const TimelinePoint: React.FC<{ year: number }> = ({ year }) => (
  <div
    className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold z-20 shadow-lg"
    style={{
      background: "linear-gradient(135deg, #F27141, #B82227)",
      boxShadow: "0 0 15px rgba(242, 113, 65, 0.5)",
    }}
  >
    {year}
  </div>
);

const ImageModal: React.FC<{ imageSrc: string; onClose: () => void }> = ({
  imageSrc,
  onClose,
}) => {
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).id === "modal-bg") onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        id="modal-bg"
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClickOutside}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-6 text-white text-4xl font-light hover:text-[#f27141] transition-colors duration-300 z-50"
        >
          ✕
        </button>

        <motion.div
          className="relative p-2 rounded-xl max-w-4xl w-[90%] bg-[#1e274f]"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
        >
          <img
            src={imageSrc}
            alt="Zoomed"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const TimelineItem: React.FC<
  TimelineEvent & { onImageClick: (src: string) => void; isRTL: boolean }
> = ({
  year,
  title,
  description,
  imagePath,
  imageAlt,
  warehouses,
  teus,
  isLeft,
  onImageClick,
  isRTL,
}) => (
  <>
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className={`relative mb-20 flex flex-col md:flex-row items-center w-full ${
        isLeft ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      <div className="w-full md:w-1/2 px-4 md:px-6 mb-6 md:mb-0">
        <div
          className="relative w-full h-56 md:h-64 rounded-xl overflow-hidden shadow-lg cursor-pointer group"
          onClick={() => onImageClick(imagePath)}
        >
          <img
            src={imagePath}
            alt={imageAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      </div>

      <div className="hidden md:block">
        <TimelinePoint year={year} />
      </div>

      <div
        className={`w-full md:w-1/2 px-4 md:px-6 ${
          isLeft
            ? isRTL
              ? "md:mr-10"
              : "md:ml-10"
            : isRTL
            ? "md:ml-10"
            : "md:mr-10"
        }`}
      >
        <div
          className={`p-5 md:p-6 rounded-2xl shadow-lg border-l-4 ${
            isRTL ? "text-right" : "text-left"
          }`}
          style={{
            background: "linear-gradient(145deg, #262F61, #1F2A5A)",
            borderColor: "#F27141",
            boxShadow: "0 8px 25px -5px rgba(242, 113, 65, 0.25)",
            ...(isRTL && {
              borderLeft: "none",
              borderRight: "4px solid #F27141",
            }),
          }}
        >
          <h3 className="text-xl md:text-2xl font-bold mb-2">{title}</h3>
          <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
            {description}
          </p>

          {/* Stats Grid */}
          {(warehouses !== undefined || teus !== undefined) && (
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 mt-4">
              {warehouses !== undefined && (
                <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-lg p-3 md:p-4 border border-white/10">
                  <div className="text-xs md:text-sm text-gray-400 mb-1 uppercase tracking-wide">
                    {isRTL ? "المستودعات" : "Warehouses"}
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-[#F27141]">
                    {warehouses.toLocaleString()}
                  </div>
                </div>
              )}
              {teus !== undefined && (
                <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-lg p-3 md:p-4 border border-white/10">
                  <div className="text-xs md:text-sm text-gray-400 mb-1 uppercase tracking-wide">
                    {isRTL ? "الحاويات القياسية" : "TEUs"}
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-[#F27141]">
                    {teus.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}

          <span className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-[#F27141]">
            {year}
          </span>
        </div>
      </div>
    </motion.div>

    <div className="block md:hidden w-full border-b border-gray-700 mt-10 mb-6 opacity-70"></div>
  </>
);

const SDESStoryline: React.FC = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const headerTranslations = translations[language].sdesStoryline.header;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [timelineStats, setTimelineStats] = useState<TimelineStats>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch timeline API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/timelinenumbers?populate=*&locale=${language}`
        );
        const data = await response.json();

        if (data.data?.[0]?.Timeline) {
          setTimelineStats(data.data[0].Timeline);
        }
      } catch (error) {
        console.error("Error fetching timeline stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [language]);

  // Map timeline API
  const timelineEvents: TimelineEvent[] = Object.entries(timelineStats).map(
    ([year, data]: [string, any], index) => ({
      year: parseInt(year),
      title: data.title || "",
      description: data.description || "",
      imagePath: images[index],
      imageAlt: `Image ${year}`,
      warehouses: data.warehouses,
      teus: data.teus,
    })
  );

  return (
    <section
      id="sdes-storyline"
      className="relative py-16 md:py-24 overflow-hidden text-white bg-[#262F61]"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Pattern />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="font-semibold text-sm md:text-lg uppercase tracking-widest mb-1 text-[#F27141]">
            {headerTranslations.subtitle}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold">
            {headerTranslations.title}
          </h2>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div
              className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-[3px] z-0"
              style={{
                background:
                  "linear-gradient(to bottom, #F27141, #B82227, #262F61)",
              }}
            />

            {/* Timeline Events */}
            {timelineEvents.map((event, i) => (
              <TimelineItem
                key={event.year}
                {...event}
                isLeft={i % 2 === 0}
                onImageClick={setSelectedImage}
                isRTL={isRTL}
              />
            ))}
          </div>
        )}

        <div className="w-full h-1 bg-white/10 rounded-full mt-10" />
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageSrc={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </section>
  );
};

export default SDESStoryline;
