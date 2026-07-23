import { Routes, Route } from "react-router-dom";
import "./App.css";
import { LanguageProvider } from "./context/LanguageContext";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home/Home";
import Facilities from "./pages/Facilities/Facilities";
import Services from "./pages/Services/Services";
import Investment from "./pages/Investment/Investment";
import About from "./pages/About/About";
import Location from "./pages/Location/Location";
import FAQ from "./components/FAQ/FAQ";
import NewsPage from "./pages/News/NewsPage";
import NewsDetailPage from "./pages/News/NewsDetailPage";
import TrackingPage from "./pages/Tracking/TrackingPage.jsx";
import GalleryPage from "./pages/Gallery/GalleryPage.jsx";
import Chatbot from "./components/Chatbot.jsx";

function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="facilities" element={<Facilities />} />
          <Route path="services" element={<Services />} />
          <Route path="investment" element={<Investment />} />
          <Route path="about" element={<About />} />
          <Route path="location" element={<Location />} />
          <Route path="faqs" element={<FAQ />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="news/:id" element={<NewsDetailPage />} />
          <Route path="track" element={<TrackingPage />} />
          <Route path="gallery" element={<GalleryPage />} />
        </Route>
      </Routes>
      <Chatbot />
    </LanguageProvider>
  );
}

export default App;
