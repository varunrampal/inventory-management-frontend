
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import PackageDetails from '../components/PackageDetails';


export default function PackageDetailsPage() {
    const { packageId } = useParams();
    console.log('pkgId:', packageId);
    return (
        <Layout>
             <h1 className="text-2xl font-semibold mb-4">Package Details</h1>
             <div className="space-y-2 text-gray-700">
            <PackageDetails packageId={packageId} />
            </div>
        </Layout>
    );
}