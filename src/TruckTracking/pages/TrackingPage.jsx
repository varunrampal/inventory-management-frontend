// e.g. pages/TrackingPage.jsx
import TruckMap from "../components/TruckMap";
import TruckMapPath from "../components/TruckMapPath";
import Layout from '../../components/Layout';

export default function TrackingPage() {
  return (
    <Layout>
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Live Truck Tracking</h1>
      <TruckMapPath />
    </div>
    </Layout>
  );
}
