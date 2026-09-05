"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  lat?: number;
  lng?: number;
  searchQuery?: string;
}

function LocationMarker({ position, setPosition, onLocationSelect }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function MapPicker({ onLocationSelect, lat = -6.200000, lng = 106.816666, searchQuery }: MapPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([lat, lng]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync pin and map center if parent forces a lat/lng update (e.g. from suggestion click)
  useEffect(() => {
    if (lat && lng) {
      setPosition(new L.LatLng(lat, lng));
      setMapCenter([lat, lng]);
    }
  }, [lat, lng]);

  // Handle searchQuery automatic zooming and pin dropping
  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== "") {
      const fetchCoords = async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ", Indonesia")}`);
          const data = await res.json();
          if (data && data.length > 0) {
            const fetchedLat = parseFloat(data[0].lat);
            const fetchedLon = parseFloat(data[0].lon);
            setMapCenter([fetchedLat, fetchedLon]);
            setPosition(new L.LatLng(fetchedLat, fetchedLon));
            onLocationSelect(fetchedLat, fetchedLon);
          }
        } catch (err) {
          console.error("Geocoding failed", err);
        }
      };
      
      const timer = setTimeout(fetchCoords, 800); // debounce
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  if (!mounted) return <div className="h-64 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>;

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 z-10 relative">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={mapCenter} />
        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}
