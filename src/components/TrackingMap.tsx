'use client';

import dynamic from 'next/dynamic';
import { Shipment } from '@/lib/types';
import { ShieldCheck, Loader2 } from 'lucide-react';

const LeafletMapInner = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-400 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      <span className="text-sm font-medium tracking-wide">Initializing Satellite Telemetry & High-Security Map...</span>
    </div>
  ),
});

interface TrackingMapProps {
  shipment: Shipment;
  exactLocationAuthorized?: boolean;
}

export default function TrackingMap({ shipment, exactLocationAuthorized = true }: TrackingMapProps) {
  return <LeafletMapInner shipment={shipment} exactLocationAuthorized={exactLocationAuthorized} />;
}
