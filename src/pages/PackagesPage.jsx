import PackagesList from "../components/PackagesList";
import { useRealm } from '../context/RealmContext';
import Layout from "../components/Layout";

export default function PackagesPage() {
  // If you scope data by realm, pass it; otherwise omit.
  const { realmId } = useRealm();
  return (

 <Layout>
      <div className="w-full p-4">
        {/* Header / Breadcrumb */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Packages</h1>
         
        </div>

        <PackagesList realmId={realmId} />

      </div>
    </Layout>
  );
}