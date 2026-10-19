import { useCallback, useState } from "react";
import { CalendarCheck } from "lucide-react";
import Pattern from "../Pattern/Pattern";
import { useTranslation } from "react-i18next";
import { useMedia } from "../../cms/useMedia";
import BookAppointmentModal from "../Appointment/BookAppointmentModal";

export default function Hero() {
  const { t } = useTranslation();
  const media = useMedia();
  const [bookingOpen, setBookingOpen] = useState(false);
  const closeBooking = useCallback(() => setBookingOpen(false), []);

  const video = media("home.heroVideo");
  const title = t("hero.title");

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
        {video ? (
          <video
            key={video}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
           <source src={video} type="video/mp4" />
          </video>
        ) : (
          <img
            src={media("home.heroImage", "/hero-bg2.jpg")}
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

        <div className="absolute inset-0 z-10 flex items-center w-full px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          <div className="max-w-7xl">
            <h1 className="uppercase text-white font-bold text-3xl xs:text-4xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 xs:mb-4 sm:mb-4 md:mb-2 tracking-wider sm:tracking-widest leading-tight sm:leading-tight md:leading-tight lg:leading-tight">
              {t("hero.welcome")}
            </h1>

            {title && (
              <h1 className="text-3xl xs:text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold w-full lg:w-10/12 xl:w-9/12 2xl:w-8/12 mb-3 xs:mb-4 sm:mb-4 md:mb-5 lg:mb-6 text-white leading-tight sm:leading-tight md:leading-tight lg:leading-tight">
                {title}
              </h1>
            )}

            {t("hero.description") && (
              <p className="text-white/85 text-base xs:text-lg sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-6 sm:mb-7 lg:mb-8">
                {t("hero.description")}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <a
                href="/services"
                className="bg-[#2D3B76] hover:bg-[#162472] transition-all duration-300 py-3 lg:py-3.5 text-white uppercase px-6 lg:px-8 text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transform w-full sm:w-auto inline-flex items-center justify-center"
              >
                <span className="tracking-widest">{t("hero.services")}</span>
              </a>
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="border border-white/70 hover:bg-white hover:text-[#1A2347] transition-all duration-300 py-3 lg:py-3.5 text-white uppercase px-6 lg:px-8 text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transform w-full sm:w-auto inline-flex items-center justify-center gap-2"
              >
                <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="tracking-widest">{t("hero.bookAppointment")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {bookingOpen && <BookAppointmentModal onClose={closeBooking} />}
    </section>
  );
}
