import PackagesList from "../components/PackagesList";
import { useRealm } from '../context/RealmContext';
import UpcomingPackagesCalendar from '../components/UpcomingPackagesCalendar';
import Layout from "../components/Layout";

export default function ShippingSchedulePage() {
  // If you scope data by realm, pass it; otherwise omit.
  const { realmId } = useRealm();
  return (

 <Layout>
      <div className="w-full p-4">
        {/* Header / Breadcrumb */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Shipping/Pickup Schedule</h1>
         
        </div>

       <UpcomingPackagesCalendar timeZone="local" realmId={realmId} />

      </div>
    </Layout>
  );
}