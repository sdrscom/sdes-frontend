import background from "../../assets/shipping.jpg";

export default function ShippingHeroSection() {
  return (
    <section
      className="py-20 relative bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      {/* overlay*/}
      <div className="absolute inset-0 bg-textMain bg-opacity-50 z-0"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-8 w-full mx-auto">
        <h1 className="sm:text-2xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Confused About Choosing The Right
          <br />
          Shipping Service for Your Goods?
        </h1>

        <p className="sm:text-sm text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
          Sed auctor gravida nibh at aliquam. Nulla sit amet consequat diam.
          Nulla sed nisl ut nisl facilisis malesuada. Nunc nec tempus lacus.
          Cras in egestas metus. Etiam molestie rutrum purus.
        </p>

        <button className="bg-primaryAlt hover:bg-primaryAltHover text-white font-semibold px-8 py-4 rounded-none uppercase tracking-wider transition-colors duration-300 text-sm">
          Contact Us
        </button>
      </div>
    </section>
  );
}
