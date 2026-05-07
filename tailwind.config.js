/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  extend: {
    colors: {
      mainBg: "#262f61", // Main Background - Dark Blue
      bgBase: "#FFFFFF", // Pure White for cards
      bgSecondary: "#F8F9FA", // Light gray for alternate sections

      // Text Colors
      textMain: "#FFFFFF", // White text on dark backgrounds
      textSecondary: "#E8EAED", // Light gray text for secondary content on dark bg
      textDark: "#2D3B76", // Dark blue text for light backgrounds

      // Primary Colors
      primaryMain: "#2D3B76", // Dark blue
      primaryText: "#37448C", // Medium blue for emphasis
      primaryMainHover: "#162472", // Darker blue for hover

      // Accent Colors
      primaryAlt: "#B82227", // Red accent (from logo)
      primaryAltHover: "#9b1c20", // Dark red for hover
      section: "#F27141", // Orange for section headers

      // UI Elements
      borderLight: "#4A5578", // Light border on dark bg
      borderDark: "#E0E0E0", // Border on light bg
      cardBg: "#FFFFFF", // Card background
      navLinks: "#B8BFCC", // Light gray for nav links on dark bg
    },
  },
  theme: {
    extend: {
      colors: {
        mainBg: "#262f61;", // Main BackGround
        bgBase: "#D9D9D9", // white
        textMain: "#37448C", // blue for text
        primaryMain: "#2D3B76", // dark blue but not for text
        primaryText: "#37448C", // dark blue for text
        primaryMainHover: "#162472", // dark blue for hover
        primaryAlt: "#B82227", // red (ref: logo)
        primaryAltHover: "#9b1c20", // dark orange for hover
        secondaryFont: "#6A6A6A", // gray
        section: "#F27141", // light orange for section's headrs
        navLinks: "#A9A9A9",
      },
    },
  },
  plugins: [],
};
