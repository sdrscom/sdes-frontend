import LocationHero from "../../components/Location/LocationHero";
import LocationDetails from "../../components/Location/LocationDetails";
import StrategicConnectivity from "../../components/Location/StrategicConnectivity";
// import WaveSeparator from "../../components/WaveSeparator/WaveSeparator";

export default function Services() {
  return (
    <div>
      <LocationHero />
      {/* <WaveSeparator topColor="#262f61" bottomColor="#262f61" /> */}
      <LocationDetails />
      {/* <WaveSeparator topColor="#262f61" bottomColor="#262f61" /> */}
      <StrategicConnectivity />
    </div>
  );
}
