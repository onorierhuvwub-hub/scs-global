'use client';

import { useEffect, useState } from 'react';
import { useShipmentsStore, useUserStore, useGlobalSettings } from '@/lib/store';
import { calculateQuote, formatCurrency, generateTrackingNumber } from '@/lib/tracking';
import { Shipment, ShipmentStatus, Incident } from '@/lib/types';
import TrackingMap from '@/components/TrackingMap';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  LayoutDashboard, 
  Truck, 
  Package, 
  AlertTriangle, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  Edit3, 
  Radio, 
  Lock, 
  FileText,
  UserX,
  QrCode,
  LogOut,
  Copy,
  ExternalLink
} from 'lucide-react';

const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  Switzerland: [47.3769, 8.5417],
  'United States': [40.7128, -74.006],
  'United Kingdom': [51.5072, -0.1276],
  'United Arab Emirates': [25.2048, 55.2708],
  Singapore: [1.3521, 103.8198],
  Japan: [35.6762, 139.6503],
};

const EMPTY_SHIPMENT_FORM = {
  customerName: '', customerEmail: '', customerPhone: '',
  senderName: '', senderPhone: '', senderEmail: '', senderAddress: '', senderCity: '', senderCountry: 'Switzerland',
  recipientName: '', recipientPhone: '', recipientEmail: '', recipientAddress: '', recipientCity: '', recipientCountry: 'United States',
  description: '', weightKg: '10', declaredValue: '5000',
};

const ANALYTICS_REVENUE = [
  { month: 'May', revenue: 1420000, onTime: 99.4, incidents: 1 },
  { month: 'Jun', revenue: 1890000, onTime: 99.8, incidents: 0 },
  { month: 'Jul', revenue: 2150000, onTime: 99.2, incidents: 2 },
  { month: 'Aug', revenue: 2480000, onTime: 99.9, incidents: 0 },
  { month: 'Sep', revenue: 2910000, onTime: 99.6, incidents: 1 },
  { month: 'Oct', revenue: 3410000, onTime: 100.0, incidents: 0 },
];

