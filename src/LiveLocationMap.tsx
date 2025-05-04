import type React from "react";
import { useState } from "react";

const CurrentLocation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        let message = "Unable to retrieve location.";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message =
              "Permission denied. Please allow location access in your browser settings.";
            break;
          case err.POSITION_UNAVAILABLE:
            message = "Position unavailable. GPS or network might be off.";
            break;
          case err.TIMEOUT:
            message = "Location request timed out. Try again.";
            break;
          default:
            message = err.message;
        }
        setError(`${message} [Code: ${err.code}]`);
        console.error("Geolocation error:", err);
      },
      {
        enableHighAccuracy: true,
        // timeout: 20000, // 20 seconds
        maximumAge: 0,
      }
    );
  };

  return (
    <div style={{ padding: "1rem" }}>
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button onClick={getCurrentLocation} disabled={loading}>
        {loading ? "Loading..." : "📍 Get Current Location"}
      </button>
      <div style={{ marginTop: "1rem" }}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {latitude !== null && longitude !== null && (
          <div>
            <p>
              <strong>Latitude:</strong> {latitude}
            </p>
            <p>
              <strong>Longitude:</strong> {longitude}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentLocation;
