// src/components/TruckMap.jsx
import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%", // parent controls the height
};

// Default center – change to your depot / area
const DEFAULT_CENTER = { lat: 49.0504, lng: -122.3045 };
const API_BASE = import.meta.env.VITE_API_BASE_URL;
// For local dev, use your backend URL
const API_URL = `${API_BASE}/admin/tracking`;

function TruckMap() {
  const [locations, setLocations] = useState([]);
  const [center, setCenter] = useState(DEFAULT_CENTER);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCk0MI_ZjbPklgniksVPzE8sIqAo17nmgA"//import.meta.env.VITE_GOOGLE_MAPS_KEY, // put your key in .env
  });

  const fetchLocations = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      console.log("📡 Locations from backend:", data);
      setLocations(data);

      // Auto center on first driver if there is one
      if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        const latNum = Number(first.lat);
        const lngNum = Number(first.lng);
        if (!Number.isNaN(latNum) && !Number.isNaN(lngNum)) {
          setCenter({ lat: latNum, lng: lngNum });
        }
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  useEffect(() => {
    fetchLocations();
    const id = setInterval(fetchLocations, 5000); // refresh every 5s
    return () => clearInterval(id);
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center">
        Loading map…
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-slate-200">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {locations.map((loc) => {
          const latNum = Number(loc.lat);
          const lngNum = Number(loc.lng);

          // Skip invalid coords
          if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
            console.warn("⚠️ Bad coords for", loc.driverId, loc.lat, loc.lng);
            return null;
          }

          return (
            <Marker
              key={loc.driverId}
              position={{ lat: latNum, lng: lngNum }}
              label={loc.driverId}
            />
          );
        })}
      </GoogleMap>
    </div>
  );
}

export default TruckMap;




// // components/TruckMap.jsx
// import React, { useEffect, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import L from "leaflet";


// const API_BASE = import.meta.env.VITE_API_BASE_URL;

// const truckIcon = new L.Icon({
//   iconUrl:
//     "https://cdn-icons-png.flaticon.com/512/743/743922.png", // any truck icon URL
//   iconSize: [32, 32],
//   iconAnchor: [16, 32],
// });


// const API_URL = `${API_BASE}/admin/tracking`;

// export default function TruckMap() {
//   const [locations, setLocations] = useState([]);

//   const fetchLocations = async () => {
//     try {
//       const res = await fetch(API_URL);
//       const data = await res.json();
//       setLocations(data);
//     } catch (err) {
//       console.error("Error fetching locations:", err);
//     }
//   };

//   useEffect(() => {
//     fetchLocations();
//     const id = setInterval(fetchLocations, 5000); // refresh every 5s
//     return () => clearInterval(id);
//   }, []);

//   // Default center: you can set to your depot
//   const defaultCenter = [49.0504, -122.3045]; // example: Abbotsford area

//   return (
//     <div className="w-full h-[500px] rounded-xl overflow-hidden border border-slate-200">
//       <MapContainer
//         center={defaultCenter}
//         zoom={10}
//         style={{ height: "100%", width: "100%" }}
//       >
//         <TileLayer
//           attribution='&copy; OpenStreetMap contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         {locations.map((loc) => (
//           <Marker
//             key={loc.driverId}
//             position={[loc.lat, loc.lng]}
//             icon={truckIcon}
//           >
//             <Popup>
//               <div className="text-sm">
//                 <div className="font-semibold">Driver: {loc.driverId}</div>
//                 <div>Lat: {loc.lat.toFixed(4)}</div>
//                 <div>Lng: {loc.lng.toFixed(4)}</div>
//                 <div>
//                   Updated: {new Date(loc.updatedAt).toLocaleTimeString()}
//                 </div>
//               </div>
//             </Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// }
