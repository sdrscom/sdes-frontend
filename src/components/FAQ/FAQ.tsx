import React, { useState } from "react";
import Pattern from "../Pattern/Pattern";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../locales/translations";

interface FAQItemData {
  question: string;
  answer: string;
}

interface FAQItemProps extends FAQItemData {
  index: number;
  openIndex: number | null;
  setOpenIndex: (index: number | null) => void;
  isRTL: boolean;
}

const FAQItem: React.FC<FAQItemProps> = ({
  question,
  answer,
  index,
  openIndex,
  setOpenIndex,
  isRTL,
}) => {
  const isOpen = index === openIndex;
  const handleToggle = () => {
    setOpenIndex(isOpen ? null : index);
  };

  const ChevronIcon = isOpen ? "▲" : "▼";

  return (
    <div
      className="mb-3 rounded-lg overflow-hidden transition-all duration-300 shadow-xl"
      style={{
        background: "rgba(38, 47, 97, 0.6)",
        border: isOpen
          ? "1px solid #F27141"
          : "1px solid rgba(242, 113, 65, 0.2)",
        backdropFilter: "blur(5px)",
      }}
    >
      <button
        className={`w-full flex items-center justify-start py-4 px-5 ${
          isRTL ? "text-right" : "text-left"
        } transition-all duration-300`}
        onClick={handleToggle}
        style={{
          color: isOpen ? "#FFFFFF" : "#E8EAED",
          backgroundColor: isOpen ? "rgba(26, 35, 71, 0.7)" : "transparent",
        }}
      >
        <span
          className={`w-5 h-5 flex-shrink-0 text-lg ${
            isRTL ? "ml-4" : "mr-4"
          } font-bold`}
          style={{ color: "#F27141" }}
        >
          {ChevronIcon}
        </span>

        <span className="text-base font-medium md:text-lg">{question}</span>
      </button>

      <div
        className={`overflow-hidden transition-max-height duration-500 ease-in-out ${
          isOpen ? "max-h-[300px]" : "max-h-0"
        }`}
      >
        <p
          className={`px-5 pb-4 pt-3 text-base leading-relaxed ${
            isRTL ? "text-right" : "text-left"
          }`}
          style={{
            color: "#B8BFCC",
            borderTop: "1px solid rgba(242, 113, 65, 0.2)",
          }}
        >
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const currentTranslations = translations[language].faq;
  const faqData = currentTranslations.items;

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className="py-20 md:py-32 bg-mainBg relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Pattern />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="space-y-12">
          <header className={`mb-12 ${isRTL ? "text-right" : "text-left"}`}>
            <h2
              className="text-4xl md:text-5xl font-bold"
              style={{
                background: "linear-gradient(to right, #FFFFFF, #F27141)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {currentTranslations.title}
            </h2>
            <p className="mt-2 text-lg" style={{ color: "#B8BFCC" }}>
              {currentTranslations.subtitle}
            </p>
          </header>

          <div className="space-y-4">
            {faqData.map((item: FAQItemData, index: number) => (
              <FAQItem
                key={index}
                index={index}
                question={item.question}
                answer={item.answer}
                openIndex={openIndex}
                setOpenIndex={setOpenIndex}
                isRTL={isRTL}
              />
            ))}
          </div>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full mt-10"></div>
      </div>
    </section>
  );
};

export default FAQ;
