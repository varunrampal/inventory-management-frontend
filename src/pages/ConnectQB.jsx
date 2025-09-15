// web/src/pages/AdminIntegrations.jsx
import React from "react";
import Layout from '../components/Layout';
import QuickBooksConnect from "../components/QuickBooksConnect";

export default function Connect() {
  return (
    <Layout>
          <h1 className="text-2xl font-bold">Connect QuickBooks</h1>
          
      <QuickBooksConnect />
    </Layout>
  );
}
    