import { Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-xs text-slate-300 leading-relaxed">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
          <Lock className="w-4 h-4" />
          GDPR & NDPR DATA PRIVACY POLICY
        </div>
        <h1 className="text-3xl font-extrabold text-white">Privacy Policy & Encryption Standards</h1>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">1. Data Encryption & Storage</h2>
        <p>
          All sensitive customer data, including declared cargo valuations, recipient contact numbers, and tamper seal logs, are stored using AES-256 bit encryption at rest and TLS 1.3 in transit.
        </p>

        <h2 className="text-base font-bold text-white">2. Masked Public Telemetry</h2>
        <p>
          Public tracking views mask street addresses and exact monetary valuations unless authenticated with a valid security passcode or signed into an authorized account.
        </p>

        <h2 className="text-base font-bold text-white">3. Data Retention & Chain of Custody Audit</h2>
        <p>
          Chain-of-custody logs are retained for 7 years to meet international financial compliance and Lloyd's underwriting audit requirements.
        </p>
      </div>
    </div>
  );
}
