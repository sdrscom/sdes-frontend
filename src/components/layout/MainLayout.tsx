import { Outlet } from "react-router-dom";
import Footer from "../Footer/Footer";
import Navbar from "../Navbar/Navbar";
// import LiveTrackingButton from "../../ui/LiveTrackingButton";
// import type { ReactNode } from "react";

// interface MainLayoutProps {
//   children: ReactNode;
// }

const MainLayout = () => {
  return (
    <>
      <Navbar />
      {/* <LiveTrackingButton /> */}
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
