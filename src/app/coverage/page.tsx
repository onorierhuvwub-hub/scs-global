'use client';

import dynamic from 'next/dynamic';
import { Globe, MapPin, ShieldCheck, CheckCircle2, Building2 } from 'lucide-react';

const LeafletMapInner = dynamic(() => import('@/components/LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-mono">
      Loading Global Armored Hub Map...
    </div>
  ),
});

const GLOBAL_HUBS = [
  { city: 'Zurich', country: 'Switzerland', code: 'ZRH-V1', type: 'Central Bullion Vault', status: 'Operational 24/7' },
  { city: 'London', country: 'United Kingdom', code: 'LHR-H2', type: 'Heathrow Armed Transit Hub', status: 'Operational 24/7' },
  { city: 'New York', country: 'United States', code: 'NYC-F1', type: 'Financial District Vault', status: 'Operational 24/7' },
  { city: 'Dubai', country: 'UAE', code: 'DXB-FZ', type: 'Airport Freezone Vault', status: 'Operational 24/7' },
  { city: 'Singapore', country: 'Singapore', code: 'SIN-V3', type: 'Changi Freeport Vault', status: 'Operational 24/7' },
  { city: 'Tokyo', country: 'Japan', code: 'HND-V1', type: 'Haneda High-Security Terminal', status: 'Operational 24/7' },
  { city: 'Geneva', country: 'Switzerland', code: 'GVA-V2', type: 'Diplomatic Pouch Center', status: 'Operational 24/7' },
  { city: 'Hong Kong', country: 'China SAR', code: 'HKG-V1', type: 'International Airport Vault', status: 'Operational 24/7' },
];

export default function CoveragePage() {
  const dummyShipment: any = {
    id: 'coverage-demo',
    trackingNumber: 'SCS-GLOBAL-NETWORK',
    serviceType: 'armored_transit',
    securityLevel: 'maximum_armored',
    transportMode: 'air',
    tamperSealNumber: 'GLOBAL-NETWORK-ACTIVE',
    estimatedDelivery: new Date().toISOString(),
    origin: { lat: 47.3769, lng: 8.5417, address: 'Zurich Vault', city: 'Zurich', country: 'Switzerland' },
    destination: { lat: 40.7081, lng: -74.0086, address: 'NYC Vault', city: 'New York', country: 'United States' },
    currentLocation: { lat: 51.4700, lng: -0.4543, address: 'London Hub', city: 'London', country: 'United Kingdom' },
    routePolyline: [
      [47.3769, 8.5417],   // Zurich
      [51.4700, -0.4543],  // London
      [40.7081, -74.0086], // NYC
      [25.1972, 55.2797],  // Dubai
      [1.2882, 103.7801],  // Singapore
      [35.6749, 139.7537]  // Tokyo
    ],
    statusLogs: [],
    handovers: [],
    incidents: [],
    packageDetails: { declaredValue: 500000000, weightKg: 1000 },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Globe className="w-4 h-4" />
          INTER-HUB ARMORED CORRIDORS
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          Global Coverage & High-Security Vaults
        </h1>
        <p className="text-sm text-slate-300">
          Seamless logistics network connecting 140+ countries across 28 armed vaults and primary airport freezones.
        </p>
      </div>

      {/* Interactive Map */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-400" />
          Primary Global Armored Transit Corridors
        </h2>
        <LeafletMapInner shipment={dummyShipment} exactLocationAuthorized={true} />
      </div>

      {/* Hubs Directory */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Building2 className="w-6 h-6 text-amber-400" />
          Armed Vaults & Transshipment Terminals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GLOBAL_HUBS.map((hub) => (
            <div key={hub.code} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-amber-400 font-bold">{hub.code}</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] uppercase font-bold">
                  {hub.status}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{hub.city} Vault Hub</h3>
                <div className="text-xs text-slate-400">{hub.country}</div>
              </div>

              <div className="text-xs text-slate-300 border-t border-slate-800 pt-3">
                <strong>Facility Type:</strong> {hub.type}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
