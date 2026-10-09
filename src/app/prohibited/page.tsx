import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

export default function ProhibitedPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          REGULATORY COMPLIANCE & SAFETY
        </div>
        <h1 className="text-4xl font-extrabold text-white">Prohibited & Restricted Items</h1>
        <p className="text-sm text-slate-300">
          SCS Global strictly complies with ICAO, IATA, UN sanctions, and international law enforcement standards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-rose-900/50 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-rose-400 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Strictly Prohibited Cargo
          </h2>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>• Illegal narcotics and controlled substances</li>
            <li>• Unlicensed firearms, munitions, and explosives</li>
            <li>• Biological hazards, toxic chemical agents, and nuclear waste</li>
            <li>• Counterfeit currency and pirated goods</li>
            <li>• Items prohibited under UN Security Council sanctions</li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-amber-900/50 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Allowed Under Special License
          </h2>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>• Physical gold bullion & silver bars (with export assay)</li>
            <li>• Uncut rough diamonds (Kimberley Process certificate)</li>
            <li>• Sovereign diplomatic pouches (Vienna Convention)</li>
            <li>• Semiconductor wafers & confidential research prototypes</li>
            <li>• Fine art & antique artifacts (Interpol register verified)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
