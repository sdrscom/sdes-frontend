import { Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../locales/translations";
import logo from "../../assets/Footer-logo.png";

export default function Footer() {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const currentTranslations = translations[language].footer;

  const styles = {
    links: "text-gray-300 hover:text-white transition-colors flex items-center",
    spanLinks: "text-primaryAlt",
    infoIcons:
      "w-10 h-10 border-2 border-primaryAlt rounded-full flex items-center justify-center flex-shrink-0",
  };

  return (
    <footer
      className="bg-primaryMain text-white py-16 px-6 lg:px-12"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <div
              className={`mb-6 ${
                isRTL ? "flex justify-end" : "flex justify-start"
              }`}
            >
              <img
                src={logo}
                alt="Logo"
                className="w-[14rem] lg:w-[16rem] min-w-[18rem] h-auto p-3"
              />
            </div>
            <p
              className={`text-gray-300 text-sm leading-relaxed ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {currentTranslations.description}
            </p>
          </div>

          {/* Quick Links */}
          <div className={isRTL ? "text-right" : "text-left"}>
            <h3 className="text-lg font-semibold mb-6">
              {currentTranslations.quickLinks.title}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className={styles.links}>
                  <span
                    className={`${styles.spanLinks} ${isRTL ? "ml-2" : "mr-2"}`}
                  >
                    {isRTL ? "❮" : "❯"}
                  </span>
                  {currentTranslations.quickLinks.home}
                </a>
              </li>
              <li>
                <a href="/investment" className={styles.links}>
                  <span
                    className={`${styles.spanLinks} ${isRTL ? "ml-2" : "mr-2"}`}
                  >
                    {isRTL ? "❮" : "❯"}
                  </span>
                  {currentTranslations.quickLinks.overview}
                </a>
              </li>
              <li>
                <a href="/facilities" className={styles.links}>
                  <span
                    className={`${styles.spanLinks} ${isRTL ? "ml-2" : "mr-2"}`}
                  >
                    {isRTL ? "❮" : "❯"}
                  </span>
                  {currentTranslations.quickLinks.facilities}
                </a>
              </li>
              <li>
                <a href="/services" className={styles.links}>
                  <span
                    className={`${styles.spanLinks} ${isRTL ? "ml-2" : "mr-2"}`}
                  >
                    {isRTL ? "❮" : "❯"}
                  </span>
                  {currentTranslations.quickLinks.services}
                </a>
              </li>
              <li>
                <a href="/about" className={styles.links}>
                  <span
                    className={`${styles.spanLinks} ${isRTL ? "ml-2" : "mr-2"}`}
                  >
                    {isRTL ? "❮" : "❯"}
                  </span>
                  {currentTranslations.quickLinks.about}
                </a>
              </li>
              <li>
                <a href="/location" className={styles.links}>
                  <span
                    className={`${styles.spanLinks} ${isRTL ? "ml-2" : "mr-2"}`}
                  >
                    {isRTL ? "❮" : "❯"}
                  </span>
                  {currentTranslations.quickLinks.location}
                </a>
              </li>
              <li>
                <a href="/news" className={styles.links}>
                  <span
                    className={`${styles.spanLinks} ${isRTL ? "ml-2" : "mr-2"}`}
                  >
                    {isRTL ? "❮" : "❯"}
                  </span>
                  {currentTranslations.quickLinks.news}
                </a>
              </li>
              <li>
                <a href="/faqs" className={styles.links}>
                  <span
                    className={`${styles.spanLinks} ${isRTL ? "ml-2" : "mr-2"}`}
                  >
                    {isRTL ? "❮" : "❯"}
                  </span>
                  {currentTranslations.quickLinks.faqs}
                </a>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div
            className={`lg:col-span-2 ${isRTL ? "text-right" : "text-left"}`}
          >
            <h3 className="text-lg font-semibold mb-6">
              {currentTranslations.information.title}
            </h3>
            <div className="space-y-4">
              {/* Phone */}
              <div className="flex items-start">
                <div
                  className={`${styles.infoIcons} ${
                    isRTL ? "ml-3 order-1" : "mr-3 order-1"
                  }`}
                >
                  <Phone size={16} className="text-primaryAlt" />
                </div>
                <div className={isRTL ? "order-2" : "order-2"}>
                  <p className="font-semibold">
                    {currentTranslations.information.phone}
                  </p>
                  <p className="text-gray-300 text-sm">+966 13 813 4214</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start">
                <div
                  className={`${styles.infoIcons} ${
                    isRTL ? "ml-3 order-1" : "mr-3 order-1"
                  }`}
                >
                  <Mail size={16} className="text-primaryAlt" />
                </div>
                <div className={isRTL ? "order-2" : "order-2"}>
                  <p className="font-semibold">
                    {currentTranslations.information.email}
                  </p>
                  <a href="mailto:info@sdrs.com.sa">
                    <p className="text-gray-300 text-sm">info@sdrs.com.sa</p>
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start">
                <div
                  className={`${styles.infoIcons} ${
                    isRTL ? "ml-3 order-1" : "mr-3 order-1"
                  }`}
                >
                  <MapPin size={16} className="text-primaryAlt" />
                </div>
                <div className={isRTL ? "order-2" : "order-2"}>
                  <p className="font-semibold">
                    {currentTranslations.information.address}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {currentTranslations.information.addressLine1}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {currentTranslations.information.addressLine2}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primaryAlt">
          <p className="text-center text-gray-400 text-sm">
            {currentTranslations.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
