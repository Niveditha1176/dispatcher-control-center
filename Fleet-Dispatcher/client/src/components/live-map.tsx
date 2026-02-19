import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Bike, Truck } from "lucide-react";
import type { MapMarker } from "@shared/schema";

interface LiveMapProps {
  markers: MapMarker[];
}

function createMarkerIcon(type: "bike" | "van", status: "en-route" | "idle" | "maintenance") {
  const color =
    status === "en-route"
      ? "#2563EB"
      : status === "idle"
        ? "#10B981"
        : "#F59E0B";

  const svgIcon =
    type === "bike"
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="7" cy="18" r="2"/><circle cx="20" cy="18" r="2"/></svg>`;

  const html = `
    <div style="
      width: 32px; height: 32px;
      background: ${color};
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      border: 2px solid white;
    ">${svgIcon}</div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

export function LiveMap({ markers }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [13.0827, 80.2707],
      zoom: 10,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    map.zoomControl.setPosition("bottomright");

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    markers.forEach((marker) => {
      const icon = createMarkerIcon(marker.type, marker.status);
      const leafletMarker = L.marker(
        [marker.position.lat, marker.position.lng],
        { icon }
      );

      leafletMarker.bindPopup(
        `<div style="font-family: Inter, sans-serif; font-size: 12px; min-width: 120px;">
          <div style="font-weight: 600; margin-bottom: 2px;">${marker.driverName}</div>
          <div style="color: #6B7280; text-transform: capitalize;">${marker.type} &middot; ${marker.status.replace("-", " ")}</div>
        </div>`,
        { className: "custom-popup" }
      );

      leafletMarker.addTo(markersLayerRef.current!);
    });
  }, [markers]);

  return (
    <div className="flex flex-col h-full" data-testid="live-map">
      <div className="flex items-center justify-between gap-2 flex-wrap px-4 py-3 border-b">
        <h2 className="text-sm font-semibold text-foreground">Live Map</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] text-muted-foreground">En Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span className="text-[10px] text-muted-foreground">Idle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
            <span className="text-[10px] text-muted-foreground">Maint.</span>
          </div>
        </div>
      </div>
      <div className="flex-1 relative" data-testid="map-canvas">
        <div ref={mapRef} className="absolute inset-0" />
        <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-md px-3 py-1.5 border text-[10px] text-muted-foreground">
          <Bike className="w-3 h-3" />
          <span>{markers.filter((m) => m.type === "bike").length} Bikes</span>
          <span className="text-border">|</span>
          <Truck className="w-3 h-3" />
          <span>{markers.filter((m) => m.type === "van").length} Vans</span>
        </div>
      </div>
    </div>
  );
}
