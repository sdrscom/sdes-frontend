import { Truck, Globe, Building, Users } from "lucide-react";
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import StatsBg from "../../assets/statsBg.jpg";

export default function Stats() {
  const stats = [
    {
      icon: Truck,
      number: 750,
      suffix: "K",
      label: "Delivered Goods",
    },
    {
      icon: Globe,
      number: 90,
      suffix: "+",
      label: "Countries Covered",
    },
    {
      icon: Building,
      number: 200,
      suffix: "+",
      label: "Office Worldwide",
    },
    {
      icon: Users,
      number: 1200,
      suffix: "+",
      label: "Satisfied Clients",
    },
  ];

  // detect when the ststs section comes into view
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section
      ref={ref}
      className="py-20 relative bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: `url(${StatsBg})`,
      }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-blue-900 bg-opacity-50 z-0"></div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center text-white">
                <div className="mb-4 flex justify-center">
                  <IconComponent className="w-16 h-16 text-section" />
                </div>
                <div className="mb-2">
                  <span className="lg:text-5xl sm:text-6xl font-bold">
                    {inView ? (
                      <CountUp 
                        start={0} 
                        end={stat.number} 
                        duration={2.5} 
                        separator=","
                      />
                    ) : (
                      0
                    )}
                  </span>
                  <sup className="lg:text-3xl sm:text-2xl font-bold ml-2">
                    {stat.suffix}
                  </sup>
                </div>
                <h3 className="text-xl font-semibold">{stat.label}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}