import Link from 'next/link';
import { ShieldCheck, Award, Building2, Users, FileCheck, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          SOVEREIGN COURIER SECURITY SINCE 1998
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          Securing the World's Most Valuable Cargo
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Founded in Zurich and expanded across London, Dubai, New York, and Singapore, Sovereign Courier Security (SCS Global) sets the standard for armored logistics, diplomatic pouches, and bullion vaulting.
        </p>
      </div>

      {/* Leadership & Standards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Institutional Heritage</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Originally established to serve Swiss commercial banks, SCS Global now serves sovereign governments, central banks, diamond houses, and diplomatic missions across 140+ countries.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Licenses & Accreditations</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fully licensed for armored carrier operations, armed security transport, IATA diplomatic cargo handling, and ISO 27001 / 28000 supply chain security compliance.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Veteran Security Officers</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Our couriers and dispatchers are recruited from military special operations and law enforcement backgrounds, rigorously trained in anti-tamper protocols and evasive driving.
          </p>
        </div>
      </div>
    </div>
  );
}
