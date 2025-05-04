/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet"; // For type safety
import "leaflet/dist/leaflet.css"; // Leaflet styles

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import redMarker from "/mark.png";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// biome-ignore lint/performance/noDelete: <explanation>
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const redIcon = new L.Icon({
  iconUrl: redMarker,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const CurrentLocation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Static point (for distance calculation)
  const staticLat = 10.95778;
  const staticLng = 78.105382;

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
        calculateDistance();
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
        maximumAge: 0,
      }
    );
  };

  const calculateDistance = () => {
    console.log(latitude, longitude);
    if (latitude && longitude) {
      const R = 6371; // Radius of Earth in km
      const dLat = (latitude - staticLat) * (Math.PI / 180);
      const dLon = (longitude - staticLng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(staticLat * (Math.PI / 180)) *
          Math.cos(latitude * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      setDistance(R * c); // Distance in km
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button
        onClick={getCurrentLocation}
        disabled={loading}
        style={{ marginRight: 20 }}
      >
        {loading ? "Loading..." : "📍 Get Current Location"}
      </button>
      {latitude !== null && longitude !== null && (
        // biome-ignore lint/a11y/useButtonType: <explanation>
        <button onClick={calculateDistance}>Get Distance</button>
      )}
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

            {distance !== null && (
              <div>
                <p>
                  <strong>Distance:</strong> {distance.toFixed(2)} km |
                  {+distance.toFixed(2) * 1000} m
                </p>
              </div>
            )}
            <MapContainer
              center={[latitude, longitude] as LatLngExpression}
              zoom={13}
              style={{ width: "100%", height: "400px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[latitude, longitude] as LatLngExpression}>
                <Popup>You are here!</Popup>
              </Marker>
              <Marker
                icon={redIcon}
                position={[staticLat, staticLng] as LatLngExpression}
              >
                <Popup>Static Point - (10.957780, 78.105382)</Popup>
              </Marker>
              <Polyline
                positions={[
                  [latitude, longitude],
                  [staticLat, staticLng],
                ]}
                color="blue"
                weight={4}
                opacity={0.7}
              />
              <Circle
                center={[staticLat, staticLng] as LatLngExpression}
                radius={100} // 100 meters radius
                color="green"
                fillColor="green"
                fillOpacity={0.3}
              />
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentLocation;
