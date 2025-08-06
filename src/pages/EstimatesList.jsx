import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import EstimatesTableWithPagination from '../components/EstimatesWithPagination';

export default function EstimatesList() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold">Estimates</h1>
        <EstimatesTableWithPagination />
    </Layout>
  );
}