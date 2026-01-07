import MapView from "./components/MapView";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Kurdistan Weather Map</h1>
        <p>Interactive weather map of Kurdish regions</p>
      </header>

      <div className="map-wrapper">
        <MapView />
      </div>
    </div>
  );
}
