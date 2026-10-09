'use client';

import { useState, useRef } from 'react';
import { useShipmentsStore, useUserStore } from '@/lib/store';
import { Shipment, HandoverRecord } from '@/lib/types';
import { 
  Smartphone, 
  ShieldAlert, 
  CheckCircle2, 
  QrCode, 
  MapPin, 
  Navigation, 
  Camera, 
  Key, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  PenTool,
  RotateCcw
} from 'lucide-react';

export default function CourierAppPage() {
  const { shipments, updateShipmentStatus, addHandover, setProofOfDelivery, addIncident } = useShipmentsStore();
  const { user } = useUserStore();

  const [selectedTn, setSelectedTn] = useState<string>(shipments[0]?.trackingNumber || 'SCS-2026-0000000001');
  const [activeScreen, setActiveScreen] = useState<'jobs' | 'handover' | 'pod' | 'sos'>('jobs');
  const [isOnline, setIsOnline] = useState(true);

  // Handover state
  const [receivingHandler, setReceivingHandler] = useState('Officer James Sterling (UK Escort Lead)');
  const [sealVerified, setSealVerified] = useState('SEAL-ZRH-994821');
  const [handoverSuccessMsg, setHandoverSuccessMsg] = useState('');

  // POD State
  const [recipientName, setRecipientName] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [signatureCaptured, setSignatureCaptured] = useState(false);
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [podSuccessMsg, setPodSuccessMsg] = useState('');

  // SOS panic state
  const [sosActive, setSosActive] = useState(false);

  const activeShipment = shipments.find((s) => s.trackingNumber === selectedTn) || shipments[0];

  function handleHandoverSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeShipment) return;
    const handover: HandoverRecord = {
      id: `ho-${Date.now()}`,
      releasingHandler: user.name,
      receivingHandler,
      sealVerified,
      sealStatus: 'intact',
      location: activeShipment.currentLocation.address,
      lat: activeShipment.currentLocation.lat,
      lng: activeShipment.currentLocation.lng,
      timestamp: new Date().toISOString(),
    };
    addHandover(activeShipment.trackingNumber, handover);
    setHandoverSuccessMsg(`HANDOVER LOGGED ✓: Transferred custody to ${receivingHandler} with verified seal ${sealVerified}`);
  }

  function handlePODSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeShipment || !recipientName) return;
    const mockSig = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><path d="M 10 30 Q 50 10 90 35 T 180 20" stroke="%23000" fill="none" stroke-width="3"/></svg>';
    setProofOfDelivery(activeShipment.trackingNumber, {
      id: `pod-${Date.now()}`,
      recipientName,
      signatureUrl: mockSig,
      photoUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60',
      otpVerified: otpInput.length >= 4,
      deliveredAt: new Date().toISOString(),
      lat: activeShipment.destination.lat,
      lng: activeShipment.destination.lng,
    });
    setPodSuccessMsg(`DELIVERY COMPLETED ✓: Proof of delivery signed by ${recipientName}`);
  }

  function triggerSOSPanic() {
    setSosActive(true);
    if (activeShipment) {
      addIncident({
        id: `inc-sos-${Date.now()}`,
        shipmentId: activeShipment.id,
        trackingNumber: activeShipment.trackingNumber,
        severity: 'critical',
        type: 'sos_panic',
        description: `EMERGENCY SOS PANIC BUTTON TRIGGERED BY COURIER ${user.name}`,
        locationName: activeShipment.currentLocation.address,
        lat: activeShipment.currentLocation.lat,
        lng: activeShipment.currentLocation.lng,
        status: 'open',
        reportedBy: user.name,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* PWA Phone Header Mockup */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold">COURIER HANDHELD PWA</div>
              <div className="text-[10px] text-slate-400 font-mono">OFFICER: {user.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono">
            <button onClick={() => setIsOnline(!isOnline)} className="flex items-center gap-1">
              {isOnline ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold"><Wifi className="w-3.5 h-3.5" /> ONLINE</span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1 font-bold"><WifiOff className="w-3.5 h-3.5" /> OFFLINE</span>
              )}
            </button>
          </div>
        </div>

        {/* SOS Emergency Button Bar */}
        <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-300 font-bold">EMERGENCY SOS:</span>
          <button
            onClick={triggerSOSPanic}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition animate-pulse ${
              sosActive ? 'bg-rose-600 text-white ring-4 ring-rose-500/50' : 'bg-rose-500 hover:bg-rose-600 text-white'
            }`}
          >
            {sosActive ? '🚨 SOS ACTIVE (5s BEACON)' : '🚨 SOS PANIC'}
          </button>
        </div>

        {sosActive && (
          <div className="p-3 bg-rose-950 border border-rose-500 rounded-xl text-[11px] text-rose-200 font-mono text-center">
            CRITICAL SOS LOGGED. CONTROL ROOM & ARMED BACKUP NOTIFIED WITH GPS BEACON.
          </div>
        )}

        {/* Screen Switcher */}
        <div className="grid grid-cols-3 gap-2 text-xs pt-1">
          <button
            onClick={() => setActiveScreen('jobs')}
            className={`py-2 rounded-xl font-bold transition ${
              activeScreen === 'jobs' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-300 border border-slate-800'
            }`}
          >
            Assigned Jobs
          </button>

          <button
            onClick={() => setActiveScreen('handover')}
            className={`py-2 rounded-xl font-bold transition ${
              activeScreen === 'handover' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-300 border border-slate-800'
            }`}
          >
            Handover Scan
          </button>

          <button
            onClick={() => setActiveScreen('pod')}
            className={`py-2 rounded-xl font-bold transition ${
              activeScreen === 'pod' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-300 border border-slate-800'
            }`}
          >
            Capture POD
          </button>
        </div>
      </div>

      {/* SCREEN 1: ASSIGNED JOBS */}
      {activeScreen === 'jobs' && (
        <div className="space-y-4 text-xs">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Active Pickup & Delivery Tasks</h2>

          {shipments.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedTn(s.trackingNumber)}
              className={`p-4 rounded-2xl border space-y-3 cursor-pointer transition ${
                selectedTn === s.trackingNumber ? 'bg-slate-900 border-amber-500 shadow-xl' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-amber-400 font-bold">{s.trackingNumber}</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold uppercase">
                  {s.currentStatus}
                </span>
              </div>

              <div>
                <div className="text-white font-bold">{s.sender.city} → {s.recipient.city}</div>
                <div className="text-slate-400 text-[11px]">{s.recipient.address}</div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(s.recipient.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 font-bold flex items-center gap-1 hover:underline"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Turn-by-Turn Nav
                </a>
                <span className="text-[10px] text-slate-500 font-mono">Seal: {s.tamperSealNumber}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SCREEN 2: HANDOVER SCANNER */}
      {activeScreen === 'handover' && activeShipment && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <QrCode className="w-4 h-4 text-amber-400" />
            Chain of Custody Handover Log
          </h2>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px]">
            ACTIVE MANIFEST: <strong className="text-amber-400">{activeShipment.trackingNumber}</strong>
          </div>

          {handoverSuccessMsg && (
            <div className="p-3 bg-emerald-950 border border-emerald-500 rounded-xl text-emerald-300 font-mono text-[11px]">
              {handoverSuccessMsg}
            </div>
          )}

          <form onSubmit={handleHandoverSubmit} className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Receiving Officer Name</label>
              <input
                type="text"
                required
                value={receivingHandler}
                onChange={(e) => setReceivingHandler(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Verified Tamper Seal ID</label>
              <input
                type="text"
                required
                value={sealVerified}
                onChange={(e) => setSealVerified(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs"
            >
              Sign Digital Handover Seal
            </button>
          </form>
        </div>
      )}

      {/* SCREEN 3: PROOF OF DELIVERY */}
      {activeScreen === 'pod' && activeShipment && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Capture Proof of Delivery (POD)
          </h2>

          {podSuccessMsg ? (
            <div className="p-4 bg-emerald-950 border border-emerald-500 text-emerald-300 rounded-2xl text-center space-y-2 font-mono">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div>{podSuccessMsg}</div>
            </div>
          ) : (
            <form onSubmit={handlePODSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Sheikh Mansoor Al-Khalifa"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Recipient OTP Code (Optional)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="e.g. 882914"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              {/* Signature Canvas Pad Simulator */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Recipient Signature Pad</label>
                <div
                  onClick={() => setSignatureCaptured(true)}
                  className="bg-white rounded-lg h-24 flex items-center justify-center text-slate-700 font-bold border cursor-pointer select-none"
                >
                  {signatureCaptured ? (
                    <span className="text-emerald-700 font-mono font-bold">SIGNATURE CAPTURED ✓</span>
                  ) : (
                    <span className="text-slate-400 font-sans text-[11px] flex items-center gap-1">
                      <PenTool className="w-4 h-4" /> Tap to Sign Digital Pad
                    </span>
                  )}
                </div>
              </div>

              {/* Photo Preview Simulator */}
              <div>
                <button
                  type="button"
                  onClick={() => setPhotoCaptured(true)}
                  className="w-full py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 font-semibold flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  {photoCaptured ? 'Photo Attached ✓' : 'Take Cargo Delivery Photo'}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs"
              >
                Complete Delivery & Release Cargo
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
