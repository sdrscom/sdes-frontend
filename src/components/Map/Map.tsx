import {
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  PhoneCall,
  Earth,
  MapPinned,
} from "lucide-react";

export default function GetInTouch() {
  return (
    <section className="relative bg-bgBase pt-20">
      {/* Map */}
      <div className="w-full h-[600px]">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3571.12041514638!2d50.188273699999996!3d26.484067500000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49f0a18a308b6b%3A0x1bfa1e86053af98!2z2KfZhNi02LHZg9ipINin2YTYs9i52YjYr9mK2Kkg2YTZhNiq2LfZiNmK2LEg2YjYrtiv2YXYp9iqINin2YTYqti12K_ZitixINin2YTZhdit2K_ZiNiv2Kk!5e0!3m2!1sar!2seg!4v1752004359719!5m2!1sar!2seg"
          width="100%"
          height="66%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* Contact Information */}
      <div className="absolute top-80 right-0 w-full max-w-sm px-4 sm:max-w-md md:top-2/4 md:right-10 md:left-auto md:translate-x-0 md:max-w-lg lg:top-72 lg:right-20 lg:max-w-md">
        <div className="bg-white shadow-lg p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-primaryMain mb-2">
              Get In Touch
            </h2>
            <p className="text-secondaryFont text-sm sm:text-base leading-relaxed">
              Integer consectetur est ac tincidunt pulvinar. Aliquam in sapien
              venenatis, tincidunt lacus eu fermentum libero. Fusce gravida
              mauris et.
            </p>
          </div>

          {/* Contact List */}
          <ul className="space-y-3 sm:space-y-2 md:flex md:flex-wrap md:gap-x-8 md:gap-y-1 md:space-y-0">
            <li className="flex items-start space-x-2 w-full md:w-40 lg:w-2/5">
              <div className="p-1 rounded-lg">
                <PhoneCall className="w-6 h-6 text-primaryAlt stroke-1" />
              </div>
              <div>
                <h3 className="text-lg text-primaryMain sm:text-base mb-1 font-bold">
                  Phone
                </h3>
                <p className="text-secondaryFont text-sm">+123-234-1234</p>
              </div>
            </li>

            <li className="flex items-start space-x-2 w-full md:w-40 lg:w-2/5">
              <div className="p-1 rounded-lg">
                <Mail className="w-6 h-6 text-primaryAlt stroke-1" />
              </div>
              <div>
                <h3 className="text-lg text-primaryMain sm:text-base mb-1 font-bold">
                  Email
                </h3>
                <p className="text-secondaryFont text-sm">hello@awesomesite.com</p>
              </div>
            </li>

            <li className="flex items-start space-x-2 w-full md:w-40 lg:w-2/5">
              <div className="p-1 rounded-lg">
                <Earth className="w-6 h-6 text-primaryAlt stroke-1" />
              </div>
              <div>
                <h3 className="text-lg text-primaryMain sm:text-base mb-1 font-bold">
                  Website
                </h3>
                <p className="text-secondaryFont text-sm">www.awesomesite.com</p>
              </div>
            </li>

            <li className="flex items-start space-x-2 w-full md:w-40 lg:w-2/5">
              <div className="p-1 rounded-lg">
                <MapPinned className="w-6 h-6 text-primaryAlt stroke-1" />
              </div>
              <div>
                <h3 className="text-lg text-primaryMain sm:text-base mb-1 font-bold">
                  Address
                </h3>
                <p className="text-secondaryFont text-sm">
                  99 Roving St., Big City, PKU 23456
                </p>
              </div>
            </li>
          </ul>

          {/* Social Media icons */}
          <div className="pt-4 md:pt-3 border-t border-primaryAlt m-0">
            <div className="flex space-x-3">
              <div className="p-1.5 bg-primaryMain rounded-full hover:bg-primaryMainHover transition-colors cursor-pointer">
                <Facebook className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="p-1.5 bg-primaryMain rounded-full hover:bg-primaryMainHover transition-colors cursor-pointer">
                <Twitter className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="p-1.5 bg-primaryMain rounded-full hover:bg-primaryMainHover transition-colors cursor-pointer">
                <Instagram className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="p-1.5 bg-primaryMain rounded-full hover:bg-primaryMainHover transition-colors cursor-pointer">
                <Youtube className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}