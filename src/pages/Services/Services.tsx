import ServicesHero from "../../components/Services/ServicesHero";
import ServicesSection from "../../components/Services/ServicesSection";
// import WaveSeparator from "../../components/WaveSeparator/WaveSeparator";

ServicesHero;
export default function Services() {
  return (
    <div>
      <ServicesHero />
      {/* <WaveSeparator topColor="#262f61" bottomColor="#262f61" /> */}
      <ServicesSection />
    </div>
  );
}
