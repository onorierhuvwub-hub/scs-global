'use client';

import { useState, useEffect } from 'react';
import { useShipmentsStore, useGlobalSettings } from '@/lib/store';
import { endCustomerSession, readCustomerSession, registerCustomerAccount, signInCustomer, type CustomerSession } from '@/lib/auth';
import { generateTrackingNumber, calculateQuote, formatCurrency } from '@/lib/tracking';
import { Shipment, ServiceType, SecurityLevel } from '@/lib/types';
import jsPDF from 'jspdf';
import { 
  Package, 
  Plus, 
  FileSpreadsheet, 
  BookOpen, 
  FileText, 
  Key, 
  Lock, 
  ShieldCheck, 
  Search, 
  Printer, 
  CreditCard, 
  DollarSign, 
  Check, 
  AlertCircle, 
  Clock, 
  Download,
  User as UserIcon,
  LogOut,
  Upload
} from 'lucide-react';

export default function CustomerPortalPage() {
  const { shipments, addShipment, isLoaded } = useShipmentsStore();
  const { currency } = useGlobalSettings();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'bulk' | 'history' | 'addresses' | 'apikeys'>('dashboard');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [portalSession, setPortalSession] = useState<CustomerSession | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [shipmentSearch, setShipmentSearch] = useState('');

  // Create Shipment Form State
  const [senderName, setSenderName] = useState('Zurich Vault Ops');
  const [senderAddress, setSenderAddress] = useState('Bahnhofstrasse 45, Zurich, Switzerland');
  const [senderPhone, setSenderPhone] = useState('+41 44 211 4000');
  
  const [recipientName, setRecipientName] = useState('Federal Reserve Bank NY');
  const [recipientAddress, setRecipientAddress] = useState('33 Liberty Street, New York, USA');
  const [recipientPhone, setRecipientPhone] = useState('+1 212 720 5000');
  
  const [serviceType, setServiceType] = useState<ServiceType>('armored_transit');
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>('maximum_armored');
  const [packageType, setPackageType] = useState('Tamper-Evident Steel Case');
  const [weightKg, setWeightKg] = useState(25);
  const [dimensionsCm, setDimensionsCm] = useState('40x30x20');
  const [declaredValue, setDeclaredValue] = useState(1500000);
  const [specialHandling, setSpecialHandling] = useState<string[]>(['Tamper-Evident Seal', 'Dual Armed Escort']);
  const [passcode, setPasscode] = useState('VIP2026');
  const [createdSuccessTn, setCreatedSuccessTn] = useState('');

  // Bulk CSV Upload State
  const [csvText, setCsvText] = useState(`Sender,Recipient,WeightKg,DeclaredValue,ServiceType\nZurich Vault,London Vault,10.5,500000,armored_transit\nParis Store,Dubai Mall,8.2,890000,high_value_cargo`);
  const [bulkStatus, setBulkStatus] = useState('');

  // API Key State
  const [apiKeys, setApiKeys] = useState([
    { name: 'Production Logistics Webhook', key: 'scs_live_sk_991823901823901', created: '2026-09-01' },
  ]);

  const customerShipments = shipments.filter((shipment) =>
    !!portalSession && [shipment.customerEmail, shipment.sender.email, shipment.recipient.email]
      .some((email) => email.toLowerCase() === portalSession.email.toLowerCase())
  );
  const filteredCustomerShipments = customerShipments.filter((shipment) =>
    shipment.trackingNumber.toLowerCase().includes(shipmentSearch.trim().toLowerCase())
  );

  const activeCount = customerShipments.filter((s) => s.currentStatus !== 'DELIVERED').length;
  const deliveredCount = customerShipments.filter((s) => s.currentStatus === 'DELIVERED').length;
  const totalSpent = customerShipments.reduce((acc, s) => acc + s.pricing.totalAmount, 0);

  useEffect(() => {
    const storedSession = readCustomerSession();
    if (storedSession) {
      setPortalSession(storedSession);
      setIsLoggedIn(true);
    }
  }, []);

  async function handleCustomerAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    const result = authMode === 'register'
      ? await registerCustomerAccount(authName, authEmail, authPassword, shipments)
      : await signInCustomer(authEmail, authPassword);
    if (!result.ok) {
      setAuthError(result.error);
      return;
    }
    setPortalSession(result.session);
    setIsLoggedIn(true);
  }

  function handleCustomerLogout() {
    endCustomerSession();
    setPortalSession(null);
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  }

  function handleCreateShipment(e: React.FormEvent) {
    e.preventDefault();
    const trackingNum = generateTrackingNumber();
    const quote = calculateQuote({
      originCountry: 'Switzerland',
      destinationCountry: 'United States',
      weightKg,
      declaredValue,
      serviceType,
      insuranceRequired: true,
      specialHandling,
    });

    const newShipment: Shipment = {
      id: `shipment-${Date.now()}`,
      trackingNumber: trackingNum,
      customerName: portalSession?.name || '',
      customerEmail: portalSession?.email || '',
      customerPhone: '',
      accountType: 'corporate',
      serviceType,
      securityLevel,
      sender: {
        name: senderName,
        phone: senderPhone,
        email: portalSession?.email || '',
        address: senderAddress,
        city: 'Zurich',
        country: 'Switzerland',
        lat: 47.3769,
        lng: 8.5417,
      },
      recipient: {
        name: recipientName,
        phone: recipientPhone,
        email: 'recipient@vault.com',
        address: recipientAddress,
        city: 'New York',
        country: 'United States',
        lat: 40.7081,
        lng: -74.0086,
      },
      originHub: 'Zurich Vault Hub (ZRH-V1)',
      destinationHub: 'New York Vault Hub (NYC-F1)',
      packageDetails: {
        description: 'Physical High-Value Security Cargo',
        packageType,
        pieces: 1,
        weightKg,
        dimensionsCm,
        declaredValue,
        currency: 'USD',
      },
      specialHandling,
      tamperSealNumber: `SEAL-${Math.floor(100000 + Math.random() * 900000)}`,
      currentStatus: 'ORDER_CREATED',
      transportMode: 'air',
      origin: { lat: 47.3769, lng: 8.5417, address: senderAddress, city: 'Zurich', country: 'Switzerland' },
      destination: { lat: 40.7081, lng: -74.0086, address: recipientAddress, city: 'New York', country: 'United States' },
      currentLocation: { lat: 47.3769, lng: 8.5417, address: senderAddress, city: 'Zurich', country: 'Switzerland' },
      routePolyline: [[47.3769, 8.5417], [40.7081, -74.0086]],
      telemetryHistory: [],
      statusLogs: [
        {
          id: `log-${Date.now()}`,
          status: 'ORDER_CREATED',
          location: 'Zurich Vault Hub',
          lat: 47.3769,
          lng: 8.5417,
          timestamp: new Date().toISOString(),
          handlerName: portalSession?.name || '',
          notes: 'Shipment created via Client Portal.',
        },
      ],
      handovers: [],
      incidents: [],
      pricing: {
        ...quote,
        isPaid: true,
      },
      passwordProtected: true,
      passcode,
      estimatedDelivery: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addShipment(newShipment);
    setCreatedSuccessTn(trackingNum);
  }

  function handleBulkUpload(e: React.FormEvent) {
    e.preventDefault();
    const lines = csvText.trim().split('\n');
    let count = 0;
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const parts = lines[i].split(',');
      if (parts.length >= 4) {
        const tn = generateTrackingNumber();
        const newShipment: Shipment = {
          id: `shipment-bulk-${Date.now()}-${i}`,
          trackingNumber: tn,
          customerName: portalSession?.name || '',
          customerEmail: portalSession?.email || '',
          customerPhone: '',
          accountType: 'corporate',
          serviceType: (parts[4]?.trim() as ServiceType) || 'armored_transit',
          securityLevel: 'high_security',
          sender: { name: parts[0]?.trim() || 'Origin Vault', phone: '+1 555 000', email: portalSession?.email || '', address: 'Bulk Dock', city: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417 },
          recipient: { name: parts[1]?.trim() || 'Dest Vault', phone: '+1 555 000', email: 'dest@vault.com', address: 'Bulk Vault', city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
          originHub: 'Zurich Hub',
          destinationHub: 'London Hub',
          packageDetails: { description: 'Bulk Batch Cargo', packageType: 'Case', pieces: 1, weightKg: Number(parts[2]) || 10, dimensionsCm: '30x30x30', declaredValue: Number(parts[3]) || 100000, currency: 'USD' },
          specialHandling: ['Tamper-Evident Seal'],
          tamperSealNumber: `SEAL-BULK-${Math.floor(100000 + Math.random() * 900000)}`,
          currentStatus: 'ORDER_CREATED',
          transportMode: 'road',
          origin: { lat: 47.3769, lng: 8.5417, address: 'Bulk Dock', city: 'Zurich', country: 'Switzerland' },
          destination: { lat: 51.5074, lng: -0.1278, address: 'Bulk Vault', city: 'London', country: 'UK' },
          currentLocation: { lat: 47.3769, lng: 8.5417, address: 'Bulk Dock', city: 'Zurich', country: 'Switzerland' },
          routePolyline: [[47.3769, 8.5417], [51.5074, -0.1278]],
          telemetryHistory: [],
          statusLogs: [{ id: `log-${Date.now()}`, status: 'ORDER_CREATED', location: 'Bulk Processing Dock', lat: 47.3769, lng: 8.5417, timestamp: new Date().toISOString(), handlerName: portalSession?.name || '' }],
          handovers: [],
          incidents: [],
          pricing: { baseRate: 500, fuelSurcharge: 60, securitySurcharge: 100, insurancePremium: 800, tax: 73, totalAmount: 1533, currency: 'USD', isPaid: true },
          estimatedDelivery: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addShipment(newShipment);
        count++;
      }
    }
    setBulkStatus(`Successfully batch-created ${count} secure shipments with check-digit tracking IDs!`);
  }

  function exportCSVHistory() {
    let content = 'TrackingNumber,Status,ServiceType,WeightKg,DeclaredValue,TotalAmount\n';
    customerShipments.forEach((s) => {
      content += `${s.trackingNumber},${s.currentStatus},${s.serviceType},${s.packageDetails.weightKg},${s.packageDetails.declaredValue},${s.pricing.totalAmount}\n`;
    });
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SCS-Shipment-History-${Date.now()}.csv`;
    a.click();
  }

  if (!isLoggedIn || !portalSession) {
    return (
      <main className="max-w-lg mx-auto px-4 py-14">
        <form onSubmit={handleCustomerAuth} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-5 text-white">
          <div className="w-14 h-14 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-amber-400 uppercase">SCS Client Portal</p>
            <h1 className="text-2xl font-extrabold mt-2">{authMode === 'login' ? 'Sign in to your shipments' : 'Create your customer account'}</h1>
            <p className="text-sm text-slate-400 mt-2">
              Sign in to view shipments associated with your email and open live tracking by tracking number.
            </p>
          </div>
          {authMode === 'register' && (
            <label className="block text-sm text-slate-300">Name
              <input required autoComplete="name" value={authName} onChange={(e) => setAuthName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white" />
            </label>
          )}
          <label className="block text-sm text-slate-300">Email
            <input required type="email" autoComplete="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white" />
          </label>
          <label className="block text-sm text-slate-300">Password
            <input required type="password" minLength={8} autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white" />
            {authMode === 'register' && <span className="block text-xs text-slate-500 mt-1">Use at least 8 characters.</span>}
          </label>
          {authError && <p role="alert" className="text-sm text-rose-300">{authError}</p>}
          {authMode === 'register' && !isLoaded && <p className="text-xs text-slate-400">Loading registered shipments…</p>}
          <button type="submit" disabled={authMode === 'register' && !isLoaded} className="w-full rounded-lg bg-amber-500 p-3 font-bold text-slate-950 disabled:opacity-50">
            {authMode === 'login' ? 'Sign in' : 'Create account'}
          </button>
          <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="w-full text-sm text-amber-300 hover:text-amber-200">
            {authMode === 'login' ? 'First time here? Create an account' : 'Already registered? Sign in'}
          </button>
          {authMode === 'register' && <p className="text-xs text-slate-500">Accounts can be created only for an email already attached to a shipment. Ask operations to register your shipment first.</p>}
          <p className="text-xs text-slate-500">This demo keeps account credentials in this browser. Connect server-side authentication before production use.</p>
        </form>
      </main>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{portalSession.name}</h1>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-mono uppercase font-bold">
                CORPORATE CLIENT
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">{portalSession.email}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => { setActiveTab('dashboard'); setCreatedSuccessTn(''); }}
            className={`px-3.5 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => { setActiveTab('create'); setCreatedSuccessTn(''); }}
            className={`px-3.5 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'create' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            New Shipment
          </button>

          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'bulk' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Bulk CSV Upload
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            History ({customerShipments.length})
          </button>

          <button
            onClick={() => setActiveTab('apikeys')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'apikeys' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            API & Webhooks
          </button>
          <button onClick={handleCustomerLogout} className="px-3.5 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Summary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Active Transit Cargo</span>
                <div className="text-3xl font-extrabold text-amber-400 mt-1">{activeCount}</div>
              </div>
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Delivered Vault Items</span>
                <div className="text-3xl font-extrabold text-emerald-400 mt-1">{deliveredCount}</div>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Check className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Account Invoiced</span>
                <div className="text-2xl font-extrabold text-white mt-1 font-mono">{formatCurrency(totalSpent, currency)}</div>
              </div>
              <div className="p-3 bg-slate-800 text-slate-300 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Active Shipments List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Active Armored Shipments</span>
              <span className="text-xs text-slate-400 font-mono">{customerShipments.length} Total</span>
            </h2>

            <label className="block text-xs font-semibold text-slate-300">Find a shipment by tracking number
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input value={shipmentSearch} onChange={(e) => setShipmentSearch(e.target.value)} placeholder="SCS-2026-…" className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm font-mono text-white" />
              </div>
            </label>

            <div className="divide-y divide-slate-800 overflow-x-auto">
              {filteredCustomerShipments.map((s) => (
                <div key={s.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400 font-bold text-sm">{s.trackingNumber}</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded uppercase text-[10px] font-bold">
                        {s.serviceType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-slate-300 font-medium">
                      {s.sender.city} → {s.recipient.city}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Seal: <code className="text-emerald-400">{s.tamperSealNumber}</code> | Declared: USD ${s.packageDetails.declaredValue.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[11px] font-bold uppercase block">
                        {s.currentStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        ETA: {new Date(s.estimatedDelivery).toLocaleDateString()}
                      </span>
                    </div>

                    <a
                      href={`/track?tn=${s.trackingNumber}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg font-semibold shrink-0"
                    >
                      Track Live Map
                    </a>
                  </div>
                </div>
              ))}
              {filteredCustomerShipments.length === 0 && <p className="py-6 text-sm text-slate-400">No shipments match that tracking number.</p>}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREATE SHIPMENT WIZARD */}
      {activeTab === 'create' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <h2 className="text-xl font-extrabold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            Book Secure Armored Courier Manifest
          </h2>

          {createdSuccessTn ? (
            <div className="p-8 bg-emerald-950/90 border border-emerald-500/60 rounded-2xl text-center space-y-4">
              <Check className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-2xl font-extrabold text-white">Shipment Created & Manifest Sealed!</h3>
              <p className="text-sm text-emerald-200 font-mono">
                Assigned Tracking Number: <strong className="text-amber-400 text-lg">{createdSuccessTn}</strong>
              </p>
              <div className="flex justify-center gap-4 pt-2">
                <a
                  href={`/track?tn=${createdSuccessTn}`}
                  className="px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
                >
                  View on Live Telemetry Map
                </a>
                <button
                  onClick={() => setCreatedSuccessTn('')}
                  className="px-6 py-2.5 bg-slate-800 text-slate-200 rounded-xl text-xs"
                >
                  Book Another Shipment
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateShipment} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sender Address */}
                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-bold text-amber-400">Sender / Origin Vault</h3>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Company / Vault Name</label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Address</label>
                    <input
                      type="text"
                      required
                      value={senderAddress}
                      onChange={(e) => setSenderAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Direct Phone</label>
                    <input
                      type="text"
                      required
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                    />
                  </div>
                </div>

                {/* Recipient Address */}
                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-bold text-emerald-400">Recipient / Destination Vault</h3>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Recipient / Vault Name</label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Address</label>
                    <input
                      type="text"
                      required
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Direct Phone</label>
                    <input
                      type="text"
                      required
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Cargo Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Service Tier</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as ServiceType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="armored_transit">Armored Ground & Air Transit</option>
                    <option value="secure_doc">Secure Diplomatic Document Pouch</option>
                    <option value="high_value_cargo">High-Value Bullion Cargo</option>
                    <option value="express_intl">Express International Escort</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min="1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Declared Value (USD)</label>
                  <input
                    type="number"
                    step="50000"
                    value={declaredValue}
                    onChange={(e) => setDeclaredValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tracking Passcode Protection</label>
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                    placeholder="e.g. VIP2026"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
                  <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white">
                    <option value="credit">Corporate Account Credit (Monthly Invoice)</option>
                    <option value="card">Stripe / Card Payment</option>
                    <option value="bank">Wire Bank Transfer</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-sm transition"
              >
                Confirm & Issue Armored Manifest
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: BULK CSV UPLOAD */}
      {activeTab === 'bulk' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <h2 className="text-xl font-extrabold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            Bulk CSV Shipment Import
          </h2>

          <p className="text-xs text-slate-300">
            Paste CSV data containing sender, recipient, weight, and declared value to generate multiple check-digit tracking numbers at once.
          </p>

          {bulkStatus && (
            <div className="p-4 bg-emerald-950 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold">
              {bulkStatus}
            </div>
          )}

          <form onSubmit={handleBulkUpload} className="space-y-4 text-xs">
            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-white"
            />

            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs"
            >
              Parse & Batch Issue Shipments
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: HISTORY & EXPORT */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Complete Manifest History
            </h2>

            <button
              onClick={exportCSVHistory}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Export CSV History
            </button>
          </div>

          <div className="divide-y divide-slate-800 overflow-x-auto text-xs">
            {customerShipments.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between gap-4">
                <span className="font-mono text-amber-400 font-bold">{s.trackingNumber}</span>
                <span className="text-slate-300">{s.sender.city} → {s.recipient.city}</span>
                <span className="text-slate-400 uppercase font-mono">{s.currentStatus}</span>
                <span className="text-white font-mono">${s.pricing.totalAmount.toLocaleString()}</span>
                <a href={`/track?tn=${s.trackingNumber}`} className="text-amber-400 underline">Track</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: API KEYS & WEBHOOKS */}
      {activeTab === 'apikeys' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <h2 className="text-xl font-extrabold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            Developer API Keys & Webhooks
          </h2>

          <p className="text-xs text-slate-300">
            Integrate SCS tracking telemetry directly into your ERP or warehouse management software via REST and WebSocket endpoints.
          </p>

          <div className="space-y-4">
            {apiKeys.map((k, i) => (
              <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>{k.name}</span>
                  <span className="text-slate-500 font-mono text-[10px]">Created {k.created}</span>
                </div>
                <div className="font-mono text-emerald-400 bg-slate-900 p-2 rounded border border-slate-800">
                  {k.key}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
