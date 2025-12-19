import React, { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const DEFAULT_CENTER = { lat: 49.0504, lng: -122.3045 };
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const HISTORY_URL = `${BASE_URL}/admin/tracking/history`;
const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";

const driverOptions = ["Ankush", "Harinderjeet", "Gursharan"];

export default function RoutePlayback({ defaultDriverId = "Ankush", minutes = 480 }) {
  const [selectedDriverId, setSelectedDriverId] = useState(defaultDriverId);
  const [historyPoints, setHistoryPoints] = useState([]);
  const [playIndex, setPlayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(700);
  const timerRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: MAPS_KEY,
  });

  const fetchHistory = async () => {
    try {
      const res = await fetch(
        `${HISTORY_URL}/${encodeURIComponent(selectedDriverId)}?minutes=${minutes}`
      );
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setHistoryPoints(list);
      setPlayIndex(list.length > 0 ? list.length - 1 : 0);
      setIsPlaying(false);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedDriverId, minutes]);

  useEffect(() => {
    if (!isPlaying) return;
    if (historyPoints.length === 0) return;

    timerRef.current = setInterval(() => {
      setPlayIndex((prev) => {
        if (prev >= historyPoints.length - 1) {
          clearInterval(timerRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);

    return () => clearInterval(timerRef.current);
  }, [isPlaying, historyPoints.length, speedMs]);

  const path = useMemo(
    () =>
      historyPoints
        .map((p) => ({ lat: Number(p.lat), lng: Number(p.lng) }))
        .filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lng)),
    [historyPoints]
  );

  const currentPoint = historyPoints[playIndex];
  const center = currentPoint
    ? { lat: Number(currentPoint.lat), lng: Number(currentPoint.lng) }
    : DEFAULT_CENTER;

  const playedPath = path.slice(0, Math.min(playIndex + 1, path.length));

  const currentTimeLabel = currentPoint?.timestamp
    ? new Date(currentPoint.timestamp).toLocaleTimeString()
    : "N/A";

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-white">
      <div className="p-3 border-b border-slate-200 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold">Driver:</label>
        <input
          list="playback-driver-options"
          value={selectedDriverId}
          onChange={(e) => setSelectedDriverId(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm w-48"
          placeholder="Driver ID"
        />
        <datalist id="playback-driver-options">
          {driverOptions.map((id) => (
            <option key={id} value={id} />
          ))}
        </datalist>

        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="px-3 py-1.5 text-sm font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => setPlayIndex(0)}
          className="px-3 py-1.5 text-sm font-semibold rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
        >
          Reset
        </button>
        <button
          onClick={fetchHistory}
          className="px-3 py-1.5 text-sm font-semibold rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          Refresh
        </button>

        <div className="ml-auto text-xs text-slate-600">
          Point {historyPoints.length ? playIndex + 1 : 0} / {historyPoints.length} ·{" "}
          {currentTimeLabel}
        </div>
      </div>

      <div className="px-4 py-3 border-b border-slate-200">
        <input
          type="range"
          min={0}
          max={Math.max(0, historyPoints.length - 1)}
          value={playIndex}
          onChange={(e) => setPlayIndex(Number(e.target.value))}
          className="w-full"
        />
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
          <span>Playback speed:</span>
          <select
            value={speedMs}
            onChange={(e) => setSpeedMs(Number(e.target.value))}
            className="border border-slate-300 rounded px-2 py-1"
          >
            <option value={300}>Fast</option>
            <option value={700}>Normal</option>
            <option value={1200}>Slow</option>
          </select>
        </div>
      </div>

      <div className="w-full h-[520px]">
        {!isLoaded ? (
          <div className="w-full h-full flex items-center justify-center">
            Loading map...
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            {playedPath.length > 1 && (
              <Polyline
                path={playedPath}
                options={{
                  strokeColor: "#2563EB",
                  strokeOpacity: 0.9,
                  strokeWeight: 4,
                }}
              />
            )}
            {currentPoint && (
              <Marker position={center} label={`${selectedDriverId}`} />
            )}
          </GoogleMap>
        )}
      </div>
    </div>
  );
}
