import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%", // parent controls the height
};

// Default center - change to your depot / area
const DEFAULT_CENTER = { lat: 49.0504, lng: -122.3045 };
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE}/admin/tracking`;
const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";

function TruckMap() {
  const [locations, setLocations] = useState([]);
  const [center, setCenter] = useState(DEFAULT_CENTER);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: MAPS_KEY,
  });

  const fetchLocations = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      console.log("Locations from backend:", data);
      const list = Array.isArray(data) ? data : [data];
      setLocations(list);

      // Auto center on first driver if there is one
      if (list.length > 0) {
        const first = list[0];
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
        Loading map...
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
            console.warn("Bad coords for", loc.driverId, loc.lat, loc.lng);
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