export default function AdminPage() {
  const { shipments, addShipment, updateShipmentStatus, addIncident } = useShipmentsStore();
  const { user } = useUserStore();
  const { currency } = useGlobalSettings();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [shipmentForm, setShipmentForm] = useState(EMPTY_SHIPMENT_FORM);
  const [shipmentMessage, setShipmentMessage] = useState('');
  const [registeredTrackingNumber, setRegisteredTrackingNumber] = useState('');

  const [activeTab, setActiveTab] = useState<'fleet' | 'clients' | 'shipments' | 'incidents' | 'analytics' | 'scanner'>('fleet');
  const [clientSearch, setClientSearch] = useState('');
  const [copiedTrackingNumber, setCopiedTrackingNumber] = useState('');
  const [selectedShipmentTn, setSelectedShipmentTn] = useState<string>(shipments[0]?.trackingNumber || 'SCS-2026-0000000001');

  // Status edit modal state
  const [editingTn, setEditingTn] = useState('');
  const [newStatus, setNewStatus] = useState<ShipmentStatus>('IN_TRANSIT');
  const [statusLocation, setStatusLocation] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  // Scanner Simulator state
  const [scannedCode, setScannedCode] = useState('');
  const [scanResultMsg, setScanResultMsg] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/admin/session', { cache: 'no-store' })
      .then((response) => response.json())
      .then((result) => { if (active) setIsAuthenticated(result.authenticated === true); })
      .catch(() => { if (active) setIsAuthenticated(false); });
    return () => { active = false; };
  }, []);

  const activeShipment = shipments.find((s) => s.trackingNumber === selectedShipmentTn) || shipments[0];

  const clients = Array.from(
    shipments.reduce((map, shipment) => {
      const key = shipment.customerEmail?.trim().toLowerCase() || shipment.customerName.trim().toLowerCase();
      if (!key) return map;
      const client = map.get(key) || {
        name: shipment.customerName || shipment.sender.name,
        email: shipment.customerEmail || shipment.sender.email,
        phone: shipment.customerPhone || shipment.sender.phone,
        shipments: [] as Shipment[],
      };
      client.shipments.push(shipment);
      map.set(key, client);
      return map;
    }, new Map<string, { name: string; email: string; phone: string; shipments: Shipment[] }>()),
    ([key, client]) => ({ key, ...client })
  ).filter((client) =>
    `${client.name} ${client.email} ${client.phone}`.toLowerCase().includes(clientSearch.trim().toLowerCase())
  );

  const totalIncidents = shipments.reduce((acc, s) => acc + (s.incidents ? s.incidents.length : 0), 0);
  const activeFleetCount = 14;

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const result = await response.json();
      if (response.ok) {
      setIsAuthenticated(true);
      setLoginPassword('');
      } else {
        setLoginError(result.error || 'Username or password is incorrect.');
      }
    } catch {
      setLoginError('Unable to reach the sign-in service. Please try again.');
    }
  }

  async function handleAdminLogout() {
    await fetch('/api/admin/session', { method: 'DELETE' }).catch(() => undefined);
    setIsAuthenticated(false);
  }

  async function handleRegisterShipment(e: React.FormEvent) {
    e.preventDefault();
    const now = new Date().toISOString();
    const trackingNumber = generateTrackingNumber();
    const originCoordinates = COUNTRY_COORDINATES[shipmentForm.senderCountry] || COUNTRY_COORDINATES.Switzerland;
    const destinationCoordinates = COUNTRY_COORDINATES[shipmentForm.recipientCountry] || COUNTRY_COORDINATES['United States'];
    const weightKg = Number(shipmentForm.weightKg);
    const declaredValue = Number(shipmentForm.declaredValue);
    const serviceType = 'armored_transit' as const;
    const quote = calculateQuote({
      originCountry: shipmentForm.senderCountry,
      destinationCountry: shipmentForm.recipientCountry,
      weightKg,
      declaredValue,
      serviceType,
      insuranceRequired: true,
      specialHandling: ['tamper_seal'],
    });
    const sender = {
      name: shipmentForm.senderName, phone: shipmentForm.senderPhone, email: shipmentForm.senderEmail,
      address: shipmentForm.senderAddress, city: shipmentForm.senderCity, country: shipmentForm.senderCountry,
      lat: originCoordinates[0], lng: originCoordinates[1],
    };
    const recipient = {
      name: shipmentForm.recipientName, phone: shipmentForm.recipientPhone, email: shipmentForm.recipientEmail,
      address: shipmentForm.recipientAddress, city: shipmentForm.recipientCity, country: shipmentForm.recipientCountry,
      lat: destinationCoordinates[0], lng: destinationCoordinates[1],
    };

    addShipment({
      id: `shipment-${Date.now()}`,
      trackingNumber,
      customerName: shipmentForm.customerName,
      customerEmail: shipmentForm.customerEmail,
      customerPhone: shipmentForm.customerPhone,
      accountType: 'individual',
      serviceType,
      securityLevel: 'high_security',
      sender,
      recipient,
      originHub: `${shipmentForm.senderCity} Security Hub`,
      destinationHub: `${shipmentForm.recipientCity} Security Hub`,
      packageDetails: {
        description: shipmentForm.description,
        packageType: shipmentForm.description,
        pieces: 1,
        weightKg,
        dimensionsCm: 'Not specified',
        declaredValue,
        currency: 'USD',
      },
      specialHandling: ['Tamper-Evident Seal'],
      tamperSealNumber: `SEAL-${Math.floor(100000 + Math.random() * 900000)}`,
      currentStatus: 'ORDER_CREATED',
      transportMode: 'air',
      origin: { ...sender, address: sender.address },
      destination: { ...recipient, address: recipient.address },
      currentLocation: { ...sender, address: sender.address, timestamp: now },
      routePolyline: [originCoordinates, destinationCoordinates],
      telemetryHistory: [],
      statusLogs: [{
        id: `log-${Date.now()}`, status: 'ORDER_CREATED', location: `${sender.city}, ${sender.country}`,
        lat: sender.lat, lng: sender.lng, timestamp: now, handlerName: user.name,
        notes: 'Shipment registered by operations.',
      }],
      handovers: [],
      incidents: [],
      pricing: { ...quote, isPaid: false },
      passwordProtected: false,
      estimatedDelivery: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
      updatedAt: now,
    });
    setSelectedShipmentTn(trackingNumber);
    setShipmentMessage(`Shipment registered for ${shipmentForm.customerName}. Sending notification to ${recipient.email}…`);
    setRegisteredTrackingNumber(trackingNumber);
    setShipmentForm(EMPTY_SHIPMENT_FORM);

    try {
      const response = await fetch('/api/shipments/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          trackingNumber,
          origin: `${sender.city}, ${sender.country}`,
          destination: `${recipient.city}, ${recipient.country}`,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setShipmentMessage(`Shipment registered for ${shipmentForm.customerName}. Email notification sent to ${recipient.email}. Tracking number: ${trackingNumber}`);
      } else {
        setShipmentMessage(`Shipment registered. Email was not sent: ${result.error || 'email service unavailable'}`);
      }
    } catch {
      setShipmentMessage('Shipment registered, but the email notification could not be sent. Check the server email configuration and try again.');
    }
  }

  async function copyTrackingNumber(trackingNumber: string) {
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopiedTrackingNumber(trackingNumber);
      window.setTimeout(() => setCopiedTrackingNumber(''), 1800);
    } catch {
      setShipmentMessage(`Tracking number: ${trackingNumber}`);
    }
  }

  function handleUpdateStatusSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTn) return;
    const target = shipments.find((s) => s.trackingNumber === editingTn);
    updateShipmentStatus(
      editingTn,
      newStatus,
      statusLocation || (target ? target.currentLocation.address : 'Control Hub'),
      target ? target.currentLocation.lat : 47.3769,
      target ? target.currentLocation.lng : 8.5417,
      user.name,
      statusNotes || 'Updated by Operations Commander'
    );
    setEditingTn('');
    setStatusNotes('');
  }

  function handleScanSimulate(e: React.FormEvent) {
    e.preventDefault();
    const matched = shipments.find(
      (s) => s.trackingNumber.toUpperCase() === scannedCode.trim().toUpperCase() || s.tamperSealNumber.toUpperCase() === scannedCode.trim().toUpperCase()
    );
    if (matched) {
      setScanResultMsg(`BARCODE VERIFIED ✓: ${matched.trackingNumber} (${matched.packageDetails.description}) - Seal ${matched.tamperSealNumber} INTACT`);
    } else {
      setScanResultMsg(`INVALID BARCODE X: Identifier ${scannedCode} not recognized in active security manifest.`);
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16">
        <form onSubmit={handleAdminLogin} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 text-white">
          <div className="w-14 h-14 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-amber-400 uppercase">SCS Operations</p>
            <h1 className="text-2xl font-extrabold mt-2">Admin sign in</h1>
            <p className="text-sm text-slate-400 mt-2">Enter your operations username and password to open the dashboard.</p>
          </div>
          <label className="block text-sm text-slate-300">Username
            <input required autoComplete="username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white" />
          </label>
          <label className="block text-sm text-slate-300">Password
            <input required type="password" autoComplete="current-password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white" />
          </label>
          {loginError && <p role="alert" className="text-sm text-rose-300">{loginError}</p>}
          <button type="submit" className="w-full rounded-lg bg-amber-500 p-3 font-bold text-slate-950">Sign in securely</button>
        </form>
      </main>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Admin Header & Role Bar */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
            <LayoutDashboard className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">Central Operations Control</h1>
              <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 rounded text-[10px] font-mono uppercase font-extrabold">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live fleet tracking, courier assignment, incident control, and Vault barcode scanning.
            </p>
          </div>
        </div>

        {/* Operations tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setActiveTab('fleet')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'fleet' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-300 border border-slate-800'
              }`}
            >
              Fleet Map
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'clients' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-300 border border-slate-800'
              }`}
            >
              Clients ({clients.length})
            </button>
            <button
              onClick={() => setActiveTab('shipments')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'shipments' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-300 border border-slate-800'
              }`}
            >
              Shipments ({shipments.length})
            </button>
            <button
              onClick={() => setActiveTab('incidents')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'incidents' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-300 border border-slate-800'
              }`}
            >
              Incidents ({totalIncidents})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'analytics' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-300 border border-slate-800'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'scanner' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-300 border border-slate-800'
              }`}
            >
              Vault Scanner
            </button>
          </div>
          <button onClick={() => void handleAdminLogout()} className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-amber-500 hover:text-amber-300">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </div>

      {/* CLIENT DIRECTORY AND TRACKING PORTAL */}
      {activeTab === 'clients' && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">Client registry</h2>
              <p className="text-sm text-slate-400 mt-1">Customer contact records and the tracking numbers assigned to their shipments.</p>
            </div>
            <button onClick={() => { setShipmentMessage(''); setActiveTab('shipments'); }} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950">
              Register client shipment
            </button>
          </div>
          <label className="block max-w-md text-xs text-slate-300">
            Find a client
            <span className="relative mt-1 block">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} placeholder="Name, email, or phone" className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white" />
            </span>
          </label>
          {clients.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
              No client records match this search. Register a shipment to add the customer to the registry.
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map((client) => (
                <article key={client.key} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white">{client.name}</h3>
                      <p className="text-xs text-slate-400">{client.email} {client.phone && `· ${client.phone}`}</p>
                    </div>
                    <span className="text-xs text-amber-300">{client.shipments.length} shipment{client.shipments.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {client.shipments.map((shipment) => (
                      <div key={shipment.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-800 px-3 py-3">
                        <div className="min-w-0">
                          <div className="font-mono text-sm font-bold text-amber-300">{shipment.trackingNumber}</div>
                          <div className="text-xs text-slate-400">{shipment.sender.city}, {shipment.sender.country} → {shipment.recipient.city}, {shipment.recipient.country} · {shipment.currentStatus.replaceAll('_', ' ')}</div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button type="button" onClick={() => void copyTrackingNumber(shipment.trackingNumber)} className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-amber-500">
                            <Copy className="h-3.5 w-3.5" /> {copiedTrackingNumber === shipment.trackingNumber ? 'Copied' : 'Copy number'}
                          </button>
                          <a href={`/track?tn=${encodeURIComponent(shipment.trackingNumber)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950">
                            Track <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Active Fleet Vehicles</span>
          <div className="text-2xl font-extrabold text-white mt-1">{activeFleetCount} Vehicles</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Value In Transit</span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">$7.34M</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">On-Time Delivery Rate</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">99.8%</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Active Security Alerts</span>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">{totalIncidents} Alerts</div>
        </div>
      </div>

      {/* TAB 1: LIVE FLEET MAP */}
      {activeTab === 'fleet' && activeShipment && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Live Vehicle & Telemetry Beacon</span>
              <span className="text-xs text-amber-400 font-mono">SELECTED: {activeShipment.trackingNumber}</span>
            </h2>
            <TrackingMap shipment={activeShipment} exactLocationAuthorized={true} />
          </div>

          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white border-b border-slate-800 pb-3">
              Active Manifest Select
            </h3>
            <div className="space-y-2 text-xs">
              {shipments.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedShipmentTn(s.trackingNumber)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    selectedShipmentTn === s.trackingNumber
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-mono font-bold">{s.trackingNumber}</div>
                  <div className="text-[11px] text-slate-400">{s.sender.city} → {s.recipient.city}</div>
                  <div className="text-[10px] text-amber-400 uppercase font-semibold">{s.currentStatus}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SHIPMENTS MANAGEMENT & STATUS EDIT */}
      {activeTab === 'shipments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <h2 className="text-xl font-extrabold text-white border-b border-slate-800 pb-4">
            Master Shipment Registry
          </h2>

          {shipmentMessage && (
            <div role="status" className="rounded-xl border border-emerald-700 bg-emerald-950/60 p-4 text-sm text-emerald-200">
              {shipmentMessage}
              {registeredTrackingNumber && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => void copyTrackingNumber(registeredTrackingNumber)} className="inline-flex items-center gap-1.5 rounded-md border border-emerald-700 px-3 py-2 text-xs font-semibold hover:bg-emerald-900">
                    <Copy className="h-3.5 w-3.5" /> {copiedTrackingNumber === registeredTrackingNumber ? 'Copied' : 'Copy tracking number'}
                  </button>
                  <a href={`/track?tn=${encodeURIComponent(registeredTrackingNumber)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-950">
                    Open tracking page <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleRegisterShipment} className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white">Register a shipment</h3>
              <p className="text-xs text-slate-400 mt-1">Enter customer and delivery details. A unique tracking number is generated when you save.</p>
            </div>
            {(
              [
                ['Customer details', [
                  ['customerName', 'Customer name'], ['customerEmail', 'Customer email', 'email'], ['customerPhone', 'Customer phone', 'tel'],
                ]],
                ['Sender details', [
                  ['senderName', 'Sender name'], ['senderPhone', 'Sender phone', 'tel'], ['senderEmail', 'Sender email', 'email'], ['senderAddress', 'Pickup address'], ['senderCity', 'Pickup city'],
                ]],
                ['Recipient details', [
                  ['recipientName', 'Recipient name'], ['recipientPhone', 'Recipient phone', 'tel'], ['recipientEmail', 'Recipient email', 'email'], ['recipientAddress', 'Delivery address'], ['recipientCity', 'Delivery city'],
                ]],
                ['Package details', [
                  ['description', 'Package description'], ['weightKg', 'Weight (kg)', 'number'], ['declaredValue', 'Declared value (USD)', 'number'],
                ]],
              ] as const
            ).map(([section, fields]) => (
              <section key={section} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">{section}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {fields.map(([key, label, inputType]) => (
                    <label key={key} className="text-xs text-slate-300">
                      {label}
                      <input
                        required
                        type={inputType || 'text'}
                        min={inputType === 'number' ? '0' : undefined}
                        step={inputType === 'number' ? 'any' : undefined}
                        value={shipmentForm[key]}
                        onChange={(e) => setShipmentForm((current) => ({ ...current, [key]: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white"
                      />
                    </label>
                  ))}
                  {section === 'Sender details' && (
                    <label className="text-xs text-slate-300">Pickup country
                      <select value={shipmentForm.senderCountry} onChange={(e) => setShipmentForm((current) => ({ ...current, senderCountry: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white">
                        {Object.keys(COUNTRY_COORDINATES).map((country) => <option key={country}>{country}</option>)}
                      </select>
                    </label>
                  )}
                  {section === 'Recipient details' && (
                    <label className="text-xs text-slate-300">Delivery country
                      <select value={shipmentForm.recipientCountry} onChange={(e) => setShipmentForm((current) => ({ ...current, recipientCountry: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white">
                        {Object.keys(COUNTRY_COORDINATES).map((country) => <option key={country}>{country}</option>)}
                      </select>
                    </label>
                  )}
                </div>
              </section>
            ))}
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400">
              <Plus className="w-4 h-4" /> Save shipment and generate tracking number
            </button>
          </form>

          {/* Status Edit Modal Banner */}
          {editingTn && (
            <form onSubmit={handleUpdateStatusSubmit} className="p-4 bg-amber-950/90 border border-amber-500/60 rounded-xl space-y-3 text-xs">
              <div className="font-bold text-amber-400 uppercase font-mono">
                UPDATE MANIFEST STATUS FOR: {editingTn}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="PICKUP_SCHEDULED">PICKUP SCHEDULED</option>
                    <option value="PICKED_UP">PICKED UP</option>
                    <option value="SECURITY_SCREENING">SECURITY SCREENING</option>
                    <option value="IN_TRANSIT">IN TRANSIT</option>
                    <option value="ARRIVED_AT_HUB">ARRIVED AT HUB</option>
                    <option value="CUSTOMS_CLEARANCE">CUSTOMS CLEARANCE</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="ON_HOLD">ON HOLD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Scan Location</label>
                  <input
                    type="text"
                    value={statusLocation}
                    onChange={(e) => setStatusLocation(e.target.value)}
                    placeholder="e.g. Heathrow Terminal 3 Vault"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Audit Notes</label>
                  <input
                    type="text"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="e.g. X-ray density scan cleared"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs">
                  Save Status Update & Log
                </button>
                <button type="button" onClick={() => setEditingTn('')} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-slate-800 overflow-x-auto text-xs">
            {shipments.map((s) => (
              <div key={s.id} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-mono text-amber-400 font-bold text-sm">{s.trackingNumber}</div>
                  <div className="text-white font-medium">{s.sender.city} → {s.recipient.city}</div>
                  <div className="text-slate-400">Customer: {s.customerName} | Seal: <code className="text-emerald-400">{s.tamperSealNumber}</code></div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold uppercase text-[10px]">
                    {s.currentStatus.replace(/_/g, ' ')}
                  </span>
                  <button
                    onClick={() => { setEditingTn(s.trackingNumber); setNewStatus(s.currentStatus); }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INCIDENTS MANAGEMENT */}
      {activeTab === 'incidents' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <h2 className="text-xl font-extrabold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Active Security Incidents & Geofence Logs
          </h2>

          <div className="space-y-4 text-xs">
            {shipments.flatMap((s) => s.incidents || []).map((inc) => (
              <div key={inc.id} className="bg-slate-950 p-4 rounded-xl border border-rose-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-rose-400 font-bold">{inc.trackingNumber}</span>
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded uppercase text-[10px] font-bold">
                    SEVERITY: {inc.severity.toUpperCase()}
                  </span>
                </div>
                <div className="text-white font-bold">{inc.type.replace(/_/g, ' ').toUpperCase()}: {inc.description}</div>
                <div className="text-slate-400">Location: {inc.locationName} | Reported by: {inc.reportedBy}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RECHARTS ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-8">
          <h2 className="text-xl font-extrabold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            Financial & Operational Performance Analytics
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-300">Monthly Revenue (USD $)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ANALYTICS_REVENUE}>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFF' }} />
                    <Bar dataKey="revenue" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-300">On-Time Delivery Rate (%)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ANALYTICS_REVENUE}>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis domain={[98, 100]} stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFF' }} />
                    <Line type="monotone" dataKey="onTime" stroke="#10B981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: VAULT SCANNER SIMULATOR */}
      {activeTab === 'scanner' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 max-w-2xl mx-auto text-center">
          <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl w-fit mx-auto">
            <QrCode className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Vault Barcode Scanner Simulator</h2>
          <p className="text-xs text-slate-300">
            Simulate scanning a package barcode or tamper seal ID at a vault dock.
          </p>

          <form onSubmit={handleScanSimulate} className="space-y-4 text-xs">
            <input
              type="text"
              required
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              placeholder="Enter or scan barcode (e.g. SCS-2026-0000000001 or SEAL-ZRH-994821)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-center text-white font-mono"
            />
            <button
              type="submit"
              className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
            >
              Verify Seal & Handover Code
            </button>
          </form>

          {scanResultMsg && (
            <div className={`p-4 rounded-xl border text-xs font-mono font-bold ${
              scanResultMsg.includes('VERIFIED') ? 'bg-emerald-950 text-emerald-300 border-emerald-500' : 'bg-rose-950 text-rose-300 border-rose-500'
            }`}>
              {scanResultMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
