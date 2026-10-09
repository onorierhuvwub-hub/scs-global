'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGlobalSettings } from '@/lib/store';
import { TRANSLATIONS, calculateQuote, formatCurrency } from '@/lib/tracking';
import { 
  ShieldCheck, 
  Search, 
  Lock, 
  Truck, 
  Plane, 
  FileText, 
  Award, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Calculator, 
  Building2, 
  Package, 
  ShieldAlert, 
  Zap,
  KeyRound
} from 'lucide-react';

export default function HomePage() {
  const router = RouterHook();
  const { language, currency } = useGlobalSettings();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [trackingInput, setTrackingInput] = useState('');

  // Quick Quote state on Homepage
  const [origin, setOrigin] = useState('Switzerland');
  const [dest, setDest] = useState('United States');
  const [weight, setWeight] = useState(10);
  const [value, setValue] = useState(250000);
  const [service, setService] = useState('armored_transit');

  const quoteResult = calculateQuote({
    originCountry: origin,
    destinationCountry: dest,
    weightKg: weight,
    declaredValue: value,
    serviceType: service,
    insuranceRequired: true,
    specialHandling: ['tamper_seal'],
  });

  function handleTrackSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingInput.trim()) return;
    const query = encodeURIComponent(trackingInput.trim());
    router.push(`/track?tn=${query}`);
  }

  function handleDemoClick(tn: string) {
    router.push(`/track?tn=${tn}`);
  }

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative min-h-[680px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-center pt-12 pb-20 px-4 overflow-hidden">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          {/* Security Notice Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider shadow-lg shadow-amber-950/40">
            <ShieldCheck className="w-4 h-4" />
            MILITARY-GRADE ARMORED LOGISTICS & DIPLOMATIC VAULTING
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Fortress-Grade Global <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Security Courier Services
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Time-critical armored transit, high-value bullion movement, diplomatic pouches, and confidential cargo protected under 256-bit encrypted chain of custody.
          </p>

          {/* Prominent Multi-Tracking Search Bar */}
          <div className="max-w-2xl mx-auto bg-slate-900/90 border-2 border-amber-500/60 p-3 rounded-2xl shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleTrackSubmit} className="space-y-3">
              <div className="relative">
                <Search className="w-5 h-5 text-amber-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder={t.track_placeholder}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 px-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{t.quick_demo}</span>
                  <button
                    type="button"
                    onClick={() => handleDemoClick('SCS-2026-0000000001')}
                    className="font-mono text-amber-400 underline hover:text-amber-300 font-bold"
                  >
                    SCS-2026-0000000001
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {t.track_btn}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 text-left">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="text-2xl font-extrabold text-white">140+</div>
              <div className="text-xs text-slate-400">{t.stat_countries}</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="text-2xl font-extrabold text-amber-400">28</div>
              <div className="text-xs text-slate-400">{t.stat_vaults}</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="text-2xl font-extrabold text-white">100%</div>
              <div className="text-xs text-slate-400">{t.stat_escort}</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="text-2xl font-extrabold text-emerald-400">$5B+</div>
              <div className="text-xs text-slate-400">{t.stat_insured}</div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK INSTANT QUOTE CALCULATOR & COVERAGE PREVIEW */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Quick Quote Calculator Box */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                  <Calculator className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-extrabold text-white">Instant Rate Estimator</h2>
              </div>
              <p className="text-xs text-slate-400">
                Get an immediate cost estimate for high-value armored transport, diplomatic bags, or bullion shipping.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Origin Country</label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="Switzerland">Switzerland (Zurich Vault)</option>
                  <option value="United Kingdom">United Kingdom (London Hub)</option>
                  <option value="United States">United States (NYC Hub)</option>
                  <option value="United Arab Emirates">UAE (Dubai Freezone)</option>
                  <option value="Singapore">Singapore (Changi Vault)</option>
                  <option value="Japan">Japan (Tokyo Hub)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Destination Country</label>
                <select
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="United States">United States (NYC Vault)</option>
                  <option value="United Kingdom">United Kingdom (London)</option>
                  <option value="Switzerland">Switzerland (Zurich)</option>
                  <option value="United Arab Emirates">UAE (Dubai Vault)</option>
                  <option value="Japan">Japan (Tokyo)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Package Weight (kg)</label>
                <input
                  type="number"
                  min="0.5"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Declared Value (USD)</label>
                <input
                  type="number"
                  step="10000"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            {/* Price Output Breakdown */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Base Transit & Fuel:</span>
                <span>{formatCurrency(quoteResult.baseRate + quoteResult.fuelSurcharge, currency)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Security & Lloyd's Cover:</span>
                <span>{formatCurrency(quoteResult.securitySurcharge + quoteResult.insurancePremium, currency)}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm font-bold text-white">
                <span>Estimated Total:</span>
                <span className="text-lg text-amber-400">{formatCurrency(quoteResult.totalAmount, currency)}</span>
              </div>
            </div>

            <Link
              href="/quote"
              className="w-full text-center py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition"
            >
              Book Shipment with Custom Add-ons
            </Link>
          </div>

          {/* Global Coverage Banner */}
          <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 to-navy-950 border border-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
                <Globe className="w-3.5 h-3.5" />
                INTER-HUB ARMORED CORRIDORS
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                Continuous Chain of Custody Across 28 High-Security Vaults
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Our global network features armed tactical couriers, biometric vaults, satellite-tracked armored vehicles, and non-stop diplomatic customs clearance at major international air hubs.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-4 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Zurich Bullion Hub</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>London Heathrow Vault</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Dubai Freezone Vault</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>NYC Financial District Hub</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/coverage"
                className="inline-flex items-center gap-2 text-amber-400 font-bold text-sm hover:text-amber-300 transition"
              >
                Explore Interactive Global Hub Map
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CORE SERVICES HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-white">Specialized Security Logistics</h2>
          <p className="text-sm text-slate-400">
            Tailored transport services designed for high-net-worth individuals, commercial banks, diplomatic missions, and luxury conglomerates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-amber-500/50 transition group space-y-4">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Armored Ground & Air Transit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Heavy-armored tactical vehicles equipped with dual armed security personnel, bulletproof glass, remote ignition kill-switches, and live GPS telemetry.
            </p>
            <Link href="/services#armored" className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold hover:underline">
              Learn More <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-amber-500/50 transition group space-y-4">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Secure Diplomatic & Doc Delivery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sealed tamper-evident Kevlar pouches for diplomatic communications, legal deeds, trade secrets, and sovereign documents under Vienna Convention compliance.
            </p>
            <Link href="/services#docs" className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold hover:underline">
              Learn More <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-amber-500/50 transition group space-y-4">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">High-Value Cargo & Jewelry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bespoke vault-to-vault transit for gold bullion, uncut diamonds, haute horlogerie, and museum-grade fine art with full declared-value insurance coverage.
            </p>
            <Link href="/services#cargo" className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold hover:underline">
              Learn More <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CLIENT TESTIMONIALS & TRUST SIGNALS */}
      <section className="bg-slate-900/60 border-y border-slate-800 py-16 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Trusted by Sovereign Institutions & Global Leaders</h2>
            <p className="text-xs text-slate-400">Over $5 Billion in high-value assets securely delivered with zero loss record.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
              <div className="text-amber-400 text-sm font-bold">★★★★★</div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "SCS Global executed an emergency transfer of physical gold reserves between Zurich and NYC in under 24 hours. The real-time telemetry map gave our board total peace of mind."
              </p>
              <div className="text-xs">
                <div className="font-bold text-white">Hans-Peter Zimmermann</div>
                <div className="text-slate-500">Chief Risk Officer, Swiss Asset Reserve AG</div>
              </div>
            </div>

            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
              <div className="text-amber-400 text-sm font-bold">★★★★★</div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "The double-blind chain of custody log and barcode handover verification at Heathrow made SCS Global our exclusive carrier for high jewelry shipments."
              </p>
              <div className="text-xs">
                <div className="font-bold text-white">Claire Dubois</div>
                <div className="text-slate-500">VP Supply Chain, Place Vendôme Fine Jewels</div>
              </div>
            </div>

            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
              <div className="text-amber-400 text-sm font-bold">★★★★★</div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "Diplomatic pouches were handled with strict adherence to sovereign protocols and zero-touch X-ray clearances. Truly exceptional professionalism."
              </p>
              <div className="text-xs">
                <div className="font-bold text-white">Attache M. Al-Maktoum</div>
                <div className="text-slate-500">Embassy Logistics Directorate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 p-10 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Open a Corporate Security Account</h2>
            <p className="text-xs md:text-sm text-slate-900 font-medium max-w-md">
              Gain access to monthly invoicing, dedicated armed dispatchers, API key integrations, and priority vaulting.
            </p>
          </div>

          <Link
            href="/portal"
            className="px-8 py-3.5 bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold rounded-xl text-sm transition shadow-2xl shrink-0"
          >
            Register Corporate Account
          </Link>
        </div>
      </section>
    </div>
  );
}

function RouterHook() {
  return useRouter();
}
