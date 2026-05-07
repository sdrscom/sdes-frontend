import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Pattern from "../../components/Pattern/Pattern";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../locales/translations";

interface NewsItem {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: string | any[];
  image?: { url: string } | null;
  publishedAt: string;
  createdAt?: string;
  author?: string;
}

const NewsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const currentTranslations = translations[language].newsDetailPage;

  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true);
    fetchNewsData();
  }, [id, language]);

  const fetchNewsData = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/news-collections?populate=*&locale=${language}`
      );

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const allNews = data.data;

        const current = allNews.find(
          (item: NewsItem) => item.documentId === id
        );
        setNewsItem(current || null);

        const related = allNews
          .filter((item: NewsItem) => item.documentId !== id)
          .slice(0, 3);
        setRelatedNews(related);
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

  const extractFullContent = (content: any): string => {
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
        .join("\n\n");
    }

    return "";
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

  if (!newsItem) {
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
          <div className="text-8xl mb-6">📰</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {currentTranslations.notFound.title}
          </h2>
          <p className="text-gray-400 mb-6">
            {currentTranslations.notFound.description}
          </p>
          <button
            onClick={() => navigate("/news")}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            {currentTranslations.notFound.button}
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(newsItem.image);
  const fullContent = extractFullContent(newsItem.content);

  return (
    <section
      className="relative min-h-screen py-24 overflow-hidden pt-32"
      style={{
        background: "linear-gradient(to bottom right, #262f61, #2D3B76)",
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Pattern />

      <div className="relative max-w-5xl mx-auto px-6 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Back Button */}
        <button
          onClick={() => navigate("/news")}
          className={`mb-8 flex items-center gap-2 text-gray-300 hover:text-white ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <span>{isRTL ? "→" : "←"}</span>
          {currentTranslations.backButton}
        </button>

        {/* Article Header */}
        <div
          className={`mb-12 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards] [animation-delay:0s] ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          <div
            className={`flex items-center gap-4 mb-6 flex-wrap ${
              isRTL ? "justify-end flex-row-reverse" : "justify-start"
            }`}
          >
            <span
              className="px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg uppercase"
              style={{ backgroundColor: "#F27141" }}
            >
              {newsItem.slug}
            </span>
            <span className="text-gray-400 text-sm">
              📅 {formatDate(newsItem.publishedAt)}
            </span>
            {newsItem.author && (
              <span className="text-gray-400 text-sm">{newsItem.author}</span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {newsItem.title}
          </h1>

          <div
            className={`h-1 w-24 rounded-full ${isRTL ? "mr-0" : "ml-0"}`}
            style={{
              background: "linear-gradient(to right, #F27141, #B82227)",
            }}
          ></div>
        </div>

        {/* Featured Image */}
        <div
          className="mb-12 rounded-3xl overflow-hidden opacity-0 animate-[fadeIn_0.6s_ease-out_0.2s_forwards]"
          style={{ background: "rgba(255, 255, 255, 0.05)" }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={newsItem.title}
              className="w-full h-96 object-cover"
            />
          ) : (
            <div className="h-96 flex items-center justify-center text-9xl text-white/20">
              📰
            </div>
          )}
        </div>

        {/* Article Content */}
        <div
          className={`rounded-3xl p-8 md:p-12 mb-16 opacity-0 animate-[fadeIn_0.6s_ease-out_0.4s_forwards]`}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div
            className={`prose prose-invert prose-lg max-w-none ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {fullContent.split("\n\n").map((paragraph, index) => (
              <p
                key={index}
                className={`text-gray-200 leading-relaxed mb-6 text-lg ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div
            className={`mb-16 opacity-0 animate-[fadeIn_0.6s_ease-out_0.6s_forwards] ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            <h2 className="text-3xl font-bold text-white mb-8">
              {currentTranslations.relatedNews.title}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedNews.map((item) => {
                const relatedImageUrl = getImageUrl(item.image);

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl overflow-hidden cursor-pointer"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                    onClick={() => {
                      navigate(`/news/${item.documentId}`);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <div className="h-40 bg-white/5 flex items-center justify-center">
                      {relatedImageUrl ? (
                        <img
                          src={relatedImageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-5xl text-white/30">📰</div>
                      )}
                    </div>
                    <div
                      className={`p-5 ${isRTL ? "text-right" : "text-left"}`}
                    >
                      <span
                        className="inline-block px-2 py-1 rounded text-xs font-bold text-white mb-3 uppercase"
                        style={{ backgroundColor: "#F27141" }}
                      >
                        {item.slug}
                      </span>
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {formatDate(item.publishedAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="w-full h-1 bg-white/10 rounded-full"></div>
      </div>
    </section>
  );
};

export default NewsDetailPage;
