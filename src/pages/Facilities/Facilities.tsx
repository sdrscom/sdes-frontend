import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FacilitiesOverview from "../../components/Facilities/FacilitiesOverview";
import PreBuiltWarehouses from "../../components/Facilities/PreBuiltWarehouses";
import BuiltToSuitWarehouses from "../../components/Facilities/BuiltToSuitWarehouses";

gsap.registerPlugin(ScrollTrigger);

const FacilitiesPage: React.FC = () => {
  const warehousesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (warehousesRef.current) {
      gsap.fromTo(
        warehousesRef.current.querySelectorAll(".warehouse-card"),
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: warehousesRef.current,
            start: "top 80%",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#E8EAED" }}>
      <FacilitiesOverview />

      <div ref={warehousesRef} className="max-w-7xl mx-auto px-6 py-20">
        <PreBuiltWarehouses
          warehouses={[
            {
              size: 360,
              categoryKey: "small",
              featureKeys: ["idealSpare", "quickAccess", "costEffective"],
            },
            {
              size: 540,
              categoryKey: "medium",
              featureKeys: [
                "machineryStorage",
                "assemblySpace",
                "flexibleLayout",
              ],
            },
            {
              size: 900,
              categoryKey: "large",
              featureKeys: [
                "oilGasEquipment",
                "heavyMachinery",
                "multipleZones",
              ],
            },
            {
              size: 1200,
              categoryKey: "extraLarge",
              featureKeys: ["bulkStorage", "distributionHub", "customSections"],
            },
          ]}
        />
      </div>

      <BuiltToSuitWarehouses
        benefitKeys={["customizable", "expand", "specialized", "designed"]}
      />
    </div>
  );
};

export default FacilitiesPage;
