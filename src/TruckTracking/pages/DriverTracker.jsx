import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const UPDATE_URL = `${API_BASE}/admin/tracking/update`;
const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

const containerStyle = {
  width: "100%",
  height: "320px",
};

function DriverTracker() {
  const [driverId, setDriverId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState("");
  const [position, setPosition] = useState(null);

  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);

  const { isLoaded } = useJsApiLoader({
    id: "driver-tracker-map",
    googleMapsApiKey: MAPS_KEY || "",
  });

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setStatus("Stopped");
  };

  const sendUpdate = async ({ driverId: id, lat, lng }) => {
    try {
      const res = await fetch(UPDATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: id, lat, lng }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to send location");
      }

      setStatus(`Last sent at ${new Date().toLocaleTimeString()}`);
      setError("");
    } catch (err) {
      console.error("Send update error:", err);
      setError(err.message || "Failed to send location");
    }
  };

  const startTracking = () => {
    const trimmedId = driverId.trim();
    if (!trimmedId) {
      setError("Enter a driver ID to start tracking.");
      return;
    }
    if (!API_BASE) {
      setError("API base URL is not configured.");
      return;
    }
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    setStatus("Requesting location permission...");
    setError("");

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(coords);

        const now = Date.now();
        // Throttle sends to ~every 3 seconds to reduce battery/network load
        if (now - lastSentRef.current < 3000) return;
        lastSentRef.current = now;

        await sendUpdate({ driverId: trimmedId, ...coords });
      },
      (geoErr) => {
        console.error("Geolocation error:", geoErr);
        setError(geoErr.message || "Unable to read location.");
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 10000,
      }
    );

    watchIdRef.current = watchId;
    setIsTracking(true);
    setStatus("Tracking live...");
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Driver Live Tracking</h1>
      <p className="text-sm text-slate-600 mb-4">
        Enter your driver ID and start sharing your live location. Keep this
        page open while you are on the move.
      </p>

      <div className="space-y-3 rounded-lg border border-slate-200 p-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Driver ID
            </label>
            <input
              type="text"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              placeholder="e.g. Truck-12 or Driver Name"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={startTracking}
            disabled={isTracking}
            className={`px-4 py-2 rounded text-white text-sm font-semibold ${
              isTracking
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            Start Tracking
          </button>
          <button
            onClick={stopTracking}
            disabled={!isTracking}
            className={`px-4 py-2 rounded text-sm font-semibold ${
              isTracking
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-slate-200 text-slate-600 cursor-not-allowed"
            }`}
          >
            Stop
          </button>
          <div className="text-sm text-slate-600">{status}</div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        {position && (
          <div className="text-sm text-slate-700">
            Current: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </div>
        )}

        {MAPS_KEY && isLoaded && position && (
          <div className="mt-2 rounded-lg overflow-hidden border border-slate-200">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={position}
              zoom={14}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              <Marker position={position} label="You" />
            </GoogleMap>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-slate-500 space-y-1">
        <div>Keep this tab open; minimizing is okay.</div>
        <div>Turning off tracking will stop sending your location.</div>
      </div>
    </div>
  );
}

export default DriverTracker;
