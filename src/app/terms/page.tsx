import { FileCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-xs text-slate-300 leading-relaxed">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
          <FileCheck className="w-4 h-4" />
          TERMS OF CARRIAGE & UNDERWRITING CONDITIONS
        </div>
        <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">1. Declared Valuation & Insurance Underwriting</h2>
        <p>
          Cargo declared values are underwritten up to $500,000,000 USD per manifest under Lloyd's of London Policy #SCS-2026-LLOYDS. Claims must be filed within 48 hours of delivery timestamp.
        </p>

        <h2 className="text-base font-bold text-white">2. Tamper Seal Verification</h2>
        <p>
          The recipient or authorized vault officer must inspect and verify the tamper-evident steel seal number prior to signing the delivery handover log.
        </p>

        <h2 className="text-base font-bold text-white">3. Force Majeure & Sovereign Authority Interception</h2>
        <p>
          SCS Global is exempt from liability for delays caused by official sovereign customs orders, military air space closures, or armed conflict.
        </p>
      </div>
    </div>
  );
}
