import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  UserCheck, 
  Radio, 
  Key, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';

export default function SecurityPage() {
  const securityLayers = [
    {
      title: '1. Tamper-Evident Steel Seals',
      icon: Lock,
      description: 'Every container, diplomatic pouch, and armored briefcase is assigned a unique laser-engraved 12-digit seal ID. Any break or attempt at tampering immediately triggers control room alerts.',
    },
    {
      title: '2. Double-Blind Chain of Custody',
      icon: Eye,
      description: 'At every handover (driver to vault, vault to air escort, air escort to recipient), both releasing and receiving handlers must scan the barcode and digitally sign the handover log.',
    },
    {
      title: '3. Satellite Telemetry & Geofencing',
      icon: Radio,
      description: 'Armored vehicles and cargo containers transmit GPS coordinates every 5–10 seconds. Automated geofences trigger instant alerts if a vehicle strays >500m off its approved route.',
    },
    {
      title: '4. Vetted Armed Security Personnel',
      icon: UserCheck,
      description: 'All couriers and escort personnel undergo rigorous military/law enforcement background checks, polygraph screening, and bi-annual tactical defense refresher courses.',
    },
    {
      title: '5. 256-Bit Encrypted Data & Masking',
      icon: Key,
      description: 'Public tracking views mask declared values and exact recipient street addresses. Sensitive manifests require two-factor passcode authentication.',
    },
    {
      title: '6. ISO 27001 & 28000 Compliance',
      icon: FileCheck,
      description: 'Our information security management systems and supply chain security practices are externally audited and certified annually by accredited regulatory bodies.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          MAXIMUM SECURITY ARCHITECTURE
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          Security & Compliance Protocols
        </h1>
        <p className="text-sm text-slate-300">
          Learn how SCS Global protects high-value bullion, diplomatic pouches, and confidential assets across every leg of transit.
        </p>
      </div>

      {/* Security Layers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {securityLayers.map((layer, idx) => {
          const Icon = layer.icon;
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl hover:border-amber-500/50 transition">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{layer.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{layer.description}</p>
            </div>
          );
        })}
      </div>

      {/* Incident Protocol Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-500/50 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">SOS & Route Deviation Protocol</h3>
            <p className="text-xs text-amber-200/90 max-w-xl">
              In the event of an unexpected stop, route deviation, or panic button trigger, our 24/7 Security Operations Room immediately coordinates local law enforcement, dispatches backup armed units, and freezes vault access.
            </p>
          </div>
        </div>

        <Link
          href="/contact"
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shrink-0 transition"
        >
          Contact Control Room
        </Link>
      </div>
    </div>
  );
}
