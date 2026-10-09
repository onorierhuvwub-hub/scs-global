'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shipment, TransportMode } from '@/lib/types';
import { ShieldCheck, Truck, Plane, Ship, AlertTriangle, Play, Pause, Navigation, Eye, EyeOff } from 'lucide-react';

// Custom SVG Leaflet Icons
const vaultIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background-color: #0B132B; border: 2px solid #D4AF37; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(212, 175, 55, 0.6);">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const destIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background-color: #10B981; border: 2px solid #FFFFFF; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function getVehicleIcon(mode: TransportMode = 'road') {
  let symbolSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`;
  if (mode === 'air') {
    symbolSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.7 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/></svg>`;
  } else if (mode === 'sea') {
    symbolSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9 1 5.2 2.38 6"/><path d="M12 10V4.5"/><path d="M12 2v2.5"/></svg>`;
  }

  return L.divIcon({
    className: 'custom-leaflet-vehicle',
    html: `<div style="background-color: #D4AF37; border: 3px solid #0B132B; color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(212, 175, 55, 0.9); animation: pulse 2s infinite;">
      ${symbolSvg}
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

interface LeafletMapProps {
  shipment: Shipment;
  exactLocationAuthorized?: boolean;
}

function MapAutoFit({ polyline }: { polyline: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (polyline && polyline.length > 0) {
      const bounds = L.latLngBounds(polyline);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [polyline, map]);
  return null;
}

export default function LeafletMapInner({ shipment, exactLocationAuthorized = true }: LeafletMapProps) {
  const polyline = shipment.routePolyline || [
    [shipment.origin.lat, shipment.origin.lng],
    [shipment.destination.lat, shipment.destination.lng],
  ];

  // Live simulation states
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [showExact, setShowExact] = useState(exactLocationAuthorized);

  // Animate moving vehicle marker along polyline points
  useEffect(() => {
    if (!isPlaying || polyline.length <= 1) return;
    const intervalTime = 3000 / speedMultiplier;
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % polyline.length);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPlaying, polyline.length, speedMultiplier]);

  const activePos = polyline[currentStep] || [shipment.currentLocation.lat, shipment.currentLocation.lng];
  const displayPos: [number, number] = showExact
    ? [activePos[0], activePos[1]]
    : [activePos[0] + 0.02, activePos[1] + 0.02]; // Approximate public area blur offset

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900">
      {/* Map Control Overlay Header */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-slate-700 shadow-lg text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-md border border-amber-500/40">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
              LIVE TELEMETRY STREAM • {shipment.trackingNumber}
            </div>
            <div className="text-sm font-medium text-slate-200">
              Transport Mode: <span className="capitalize font-bold text-white">{shipment.transportMode}</span> | ETA: {new Date(shipment.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
            </div>
          </div>
        </div>

        {/* Map Playback & Privacy Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExact(!showExact)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
              showExact ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
            title="Toggle Exact Authorized GPS vs Public Masked Region"
          >
            {showExact ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showExact ? 'Authorized (Exact GPS)' : 'Public (Approximate)'}
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-amber-400"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <select
            value={speedMultiplier}
            onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-md text-xs px-2 py-1 text-slate-200"
          >
            <option value={1}>1x Speed</option>
            <option value={2}>2x Speed</option>
            <option value={5}>5x Speed</option>
          </select>
        </div>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={[shipment.currentLocation.lat, shipment.currentLocation.lng]}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full z-[1]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapAutoFit polyline={polyline} />

        {/* Origin Marker */}
        <Marker position={[shipment.origin.lat, shipment.origin.lng]} icon={vaultIcon}>
          <Popup>
            <div className="p-1 text-xs">
              <strong className="text-navy-900 block font-bold">{shipment.origin.hubName || 'Origin High Security Vault'}</strong>
              <span>{shipment.origin.city}, {shipment.origin.country}</span>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={[shipment.destination.lat, shipment.destination.lng]} icon={destIcon}>
          <Popup>
            <div className="p-1 text-xs">
              <strong className="text-emerald-700 block font-bold">{shipment.destination.hubName || 'Destination High Security Vault'}</strong>
              <span>{shipment.destination.city}, {shipment.destination.country}</span>
            </div>
          </Popup>
        </Marker>

        {/* Route Polyline */}
        <Polyline
          positions={polyline}
          pathOptions={{
            color: '#D4AF37',
            weight: 4,
            dashArray: '8, 8',
            opacity: 0.85,
          }}
        />

        {/* Moving Active Courier / Vehicle Marker */}
        <Marker position={displayPos} icon={getVehicleIcon(shipment.transportMode)}>
          <Popup>
            <div className="p-2 text-xs text-slate-900">
              <div className="font-bold text-amber-700 flex items-center gap-1 mb-1">
                <Navigation className="w-3.5 h-3.5" />
                ACTIVE ARMORED BEACON
              </div>
              <div>Coordinates: {displayPos[0].toFixed(4)}, {displayPos[1].toFixed(4)}</div>
              <div>Speed: {shipment.transportMode === 'air' ? '820 km/h' : '45 km/h'}</div>
              <div>Seal Verification: <span className="font-mono text-emerald-700 font-bold">{shipment.tamperSealNumber}</span></div>
            </div>
          </Popup>
        </Marker>

        {/* Geofence Safe Radius Indicator */}
        <Circle
          center={displayPos}
          radius={50000} // 50km visual geofence circle
          pathOptions={{
            color: showExact ? '#10B981' : '#F59E0B',
            fillColor: showExact ? '#10B981' : '#F59E0B',
            fillOpacity: 0.1,
            weight: 1,
          }}
        />
      </MapContainer>

      {/* Geofence & Incident Banner Overlay */}
      {shipment.incidents && shipment.incidents.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-amber-950/90 border border-amber-500/60 rounded-lg p-3 text-amber-200 flex items-center justify-between text-xs backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Geofence Log:</strong> {shipment.incidents[0].description} ({shipment.incidents[0].status.toUpperCase()})
            </span>
          </div>
          <span className="text-[10px] text-amber-400/80 font-mono">256-BIT ENCRYPTED LOG</span>
        </div>
      )}
    </div>
  );
}
