import AboutHero from "../../components/About/AboutHero";
import LeadershipBoardSection from "../../components/About/LeadershipBoardSection";
import Timeline from "../../components/About/Timeline";
// import WaveSeparator from "../../components/WaveSeparator/WaveSeparator";

export default function About() {
  return (
    <div>
      <AboutHero />
      {/* <WaveSeparator topColor="#262f61" bottomColor="#262f61" /> */}
      <LeadershipBoardSection />
      {/* <WaveSeparator topColor="#262f61" bottomColor="#262f61" /> */}
      <Timeline />
    </div>
  );
}
