import Hero from "../../components/Home/Hero";
import PrimeLocation from "../../components/Home/PrimeLocation";
import TaxBenefits from "../../components/Home/TaxBenefits";
import Services from "../../components/Home/Services";
// import Partners from "../../components/Partners/Partners";
import Operations from "../../components/Home/Operations";
// import WaveSeparator from "../../components/WaveSeparator/WaveSeparator";

export default function Home() {
  return (
    <>
      <Hero />
      <PrimeLocation />
      {/* <WaveSeparator topColor="#262f61" bottomColor="#262f61" /> */}
      <TaxBenefits />
      {/* <WaveSeparator topColor="#262f61" bottomColor="#262f61" /> */}
      <Services />
      {/* <WaveSeparator topColor="#262f61" bottomColor="#262f61" /> */}
      {/* <Partners /> */}
      <Operations/>
    </>
  );
}
