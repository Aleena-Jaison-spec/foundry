import MapView from "./components/MapView";
import { MapProvider } from "./context/MapContext";

export default function App() {
  return (
    <MapProvider>
      <div style={{ height: "100vh", width: "100vw" }}>
        <MapView />
      </div>
    </MapProvider>
  );
}

