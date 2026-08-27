import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const uvaCenter = [6.8667, 81.0466];

function NearbyMap() {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm">

      <MapContainer
        center={uvaCenter}
        zoom={9}
        scrollWheelZoom={true}
        className="h-500px w-full"
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={uvaCenter}>
          <Popup>
            <strong>Uva Province</strong>
            <br />
            Explore nearby facilities.
          </Popup>
        </Marker>

      </MapContainer>

    </div>
  );
}

export default NearbyMap;