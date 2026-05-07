import { useState } from "react";
import { X } from "lucide-react";

export default function LiveTrackingButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingType, setTrackingType] = useState("Container Tracking");
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleSubmit = () => {
    if (!trackingNumber.trim()) {
      alert("Please enter a tracking number");
      return;
    }
    console.log("Tracking:", trackingType, trackingNumber);
    setIsModalOpen(false);
    setTrackingNumber("");
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-4 right-0 z-40 shadow-lg transition-none w-10 md:w-auto"
        style={{
          background: "linear-gradient(to bottom, #B82227, #F27141)",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          boxShadow: "0 4px 6px rgba(184, 34, 39, 0.3)",
        }}
      >
        <span className="text-white font-bold tracking-wider block py-4 px-3 text-sm md:py-6 md:px-4 md:text-lg">
          LIVE TRACKING
        </span>
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-lg shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #B82227, #F27141)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white"
            >
              <X size={28} strokeWidth={2.5} />
            </button>

            <div className="p-8">
              <h2 className="text-white text-2xl font-bold mb-6 uppercase tracking-wide">
                LIVE TRACKING
              </h2>

              <div className="space-y-5">
                <select
                  value={trackingType}
                  onChange={(e) => setTrackingType(e.target.value)}
                  className="w-full px-4 py-3 rounded bg-white text-gray-800 font-medium focus:outline-none"
                >
                  <option>Container Tracking</option>
                  <option>Vehicle Tracking</option>
                  <option>Cargo Tracking</option>
                  <option>Shipment Tracking</option>
                </select>

                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-4 py-3 rounded bg-white text-gray-800 placeholder-gray-500 focus:outline-none"
                />

                <button
                  onClick={handleSubmit}
                  className="w-full py-3 rounded font-bold text-white uppercase tracking-wider shadow-lg"
                  style={{
                    background: "linear-gradient(to right, #B82227, #F27141)",
                    boxShadow: "0 4px 6px rgba(184, 34, 39, 0.3)",
                  }}
                >
                  SUBMIT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
