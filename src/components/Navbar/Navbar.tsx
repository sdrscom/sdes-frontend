import { useState, useEffect, useRef } from "react";
import { ChevronDown, Menu, X, LogIn } from "lucide-react";
import logo from "../../assets/Logo-1.png";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../locales/translations";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language].navbar;

  const [activeLink, setActiveLink] = useState(t.home);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>(
    []
  );
  const indicatorRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const navItems = [
    { name: t.home, href: "/" },
    { name: t.services, href: "/services" },
    { name: t.facilities, href: "/facilities" },
    { name: t.overview, href: "/investment" },
    {
      name: t.aboutUs,
      href: "/",
      dropdown: [
        { name: t.about, href: "/about" },
        { name: t.location, href: "/location" },
        { name: t.faqs, href: "/faqs" },
      ],
    },
    { name: t.news, href: "/news" },
  ];

  useEffect(() => {
    const currentPath = location.pathname;

    const mainItem = navItems.find((item) => item.href === currentPath);
    if (mainItem) {
      setActiveLink(mainItem.name);
      return;
    }

    for (const item of navItems) {
      if (item.dropdown) {
        const dropMatch = item.dropdown.find(
          (dropItem) => dropItem.href === currentPath
        );
        if (dropMatch) {
          setActiveLink(item.name);
          return;
        }
      }
    }

    if (currentPath === "/") setActiveLink(t.home);
  }, [location.pathname, language]);

  // Handle scroll show/hide
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(!(currentScrollY > lastScrollY && currentScrollY > 100));
      setIsScrolled(currentScrollY > 80);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Move underline indicator
  useEffect(() => {
    const activeEl = navLinksRef.current.find(
      (el) => el?.textContent === activeLink
    );
    const indicator = indicatorRef.current;

    if (activeEl && indicator) {
      const rect = activeEl.getBoundingClientRect();
      const parentRect = navRef.current?.getBoundingClientRect() ?? {
        left: 0,
        bottom: 0,
      };
      indicator.style.width = `${rect.width - 32}px`;
      indicator.style.left = `${rect.left - parentRect.left + 16}px`;
    }
  }, [activeLink]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) setActiveDropdown(null);

    if (mobileMenuRef.current) {
      mobileMenuRef.current.style.height = isMenuOpen ? "0" : "auto";
      mobileMenuRef.current.style.opacity = isMenuOpen ? "0" : "1";
    }
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleLinkClick = (name: string) => {
    setActiveLink(name);
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleLogin = () => {
    window.open("http://62.149.77.120:8011/account/login", "_blank");
  };
  const handleOperationPortal = () => {
    window.open("http://62.149.77.120:8012/login", "_blank");
  };
  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-white"
      } ${
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "-translate-y-20 opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative flex items-center w-full justify-between">
        {/* Logo */}
        <div className="p-2">
          <a href="/">
            <img
              src={logo}
              alt="Logo"
              className="w-[13rem] lg:w-[14rem] min-w-[13rem] transition-transform origin-left cursor-pointer"
            />
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1 flex-1 px-6 relative">
          {navItems.map((item) => (
            <div key={item.name} className="relative group">
              {item.dropdown ? (
                <>
                  <button
                    onClick={() => handleLinkClick(item.name)}
                    className={`relative px-4 py-6 flex items-center gap-2 font-semibold whitespace-nowrap transition-all duration-300
              ${
                activeLink === item.name ? "text-primaryAlt" : "text-gray-800"
              }`}
                  >
                    <span className="relative z-10 group-hover:text-primaryAlt transition-colors duration-300">
                      {item.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-primaryAlt transition-transform duration-400 group-hover:rotate-180 relative z-10" />

                    {/* underline */}
                    <span
                      className={`absolute bottom-2 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-primaryAlt to-primaryAltHover transition-all duration-500
                ${
                  activeLink === item.name ? "w-3/4" : "w-0 group-hover:w-3/4"
                }`}
                    />
                  </button>

                  {/* dropdown list */}
                  <div className="absolute mt-0 w-52 bg-white shadow-2xl rounded-xl invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 overflow-hidden border border-borderDark/50 transform group-hover:translate-y-0 translate-y-2">
                    <ul className="py-2">
                      {item.dropdown.map((dropItem, idx) => (
                        <li key={idx}>
                          <a
                            href={dropItem.href}
                            className="block px-5 py-3 text-textDark hover:bg-gradient-to-r hover:from-primaryAlt/10 hover:to-primaryAlt/5 hover:text-primaryAlt font-medium transition-all duration-300 hover:pl-7 relative group/item"
                          >
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 w-0 h-0.5 bg-primaryAlt group-hover/item:w-2 transition-all duration-300" />
                            {dropItem.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <a
                  href={item.href}
                  onClick={() => handleLinkClick(item.name)}
                  className={`relative px-4 py-6 font-semibold whitespace-nowrap transition-all duration-300
            ${activeLink === item.name ? "text-primaryAlt" : "text-gray-800"}`}
                >
                  <span className="relative z-10 group-hover:text-primaryAlt transition-colors duration-300">
                    {item.name}
                  </span>

                  {/* underline */}
                  <span
                    className={`absolute bottom-2 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-primaryAlt to-primaryAltHover transition-all duration-500
              ${activeLink === item.name ? "w-3/4" : "w-0 group-hover:w-3/4"}`}
                  />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3 px-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-gray-300 hover:bg-primaryAlt/20 transition-all duration-300 text-gray-800 font-semibold"
          >
            <span>{language === "en" ? "AR" : "EN"}</span>
          </button>

          <button
            onClick={handleLogin}
            className="group relative flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(to right, #B82227, #F27141)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <LogIn className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{t.login}</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex px-4">
          <button
            onClick={toggleMenu}
            className="text-gray-800 border-2 border-primaryAlt transition-all duration-300 p-2.5 rounded-lg hover:bg-primaryAlt/10 hover:scale-105 active:scale-95"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className="lg:hidden overflow-hidden transition-all duration-300"
        style={{
          height: isMenuOpen ? "auto" : "0",
          opacity: isMenuOpen ? 1 : 0,
        }}
      >
        <div className="px-4 py-6 bg-black/70 backdrop-blur-md">
          <div className="space-y-2">
            {navItems.map((item) => (
              <div key={item.name} className="mobile-menu-item">
                {item.dropdown ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`w-full flex items-center justify-between py-3 px-4 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 active:scale-98 ${
                        activeLink === item.name
                          ? "text-primaryAlt bg-primaryAlt/10"
                          : "text-white hover:text-primaryAlt hover:bg-primaryAlt/10"
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-primaryAlt transition-transform duration-400 ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {activeDropdown === item.name && (
                      <div className="ml-4 mt-2 space-y-1 overflow-hidden">
                        {item.dropdown.map((dropItem, idx) => (
                          <a
                            key={idx}
                            href={dropItem.href}
                            className="block py-2.5 px-4 text-white hover:text-primaryAlt hover:bg-primaryAlt/10 rounded-lg transition-all duration-300 font-medium border-l-2 border-primaryAlt/20 hover:border-primaryAlt hover:pl-5 whitespace-nowrap"
                            onClick={() => handleLinkClick(dropItem.name)}
                          >
                            {dropItem.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.href}
                    onClick={() => handleLinkClick(item.name)}
                    className={`block py-3 px-4 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 active:scale-98 ${
                      activeLink === item.name
                        ? "text-primaryAlt bg-primaryAlt/10"
                        : "text-white hover:text-primaryAlt hover:bg-primaryAlt/10"
                    }`}
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}

            {/* Mobile Login Button */}
            <button
              onClick={handleLogin}
              className="w-full group relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 overflow-hidden shadow-lg mt-4"
              style={{
                background: "linear-gradient(to right, #B82227, #F27141)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <LogIn className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{t.login}</span>
            </button>

            {/* Mobile Language toggle */}
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold transition-all duration-300 bg-white/5 hover:bg-primaryAlt/10 text-white border border-white/10 mt-4"
            >
              <span>Switch to {language === "en" ? "العربية" : "English"}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
