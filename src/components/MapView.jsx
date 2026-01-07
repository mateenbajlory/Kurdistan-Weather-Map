import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { kurdishCities } from "../data/kurdishCities";
import { useEffect } from "react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ForceResize() {
  const map = useMap();

  useEffect(() => {
    requestAnimationFrame(() => {
      map.invalidateSize();
    });

    window.addEventListener("resize", () => map.invalidateSize());

    return () => {
      window.removeEventListener("resize", () => map.invalidateSize());
    };
  }, [map]);

  return null;
}

export default function MapView() {
  return (
    <MapContainer
      center={[36.5, 43.0]}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
    >
      <ForceResize />

      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {kurdishCities.map((city) => (
        <Marker key={city.id} position={[city.lat, city.lon]}>
          <Popup>
            <strong>{city.name}</strong>
            <br />
            Region: {city.region}
            <br />
            Country: {city.country}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
