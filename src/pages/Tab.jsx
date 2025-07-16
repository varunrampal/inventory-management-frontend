import { useState } from 'react';
import Layout from '../components/Layout';

const tabs = ['Overview', 'Estimates', 'Items', 'Analytics'];

export default function Tab() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      {/* Tab Menu */}
      <div className="flex gap-4 border-b mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 border-b-2 text-sm font-medium ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-blue-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'Overview' && <p>Summary info or stats here</p>}
        {activeTab === 'Estimates' && <p>Estimate list goes here</p>}
        {activeTab === 'Items' && <p>Item list and inventory management</p>}
        {activeTab === 'Analytics' && <p>Graphs and insights</p>}
      </div>
    </Layout>
  );
}