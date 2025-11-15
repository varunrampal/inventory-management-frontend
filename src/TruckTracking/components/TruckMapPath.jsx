// TruckMap.jsx
import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,          // 👈 new
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const DEFAULT_CENTER = { lat: 49.0504, lng: -122.3045 };

// adjust for your backend IP
const BASE_URL = import.meta.env.VITE_API_BASE_URL;//"http://10.0.0.8:4000";
const LATEST_URL = `${BASE_URL}/admin/tracking`; // all latest positions
const HISTORY_URL = `${BASE_URL}/admin/tracking/history`; // /:driverId

function TruckMapPath() {
  const [locations, setLocations] = useState([]);      // latest location per driver
  const [historyPoints, setHistoryPoints] = useState([]); // full path for one driver
  const [center, setCenter] = useState(DEFAULT_CENTER);

  // TODO: later – make this selectable in UI
  const [selectedDriverId] = useState("Ankush-01");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCk0MI_ZjbPklgniksVPzE8sIqAo17nmgA",
  });

  // Fetch latest positions (for markers)
  const fetchLatest = async () => {
    try {
      const res = await fetch(LATEST_URL);
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error("Error fetching latest:", err);
    }
  };

  // Fetch history for one driver (path)
  const fetchHistory = async () => {
    try {
      const res = await fetch(
        `${HISTORY_URL}/${encodeURIComponent(selectedDriverId)}?minutes=180`
      );
      const data = await res.json();

      console.log("🧵 History points:", data);
      setHistoryPoints(data);

      if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        const latNum = Number(first.lat);
        const lngNum = Number(first.lng);
        if (!Number.isNaN(latNum) && !Number.isNaN(lngNum)) {
          setCenter({ lat: latNum, lng: lngNum });
        }
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    fetchLatest();
    fetchHistory();

    const id = setInterval(() => {
      fetchLatest();
      fetchHistory();
    }, 5000);

    return () => clearInterval(id);
  }, [selectedDriverId]);

  if (!isLoaded) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center">
        Loading map…
      </div>
    );
  }

  // Convert history points to Polyline path
  const path = historyPoints
    .map((p) => ({
      lat: Number(p.lat),
      lng: Number(p.lng),
    }))
    .filter(
      (p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lng)
    );

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-slate-200">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={11}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Markers – latest position of all drivers */}
        {locations.map((loc) => {
          const latNum = Number(loc.lat);
          const lngNum = Number(loc.lng);
          if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return null;

          return (
            <Marker
              key={loc.driverId}
              position={{ lat: latNum, lng: lngNum }}
              label={loc.driverId}
            />
          );
        })}

        {/* Polyline – full path of selected driver */}
        {path.length > 1 && (
          <Polyline
            path={path}
            options={{
              strokeColor: "#FF0000",
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}

export default TruckMapPath;
