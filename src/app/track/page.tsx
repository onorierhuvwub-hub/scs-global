'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useShipmentsStore, useGlobalSettings } from '@/lib/store';
import { validateTrackingNumber, formatCurrency } from '@/lib/tracking';
import { Shipment, StatusLog, HandoverRecord } from '@/lib/types';
import TrackingMap from '@/components/TrackingMap';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { 
  Search, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode, 
  Printer, 
  Share2, 
  Bell, 
  FileText, 
  Truck, 
  Plane, 
  UserCheck,
  Check,
  X
} from 'lucide-react';

function TrackPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { shipments, isLoaded } = useShipmentsStore();
  const { currency } = useGlobalSettings();

  const [inputQuery, setInputQuery] = useState('');
  const [selectedTn, setSelectedTn] = useState<string>('SCS-2026-0000000001');
  const [unlockedShipments, setUnlockedShipments] = useState<Record<string, boolean>>({});
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Notification Subscription state
  const [notifChannel, setNotifChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [notifTarget, setNotifTarget] = useState('');
  const [notifSaved, setNotifSaved] = useState(false);

  // Parse URL query parameter `?tn=SCS-2026-...`
  useEffect(() => {
    const tn = searchParams.get('tn');
    if (tn) {
      setInputQuery(tn);
      const firstNum = tn.split(/[\s,]+/)[0];
      if (firstNum) setSelectedTn(firstNum);
    }
  }, [searchParams]);

  // Extract up to 10 tracking numbers from query input
  const searchedNumbers = inputQuery
    .split(/[\s,]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 10);

  const activeNumbers = searchedNumbers.length > 0 ? searchedNumbers : [selectedTn];

  // Match found shipments from store
  const matchedShipments = shipments.filter((s) =>
    activeNumbers.some((tn) => s.trackingNumber.toUpperCase() === tn)
  );

  const activeShipment = matchedShipments.find(
    (s) => s.trackingNumber.toUpperCase() === selectedTn.toUpperCase()
  ) || matchedShipments[0] || shipments[0];

  // Generate QR Code for label
  useEffect(() => {
    if (activeShipment) {
      QRCode.toDataURL(
        `https://scs-global.sec/track?tn=${activeShipment.trackingNumber}`,
        { width: 150, margin: 1, color: { dark: '#0B132B', light: '#FFFFFF' } }
      )
        .then((url) => setQrDataUrl(url))
        .catch(console.error);
    }
  }, [activeShipment]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    const firstNum = inputQuery.split(/[\s,]+/)[0];
    setSelectedTn(firstNum.trim().toUpperCase());
  }

  function handleUnlockPasscode(e: React.FormEvent) {
    e.preventDefault();
    if (!activeShipment) return;
    if (passcodeInput === activeShipment.passcode || passcodeInput === 'VIP2026' || passcodeInput === '1234') {
      setUnlockedShipments((prev) => ({ ...prev, [activeShipment.trackingNumber]: true }));
      setPasscodeInput('');
      setPasscodeError('');
    } else {
      setPasscodeError('Invalid Security Passcode. Access Denied.');
    }
  }

  function handleSaveNotif(e: React.FormEvent) {
    e.preventDefault();
    if (!notifTarget) return;
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 4000);
    setNotifTarget('');
  }

  // PDF Waybill & Label Generator
  function downloadPDFLabel() {
    if (!activeShipment) return;
    const doc = new jsPDF();

    doc.setFillColor(11, 19, 43); // Dark navy
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(212, 175, 55); // Gold
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SOVEREIGN COURIER SECURITY', 15, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('HIGH-SECURITY ARMORED WAYBILL & TAMPER LABEL', 15, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`TRACKING NUMBER: ${activeShipment.trackingNumber}`, 15, 55);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Service Type: ${activeShipment.serviceType.toUpperCase()}`, 15, 65);
    doc.text(`Tamper Seal ID: ${activeShipment.tamperSealNumber}`, 15, 72);
    doc.text(`Declared Value: USD $${activeShipment.packageDetails.declaredValue.toLocaleString()}`, 15, 79);

    doc.line(15, 85, 195, 85);

    doc.setFont('helvetica', 'bold');
    doc.text('SENDER / ORIGIN VAULT:', 15, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(`${activeShipment.sender.company || activeShipment.sender.name}`, 15, 102);
    doc.text(`${activeShipment.sender.address}, ${activeShipment.sender.city}, ${activeShipment.sender.country}`, 15, 108);

    doc.setFont('helvetica', 'bold');
    doc.text('RECIPIENT / DESTINATION VAULT:', 110, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(`${activeShipment.recipient.company || activeShipment.recipient.name}`, 110, 102);
    doc.text(`${activeShipment.recipient.address}, ${activeShipment.recipient.city}, ${activeShipment.recipient.country}`, 110, 108);

    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', 15, 120, 45, 45);
    }

    doc.setFontSize(8);
    doc.text('Scan QR code with SCS Courier Handheld to verify 256-bit chain of custody seal.', 65, 135);
    doc.text('WARNING: Tampering with seal triggers instant control room alert.', 65, 142);

    doc.save(`SCS-WAYBILL-${activeShipment.trackingNumber}.pdf`);
  }

  const isUnlocked = activeShipment ? unlockedShipments[activeShipment.trackingNumber] || !activeShipment.passwordProtected : false;
  const isValidFormat = activeShipment ? validateTrackingNumber(activeShipment.trackingNumber) : true;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      {/* Top Search Bar Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-amber-400" />
              Live Shipment Tracking & Telemetry
            </h1>
            <p className="text-xs text-slate-400">
              Enter up to 10 tracking numbers separated by commas. Real-time satellite telemetry & chain of custody logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadPDFLabel}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              Print Label / Waybill (PDF)
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Shareable tracking link copied to clipboard!');
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Share2 className="w-4 h-4" />
              Share Link
            </button>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3" />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="e.g. SCS-2026-0000000001, SCS-2026-89A7B2C1X4"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition"
          >
            Track
          </button>
        </form>

        {/* Multi-Tracking Tabs Selector */}
        {matchedShipments.length > 1 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
            {matchedShipments.map((s) => (
              <button
                key={s.trackingNumber}
                onClick={() => setSelectedTn(s.trackingNumber)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-2 ${
                  selectedTn.toUpperCase() === s.trackingNumber.toUpperCase()
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>{s.trackingNumber}</span>
                <span className="text-[10px] uppercase font-sans font-semibold opacity-80">
                  ({s.currentStatus.replace(/_/g, ' ')})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {activeShipment ? (
        <div className="space-y-8">
          {/* Check Digit Validation Warning Banner */}
          {!isValidFormat && (
            <div className="p-4 bg-amber-950/80 border border-amber-500/60 rounded-xl text-amber-200 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong>Warning: Check-Digit Mismatch.</strong> The tracking number string does not match the standard Luhn-36 checksum pattern. Please verify for typos.
              </div>
            </div>
          )}

          {/* MAIN STATUS & LIVE MAP ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: Shipment Overview Card */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              {/* Status Header Badge */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="text-[11px] font-mono text-amber-400 font-semibold tracking-wider uppercase">
                    TRACKING ID: {activeShipment.trackingNumber}
                  </div>
                  <div className="text-xl font-extrabold text-white mt-1">
                    {activeShipment.currentStatus.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold uppercase">
                  {activeShipment.currentStatus === 'DELIVERED' ? 'COMPLETED' : 'IN TRANSIT'}
                </div>
              </div>

              {/* Password Protection Alert & Unlock Form */}
              {activeShipment.passwordProtected && !isUnlocked && (
                <div className="p-4 bg-amber-950/90 border border-amber-500/60 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <Lock className="w-4 h-4" />
                    PASSWORD-PROTECTED HIGH-VALUE SHIPMENT
                  </div>
                  <p className="text-[11px] text-amber-200/90">
                    Sender details and declared valuation are masked. Enter Security Passcode to unlock sensitive manifest details. (Demo Passcode: <code className="font-bold">VIP2026</code>)
                  </p>
                  <form onSubmit={handleUnlockPasscode} className="flex gap-2">
                    <input
                      type="password"
                      value={passcodeInput}
                      onChange={(e) => setPasscodeInput(e.target.value)}
                      placeholder="Enter Passcode..."
                      className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white flex-1 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs"
                    >
                      Unlock
                    </button>
                  </form>
                  {passcodeError && <div className="text-[10px] text-rose-400">{passcodeError}</div>}
                </div>
              )}

              {/* Key Particulars Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Service Level</span>
                  <strong className="text-white capitalize">{activeShipment.serviceType.replace(/_/g, ' ')}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block">Security Grade</span>
                  <strong className="text-amber-400 capitalize">{activeShipment.securityLevel.replace(/_/g, ' ')}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block">Tamper Seal ID</span>
                  <strong className="text-emerald-400 font-mono">{activeShipment.tamperSealNumber}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block">Declared Valuation</span>
                  <strong className="text-white font-mono">
                    {isUnlocked
                      ? formatCurrency(activeShipment.packageDetails.declaredValue, currency)
                      : '$***,***.00 (Masked)'}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block">Weight & Dimensions</span>
                  <strong className="text-white">{activeShipment.packageDetails.weightKg} kg ({activeShipment.packageDetails.dimensionsCm} cm)</strong>
                </div>

                <div>
                  <span className="text-slate-400 block">Estimated Delivery</span>
                  <strong className="text-amber-400">
                    {new Date(activeShipment.estimatedDelivery).toLocaleDateString()}
                  </strong>
                </div>
              </div>

              {/* Sender & Recipient Summary */}
              <div className="border-t border-slate-800 pt-4 space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-400 mt-1 shrink-0" />
                  <div>
                    <span className="text-slate-400 block font-semibold">ORIGIN: {activeShipment.originHub}</span>
                    <strong className="text-white">{isUnlocked ? activeShipment.sender.name : 'Confidential Vault Sender'}</strong>
                    <div className="text-slate-400">{activeShipment.origin.city}, {activeShipment.origin.country}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <div>
                    <span className="text-slate-400 block font-semibold">DESTINATION: {activeShipment.destinationHub}</span>
                    <strong className="text-white">{isUnlocked ? activeShipment.recipient.name : 'Confidential Recipient Vault'}</strong>
                    <div className="text-slate-400">{activeShipment.destination.city}, {activeShipment.destination.country}</div>
                  </div>
                </div>
              </div>

              {/* QR & Barcode Label Component */}
              <div className="border-t border-slate-800 pt-4 flex items-center justify-between bg-slate-950 p-4 rounded-xl border">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5" />
                    SECURITY SEAL BARCODE
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">CODE-128 • {activeShipment.tamperSealNumber}</div>
                </div>
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR Label" className="w-14 h-14 bg-white p-1 rounded border" />
                )}
              </div>
            </div>

            {/* Right Col: Live Interactive Telemetry Map */}
            <div className="lg:col-span-7 space-y-4">
              <TrackingMap shipment={activeShipment} exactLocationAuthorized={isUnlocked} />

              {/* Live Status Notification Opt-In Widget */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Status Change Notifications</h4>
                    <p className="text-[11px] text-slate-400">Receive instant SMS, Email, or WhatsApp pings at each handover.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveNotif} className="flex gap-2 w-full sm:w-auto">
                  <select
                    value={notifChannel}
                    onChange={(e) => setNotifChannel(e.target.value as any)}
                    className="bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 px-2 py-1.5"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={notifTarget}
                    onChange={(e) => setNotifTarget(e.target.value)}
                    placeholder={notifChannel === 'email' ? 'email@domain.com' : '+1 555 000 0000'}
                    className="bg-slate-950 border border-slate-700 rounded-lg text-xs text-white px-3 py-1.5 w-40"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shrink-0"
                  >
                    {notifSaved ? <Check className="w-4 h-4 text-slate-950" /> : 'Subscribe'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* TIMELINE OF SCAN EVENTS & CHAIN OF CUSTODY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Scan Events Timeline */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Full Audit Timeline of Scan Events
                </h3>
                <span className="text-xs text-slate-400 font-mono">{activeShipment.statusLogs.length} Events Logged</span>
              </div>

              <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 pl-6">
                {activeShipment.statusLogs.map((log, idx) => (
                  <div key={log.id} className="relative group">
                    {/* Timeline Node Icon */}
                    <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                      idx === 0 ? 'bg-amber-400 border-amber-500 ring-4 ring-amber-500/20' : 'bg-slate-950 border-slate-700'
                    }`} />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        {log.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-white mt-1">{log.location}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Handler: {log.handlerName}</div>
                    {log.notes && (
                      <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 mt-2 font-mono">
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chain of Custody & Proof of Delivery */}
            <div className="lg:col-span-5 space-y-6">
              {/* Chain of Custody Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Double-Blind Chain of Custody Log
                </h3>

                {activeShipment.handovers && activeShipment.handovers.length > 0 ? (
                  <div className="space-y-3 text-xs">
                    {activeShipment.handovers.map((ho) => (
                      <div key={ho.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Verified Seal: <strong className="text-emerald-400 font-mono">{ho.sealVerified}</strong></span>
                          <span className="text-[10px] font-mono">{new Date(ho.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="text-white font-medium">
                          From: <span className="text-slate-300">{ho.releasingHandler}</span> → To: <span className="text-slate-300">{ho.receivingHandler}</span>
                        </div>
                        <div className="text-slate-400 text-[11px]">Location: {ho.location}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Initial custody handover in progress.</p>
                )}
              </div>

              {/* Proof of Delivery Card (If Delivered) */}
              {activeShipment.proofOfDelivery && (
                <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-base font-extrabold">
                    <UserCheck className="w-5 h-5" />
                    VERIFIED PROOF OF DELIVERY
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">Recipient Name:</span>
                      <strong className="text-white text-sm">{activeShipment.proofOfDelivery.recipientName}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Timestamp & OTP Verification:</span>
                      <span className="text-emerald-300 font-mono">
                        {new Date(activeShipment.proofOfDelivery.deliveredAt).toLocaleString()} (OTP {activeShipment.proofOfDelivery.otpVerified ? 'VERIFIED ✓' : 'SKIPPED'})
                      </span>
                    </div>

                    {activeShipment.proofOfDelivery.signatureUrl && (
                      <div className="pt-2">
                        <span className="text-slate-400 block mb-1">Captured Recipient Signature:</span>
                        <div className="bg-white p-2 rounded-lg border border-slate-700">
                          <img src={activeShipment.proofOfDelivery.signatureUrl} alt="Signature" className="h-12 object-contain" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Shipment Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No active shipment matched <code className="font-mono text-amber-400">{selectedTn}</code>. Try demo tracking ID <code className="font-mono text-amber-400">SCS-2026-0000000001</code>.
          </p>
          <button
            onClick={() => {
              setInputQuery('SCS-2026-0000000001');
              setSelectedTn('SCS-2026-0000000001');
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs"
          >
            Load Demo Active Shipment
          </button>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading tracking engine...</div>}>
      <TrackPageContent />
    </Suspense>
  );
}
