import { Search } from "lucide-react";
import img1 from "../../assets/img1.jpg";
import img2 from "../../assets/img2.jpg";
import img3 from "../../assets/img3.jpg";
import img4 from "../../assets/img4.jpg";
import img5 from "../../assets/img5.jpg";
import img6 from "../../assets/img6.jpg";

export default function TypesOfGoods() {
  const goodsData = [
    {
      id: 1,
      title: "Vehicle",
      image: img1,
      hasButton: true,
    },
    {
      id: 2,
      title: "Industrial Equipment",
      image: img2,
      hasButton: false,
    },
    {
      id: 3,
      title: "Consumer Goods",
      image: img3,
      hasButton: false,
    },
    {
      id: 4,
      title: "Raw Materials",
      image: img4,
      hasButton: false,
    },
    {
      id: 5,
      title: "Energy Solutions",
      image: img5,
      hasButton: false,
    },
    {
      id: 6,
      title: "Specialized Storage",
      image: img6,
      hasButton: false,
    },
  ];

  return (
    <section className="bg-bgBase py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-section text-md font-bold uppercase tracking-wider mb-4">
            TYPES OF GOODS
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-primaryText mb-6">
            We Are a Safe Shipper
          </h2>
          <p className="text-secondaryFont text-lg max-w-4xl mx-auto leading-relaxed">
            Sed auctor gravida nibh at aliquam. Nulla sit amet consequat diam.
            Nulla sed nisl ut nisl facilisis malesuada. Nunc nec tempus lacus.
            Cras in egestas metus. Etiam molestie rutrum purus.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {goodsData.map((item, index) => {
            const isThirdInPattern = (index + 1) % 3 === 0;
            const mediumScreenClass = isThirdInPattern
              ? "md:col-span-2"
              : "md:col-span-1";

            return (
              <div
                key={item.id}
                className={`relative group overflow-hidden shadow-lg ${mediumScreenClass} lg:col-span-2`}
              >
                {/* aspect-[4/2.2] overflow-hidden */}
                <div className="">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* pverlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primaryMain to-transparent flex items-end justify-center pb-4 sm:pb-2 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition duration-700 ease-out">
                  <div className="text-center text-white px-2 flex flex-col items-center gap-2 sm:gap-3 md:gap-4">
                    <div className="-translate-y-8 group-hover:translate-y-0 transition duration-700 ease-out border border-white rounded-full p-2 bg-black/30">
                      <Search className="w-6 h-6 md:w-5 md:h-5 text-white" />
                    </div>

                    <h3 className="text-base md:text-lg font-semibold">
                      {item.title}
                    </h3>

                    <button className="bg-primaryAlt hover:bg-primaryAltHover text-white font-medium uppercase tracking-wide transition duration-300 text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2">
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
