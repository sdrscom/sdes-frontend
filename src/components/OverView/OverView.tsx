import OverView from "../../assets/Logistics.jpg";

export default function WhyChooseUsSection() {
  const progressBars = [
    { label: "Shipping Knowledge", percentage: 97 },
    { label: "Worker Expertise", percentage: 95 },
    { label: "On-Time Progress", percentage: 93 },
    { label: "Safety & Guarantee", percentage: 96 },
  ];

  return (
    <section className="py-16 bg-bgBase">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side */}
            <div className="space-y-8">
              <div>
                <div className="font-bold text-lg tracking-widest uppercase mb-4 text-section">
                  WHY CHOOSE US
                </div>
                <h2 className="lg:text-5xl sm:text-5xl font-bold text-primaryText mb-6 leading-tight w-10/12">
                  Modern Logistic Partner
                </h2>
                <p className="text-secondaryFont leading-relaxed mb-8">
                  Praesent volutpat tempor ligula vel pulvinar. Nullam sed erat
                  finibus, accumsan sed sapien eu, laoreet lorem. Donec vel
                  facilisis sapien, sed pulvinar lectus sed. Praesent et dictum
                  sed dolor nec condimentum sed volutpat nec.
                </p>
              </div>

              {/* Progress Bars */}
              <div className="space-y-6">
                {progressBars.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-primaryText">
                        {item.label}
                      </span>
                      <span className="font-bold text-primaryText">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-primaryAlt h-3 transition-all duration-1000 ease-out"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div className="relative">
              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 bg-bgBase py-6">
                <div className="bg-bgBase p-6 shadow-md">
                  <h3 className="font-bold text-xl text-primaryText mb-3">
                    Our Vision
                  </h3>
                  <p className="text-secondaryFont text-sm leading-relaxed">
                    Ut elit tellus luctus nec ullamcorper mattis, pulvinar
                    dapibus leo.
                  </p>
                </div>
                <div className="bg-bgBase p-6 shadow-md">
                  <h3 className="font-bold text-xl text-primaryText mb-3">
                    Our Mission
                  </h3>
                  <p className="text-secondaryFont text-sm leading-relaxed">
                    Ut elit tellus luctus nec ullamcorper mattis, pulvinar
                    dapibus leo.
                  </p>
                </div>
              </div>

              {/* Main Image */}
              <div className="relative">
                <div
                  style={{
                    backgroundImage: `url(${OverView})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  className="w-full h-[300px] sm:h-[500px] lg:h-[400px] relative z-10"
                />

                <div className="absolute -bottom-10 -right-5 w-32 h-32 bg-primaryAlt"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
