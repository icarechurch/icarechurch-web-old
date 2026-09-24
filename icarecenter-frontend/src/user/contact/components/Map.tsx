import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  latitude: number;
  longitude: number;
  address: string;
  className?: string;
}

export function Map({
  latitude,
  longitude,
  address,
  className = "",
}: MapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    let mapInstance: LeafletMap | null = null;
    let isCancelled = false;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (isCancelled || mapRef.current || !container.isConnected) return;

      // Fix for default markers in Leaflet with bundlers
      // Check if function exists before deleting to be safe, though unexpected in fresh import
      if ((L.Icon.Default.prototype as any)._getIconUrl) {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
      }

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      // Initialize map
      mapInstance = L.map(container, {
        zoomControl: true, // explicit option to ensure it works
      }).setView([latitude, longitude], 16);

      if (isCancelled) {
        mapInstance.remove();
        mapInstance = null;
        return;
      }

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstance);

      // Add marker
      const marker = L.marker([latitude, longitude]).addTo(mapInstance);

      // Add popup with church info
      marker
        .bindPopup(`
            <div style="text-align: center; padding: 8px;">
            <strong>I Care Center</strong><br>
            <small>${address}</small>
            </div>
        `)
        .openPopup();

      mapRef.current = mapInstance;
    };

    void initMap();

    // Cleanup function
    return () => {
      isCancelled = true;
      const activeMap = mapRef.current ?? mapInstance;

      if (activeMap) {
        activeMap.remove();
      }

      if (mapRef.current === activeMap) {
        mapRef.current = null;
      }

      mapInstance = null;
    };
  }, [latitude, longitude, address]);

  return (
    <div
      className={`h-64 w-full rounded-lg ${className}`}
      ref={mapContainerRef}
      style={{ zIndex: 1 }}
    />
  );
}
