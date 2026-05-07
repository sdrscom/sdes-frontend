import React from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface GradientButtonProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  to?: string;
  href?: string;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  onClick,
  className = "",
  children,
  to,
  href,
}) => {
  const baseClasses = `
    group relative text-white px-5 sm:px-6 md:px-7 lg:px-8 py-2.5 sm:py-3 md:py-3.5 lg:py-4 
    rounded-lg sm:rounded-xl md:rounded-2xl text-sm sm:text-base md:text-lg font-semibold 
    shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 
    focus:outline-none focus:ring-4 overflow-hidden w-full sm:w-auto 
    inline-flex items-center justify-center gap-2 md:gap-3 ${className}
  `;

  const style = {
    background: "linear-gradient(to right, #B82227, #F27141)",
    boxShadow: "0 4px 6px rgba(184, 34, 39, 0.3)",
  };

  const isArabic = document.documentElement.dir === "rtl";

  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const shinyEffect = (
    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
  );

  const content = (
    <>
      {shinyEffect}
      <span className="flex items-center justify-center gap-2 md:gap-3 relative z-10">
        {children}
        <ArrowIcon className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </>
  );

  if (to) {
    return (
      <a href={to} className={baseClasses} style={style} role="button">
        {content}
      </a>
    );
  }

  if (href) {
    return (
      <a href={href} className={baseClasses} style={style}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses} style={style}>
      {content}
    </button>
  );
};

export default GradientButton;
