import { MapContainer, TileLayer, Marker, Popup, GeoJSON, CircleMarker, Tooltip } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import { kurdishCities } from "../data/kurdishCities";
import kurdistanBorder from "../data/KurdistanBorder.json";

// Fix Leaflet default icon URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Star DivIcon for Diyarbakır / Amed
const starIcon = new L.DivIcon({
  html: `<div style="font-size:48px; color:gold; text-shadow:0 0 5px black;">★</div>`,
  className: "",
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

export default function MapView() {
  const [weatherData, setWeatherData] = useState({});
  const [unit, setUnit] = useState("metric"); // °C or °F
  const [loading, setLoading] = useState(true);

  // Fetch weather for all cities
  useEffect(() => {
    const key = import.meta.env.VITE_OPENWEATHER_KEY;
    console.log("Using OpenWeather key:", key);
    if (!key) {
      console.warn("VITE_OPENWEATHER_KEY missing. Weather will not load.");
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      const data = {};
      await Promise.all(
        kurdishCities.map(async (city) => {
          try {
            const res = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=${unit}&appid=${key}`
            );
            const json = await res.json();
            if (res.ok) data[city.id] = json;
          } catch (err) {
            console.error(`Weather fetch error for ${city.name}:`, err);
          }
        })
      );
      setWeatherData(data);
      setLoading(false);
    };

    fetchWeather();
  }, [unit]);

  const borderStyle = { color: "red", weight: 2, fillOpacity: 0.1 };

  // Map temperature to a 20-step HSL gradient (blue → red)
  const getTempColor = (temp) => {
    if (temp == null) return "gray";
    const tC = unit === "metric" ? temp : (temp - 32) * 5 / 9;
    const min = -10;
    const max = 40;
    let ratio = (tC - min) / (max - min);
    ratio = Math.min(Math.max(ratio, 0), 1);
    const hue = 240 - 240 * ratio; // blue → red
    return `hsl(${hue}, 85%, 50%)`;
  };

  const getMarkerRadius = (city) => {
    const majorCities = ["Erbil", "Hewler", "Kermanshah", "Batman", "Van", "Diyarbakır"];
    if (majorCities.includes(city.name)) return 12;
    if (city.population > 500000) return 10;
    return 6;
  };

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {/* Header with Kurdish flag */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          background: "rgba(255,255,255,0.9)",
          padding: "5px 15px",
          borderRadius: 10,
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
        }}
      >
        <img
          src="/kurdish-flag.png" // put the flag in public folder
          alt="Kurdish flag"
          style={{ width: 40, marginRight: 10 }}
        />
        <h2 style={{ margin: 0, fontFamily: "Arial, sans-serif", color: "#333" }}>
          Kurdistan Weather Map
        </h2>
        <img
          src="/kurdish-flag.png" // put the flag in public folder
          alt="Kurdish flag"
          style={{ width: 40, marginLeft: 10 }}
        />
      </div>

      {/* Unit toggle */}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}>
        <button
          onClick={() => setUnit(unit === "metric" ? "imperial" : "metric")}
          style={{
            padding: "5px 10px",
            borderRadius: 5,
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Show in {unit === "metric" ? "°F" : "°C"}
        </button>
      </div>

      <MapContainer center={[36.5, 43]} zoom={6} style={{ height: "100%", width: "100%" }}>
        {/* Satellite imagery */}
        <TileLayer
          attribution='Tiles &copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        {/* Labels overlay */}
        <TileLayer
          attribution='Labels &copy; Esri'
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        />

        {/* Kurdistan border */}
        <GeoJSON data={kurdistanBorder} style={borderStyle} />

        {/* Weather markers */}
        {kurdishCities.map((city) => {
          const weather = weatherData[city.id];
          const temp = weather?.main?.temp ?? null;

          // Star for Diyarbakır
          if (city.name.toLowerCase().includes("diyarbakır")) {
            return (
              <Marker key={`${city.id}-${temp}`} position={[city.lat, city.lon]} icon={starIcon}>
                <Popup>
                  <strong>{city.name} (Capital)</strong>
                  <br />
                  Temp: {temp ?? "N/A"}°{unit === "metric" ? "C" : "F"}
                  <br />
                  Condition: {weather?.weather?.[0]?.description ?? "N/A"}
                </Popup>
                <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                  {city.name}
                </Tooltip>
              </Marker>
            );
          }

          return (
            <CircleMarker
              key={`${city.id}-${temp}`} // re-render when temp changes
              center={[city.lat, city.lon]}
              radius={getMarkerRadius(city)}
              fillColor={getTempColor(temp)}
              color="black"
              weight={1}
              fillOpacity={0.9}
            >
              <Popup>
                <strong>{city.name}</strong>
                <br />
                Region: {city.region}
                <br />
                Country: {city.country}
                <br />
                Temp: {temp ?? "N/A"}°{unit === "metric" ? "C" : "F"}
                <br />
                Condition: {weather?.weather?.[0]?.description ?? "N/A"}
              </Popup>
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                {city.name}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
