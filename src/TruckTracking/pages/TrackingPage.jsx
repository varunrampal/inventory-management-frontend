// e.g. pages/TrackingPage.jsx
import TruckMapPath from "../components/TruckMapPath";
import Layout from '../../components/Layout';
import RoutePlayback from "../components/RoutePlayback";

export default function TrackingPage() {
  return (
    <Layout>
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Live Truck Tracking</h1>
      <TruckMapPath />
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-3">Route Playback</h2>
        <RoutePlayback />
      </div>
    </div>
    </Layout>
  );
}
