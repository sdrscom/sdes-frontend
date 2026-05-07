import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Pattern from "../../components/Pattern/Pattern";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../locales/translations";

interface NewsItem {
  id: number;
  title: string;
  documentId: string;
  slug: string;
  content: string | any[];
  image?: { url: string } | null;
  publishedAt: string;
  createdAt?: string;
}

const NewsPage = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isRTL = language === "ar";

  const currentTranslations = translations[language].newsPage;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchNews();
  }, [language]);

  const fetchNews = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/news-collections?populate=*&locale=${language}`
      );

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        setNews(data.data);
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err) {
      console.error("Error fetching news:", err);
      await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image?: { url: string } | null) => {
    if (!image?.url) return null;
    return image.url.startsWith("http") ? image.url : `${API_URL}${image.url}`;
  };

  const formatDate = (dateString: string) => {
    const locale = language === "ar" ? "ar-SA" : "en-US";
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const extractTextContent = (content: any): string => {
    if (typeof content === "string") {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .filter((block) => block.type === "paragraph")
        .map((block) => {
          if (block.children && Array.isArray(block.children)) {
            return block.children
              .map((child: any) => child.text || "")
              .join("");
          }
          return "";
        })
        .join(" ")
        .slice(0, 150);
    }

    return "";
  };

  const truncateText = (text: string, length: number = 150) => {
    return text.length > length ? text.slice(0, length) + "..." : text;
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(to bottom right, #262f61, #2D3B76)",
        }}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <Pattern />
        <div className="text-center relative z-10">
          <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-2xl font-semibold mb-2">
            {currentTranslations.loading.title}
          </p>
          <p className="text-gray-400 text-sm">
            {currentTranslations.loading.subtitle}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section
      className="relative min-h-screen py-24 overflow-hidden pt-32"
      style={{
        background: "linear-gradient(to bottom right, #262f61, #2D3B76)",
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Pattern />

      <div className="relative max-w-7xl mx-auto px-6 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Section Header */}
        <div className="text-center mb-20 relative">
          <span className="font-semibold text-sm uppercase tracking-wider text-orange-500">
            {currentTranslations.header.subtitle}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-6 text-white relative z-10">
            {currentTranslations.header.title}
            <div className="pt-5">
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 sm:h-[5px] w-1/3 rounded shadow-lg opacity-70"
                style={{
                  background: "linear-gradient(to right, #F27141, #B82227)",
                }}
              ></span>
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 sm:h-[5px] w-1/3 rounded-full blur-sm opacity-70"
                style={{
                  background: "linear-gradient(to right, #F27141, #B82227)",
                }}
              ></span>
            </div>
          </h2>

          <p className="text-lg max-w-3xl mx-auto text-gray-200 mt-8">
            {currentTranslations.header.description}
          </p>
        </div>

        {/* News Grid or Empty State */}
        {news.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6 opacity-30">📰</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {currentTranslations.emptyState.title}
            </h3>
            <p className="text-gray-300">
              {currentTranslations.emptyState.description}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {news.map((item, index) => {
              const imageUrl = getImageUrl(item.image);
              const contentText = extractTextContent(item.content);
              const excerpt = truncateText(contentText);
              const date = formatDate(item.publishedAt);

              return (
                <div
                  key={item.id}
                  className="rounded-3xl overflow-hidden cursor-pointer opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    animationDelay: `${index * 0.1}s`,
                  }}
                  onClick={() => navigate(`/news/${item.documentId}`)}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-white/5 overflow-hidden flex items-center justify-center">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl text-white/30">📰</div>
                    )}

                    <div
                      className={`absolute top-4 ${
                        isRTL ? "right-4" : "left-4"
                      }`}
                    >
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg uppercase"
                        style={{ backgroundColor: "#F27141" }}
                      >
                        {item.slug}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-6 ${isRTL ? "text-right" : "text-left"}`}>
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-xs text-gray-400 flex items-center gap-2">
                        📅 {date}
                      </span>
                      <span className="text-orange-500 text-sm font-semibold">
                        {currentTranslations.card.readMore}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="w-full h-1 bg-white/10 rounded-full mt-10"></div>
      </div>
    </section>
  );
};

export default NewsPage;
