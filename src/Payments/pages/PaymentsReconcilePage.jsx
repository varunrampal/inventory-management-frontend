// src/pages/PaymentsReconcilePage.jsx
import PaymentEntryForm from "../components/PaymentEntryForm";
import ReconcileReport from "../components/ReconcileReport";
import PaymentsListPage from "./PaymentsListPage";
import Layout from '../../components/Layout';
// import logo from "/path/to/logo.png"; // if you want InvTrack logo on top

export default function PaymentsReconcilePage() {
  return (
    <Layout>
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        {/* <img src={logo} alt="InvTrack" className="h-10 w-auto" /> */}
        <h1 className="text-xl font-bold">Payment Reconciliation</h1>
      </div>

      <PaymentEntryForm />
      <PaymentsListPage/>
      <ReconcileReport />
    </div>
    </Layout>
  );
}
