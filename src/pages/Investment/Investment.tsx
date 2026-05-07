import InvestmentHero from "../../components/Investment/InvestmentHero";
import InvestInSaudi from "../../components/Investment/WhyInvestInSaudi";
import SDESBondedZone from "../../components/Investment/SDESBondedZone";
import InvestorForeignAdvantages from "../../components/Investment/InvestorForeignAdvantages";
// import WaveSeparator from "../../components/WaveSeparator/WaveSeparator";

export default function Investment() {
  return (
    <div>
      <InvestmentHero />
      {/* <WaveSeparator topColor="#262f61" bottomColor="#262f61" /> */}
      <InvestInSaudi />
      {/* <WaveSeparator topColor="#262f61" bottomColor="#262f61" /> */}
      <SDESBondedZone />
      <InvestorForeignAdvantages />
    </div>
  );
}
