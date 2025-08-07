import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import CreatePackages from '../components/CreatePackageForm';
import { useRealm } from '../context/RealmContext';

export default function CreatePackage() {
  const { realmId } = useRealm();
  const { estimateId } = useParams();

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Create Package</h1>
      <CreatePackages estimateId={estimateId} realmId={realmId} />
    </Layout>
  );
}
