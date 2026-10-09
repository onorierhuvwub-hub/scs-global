import Link from 'next/link';
import { 
  Truck, 
  FileText, 
  Package, 
  Plane, 
  Clock, 
  ShieldCheck, 
  Vault, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

export default function ServicesPage() {
  const servicesList = [
    {
      id: 'armored',
      icon: Truck,
      title: 'Armored Ground & Tactical Transit',
      description: 'Heavy bulletproof tactical vehicles equipped with dual armed security officers, satellite GPS telemetry, and remote ignition kill-switches.',
      features: ['Level B6/B7 Ballistic Protection', 'Dual Armed Escort Personnel', 'Continuous Satellite Tracking', 'Tamper-Evident Steel Seals'],
    },
    {
      id: 'docs',
      icon: FileText,
      title: 'Secure Diplomatic & Document Delivery',
      description: 'Hand-carried Kevlar pouches for sovereign communications, legal deeds, and confidential trade secrets under Vienna Convention immunity.',
      features: ['Zero X-Ray Inspection Sealed', 'Hand-to-Hand Officer Handover', 'Biometric Lock Briefcase', 'Proof of Delivery Signature & OTP'],
    },
    {
      id: 'cargo',
      icon: Package,
      title: 'High-Value Bullion & Fine Art Transit',
      description: 'Dedicated vault-to-vault movement for physical gold bars, uncut gem callsets, luxury timepieces, and museum-grade artworks.',
      features: ['Underwritten up to $500M per Flight', 'Climate & Nitrogen Controlled Cask', 'Double-Blind Chain of Custody', 'Armed Runway Tarmac Escort'],
    },
    {
      id: 'intl',
      icon: Plane,
      title: 'Express International Air Escort',
      description: 'Dedicated onboard security couriers accompanying high-value cargo from departure gate through customs to destination vault.',
      features: ['Onboard Armed Security Lead', 'Direct Flight Routing', 'Priority Customs Clearance', 'Airport VIP Lounge Handover'],
    },
    {
      id: 'same-day',
      icon: Clock,
      title: 'Same-Day Armed Local Transit',
      description: 'Rapid-response armored dispatch for metropolitan banking centers, high fashion boutiques, and urgent legal filings.',
      features: ['Within 2-Hour Dispatch Window', 'Metropolitan Route Optimization', 'Geofenced Security Radius', 'Real-time Mobile Beaconing'],
    },
    {
      id: 'customs',
      icon: ShieldCheck,
      title: 'Customs Clearance & Vault Storage',
      description: 'Bonded freezone vaulting at Zurich, Dubai, London, and Singapore air terminals with automated customs tariff calculation.',
      features: ['Bonded Freezone Vault Storage', 'Duty & Tax Pre-clearance', '24/7 Biometric Guard Service', 'Vault Inventory Portal Access'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          ENTERPRISE SECURITY LOGISTICS
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          Our Comprehensive Security Services
        </h1>
        <p className="text-sm text-slate-300">
          Explore our suite of armored transport, diplomatic pouches, vaulting, and high-value cargo logistics.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {servicesList.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              id={s.id}
              className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6 hover:border-amber-500/50 transition group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                  <Icon className="w-7 h-7" />
                </div>
                <span className="text-xs font-mono text-slate-500 uppercase">SERVICE CODE • {s.id.toUpperCase()}</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">{s.title}</h2>
                <p className="text-xs text-slate-300 leading-relaxed">{s.description}</p>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
                {s.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href={`/quote?service=${s.id}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                >
                  Get Instant Rate for {s.title}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-950 to-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-4">
        <h3 className="text-2xl font-extrabold text-white">Need Customized Diplomatic or Sovereign Logistics?</h3>
        <p className="text-xs text-slate-300 max-w-xl mx-auto">
          Our security officers design bespoke operations including armed convoy escorts, private charter transits, and diplomatic bag clearances.
        </p>
        <Link
          href="/contact"
          className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition"
        >
          Consult Security Operations Room
        </Link>
      </div>
    </div>
  );
}
