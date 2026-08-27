import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const locations = [
  {
    name: "Ella Rock",
    category: "Sightseeing / Hiking",
    position: [6.8538, 81.0464],
  },
  {
    name: "Dowa Rock Temple",
    category: "Historical",
    position: [6.857426, 81.022059],
  },
  {
    name: "Lipton's Seat",
    category: "Sightseeing",
    position: [6.789521, 81.017612],
  },
  {
    name: "Ravana Fall",
    category: "Sightseeing / Nature",
    position: [6.84074, 81.05492],
  },
  {
    name: "Nine Arches Bridge",
    category: "Monuments / Architecture",
    position: [6.87676, 81.06076],
  },
  {
    name: "Little Adam's Peak",
    category: "Sightseeing / Hiking",
    position: [6.8625, 81.0638],
  },
  {
    name: "Adisham Bungalow",
    category: "Monuments / Historical",
    position: [6.773087, 80.930990],
  },
  {
    name: "Porowagala Viewpoint",
    category: "Sightseeing",
    position: [6.830560, 81.012682],
  },
  {
    name: "Halpewatte Tea Factory",
    category: "Educational",
    position: [6.890353, 81.034249],
  },
];

function UvaMap() {
  return (
    <div className="h-[550px] w-full overflow-hidden rounded-2xl border shadow-sm">
      <MapContainer
        center={[6.85, 81.05]}
        zoom={10}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((place) => (
          <Marker
            key={place.name}
            position={place.position}
          >
            <Popup>
              <div>
                <h3 className="font-bold">
                  {place.name}
                </h3>

                <p className="text-sm">
                  {place.category}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default UvaMap;