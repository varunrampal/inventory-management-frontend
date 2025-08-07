import { useState, useEffect } from 'react';
import { useRealm } from '../context/RealmContext';

export default function CompanySelector({ onChange, disabled }) {
    const defaultRealmId = import.meta.env.VITE_DEFAULT_REALMID;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [companies, setCompanies] = useState([]);
     const { realmId, setRealmId } = useRealm();

    const BASE_URL = import.meta.env.PROD
        ? 'https://inventory-management-server-vue1.onrender.com'
        : 'http://localhost:4000';


    // Load companies from backend
    useEffect(() => {
        fetch(`${BASE_URL}/static/companies.json`)
            .then(res => res.json())
            .then(data => {
                setCompanies(data);
                if (!realmId) {
                    const defaultCompany = data.find(c => c.default) || data[0];
                    if (defaultCompany) setRealmId(defaultCompany.realmId);
                }
                // // Set default company if not already selected
                // const saved = localStorage.getItem('selectedRealmId');
                // const defaultCompany = data.find(c => c.default) || data[0];
                // const initial = saved || defaultCompany?.realmId || '';

                // setSelectedRealmId(initial);
                // localStorage.setItem('selectedRealmId', initial);
                //  onChange(initial);

                // if (saved) {
                //     setSelectedRealmId(saved);

                // } else {
                //     const defaultCompany = data.find((c) => c.default);

                //     // Set default company if it exists
                //     if (defaultCompany) {
                //         localStorage.setItem('selectedRealmId', defaultCompany.realmId);
                //         setSelectedRealmId(defaultCompany.realmId);
                //     }

                // }
            })
            .catch(err => console.error('Failed to load companies.json', err));
    }, [realmId,setRealmId,BASE_URL]);

    // Notify parent when selection changes
    // useEffect(() => {
    //     if (selectedRealmId) {
    //         localStorage.setItem('selectedRealmId', selectedRealmId);
    //     }

    // }, [selectedRealmId]);

    // const handleChange = (e) => {
    //     const newId = e.target.value;
    //     setSelectedRealmId(newId);
    //     localStorage.setItem('selectedRealmId', newId);
    //     if (onChange) onChange(newId);
    // };

    return (
        <div className="flex items-center gap-2">
            {/* <label className="text-white text-sm">Company:</label> */}
            <select
                value={realmId}
            disabled={disabled}
               // onChange={handleChange}
               onChange={(e) => setRealmId(e.target.value)}
                className="rounded px-2 py-1 text-sm text-white bg-gray-700 border border-gray-500 focus:outline-none focus:ring focus:border-blue-300"
            >
                {companies.map((company) => (
                    <option key={company.realmId} value={company.realmId}>
                        {company.name}
                    </option>
                ))}
            </select>
        </div>
    );
}