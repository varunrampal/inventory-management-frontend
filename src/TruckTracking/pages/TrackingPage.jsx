// e.g. pages/TrackingPage.jsx
import TruckMap from "../components/TruckMap";

export default function TrackingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Live Driver Tracking</h1>
      <TruckMap />
    </div>
  );
}
