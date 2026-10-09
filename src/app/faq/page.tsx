'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown, Search, ShieldCheck } from 'lucide-react';

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the tracking number Luhn-36 check digit work?',
      a: 'SCS tracking IDs follow format SCS-2026-XXXXXXXXXX. The final character is a Luhn-36 mathematical check digit calculated from the preceding 9-character Base36 sequence. This prevents single-character typos and transposition errors when entering tracking IDs.',
    },
    {
      q: 'What level of insurance cover is provided for high-value bullion and jewelry?',
      a: 'Every SCS shipment is underwritten by Lloyd’s of London up to $500,000,000 per single cargo manifest. Declared value insurance options start at 0.8% of cargo valuation.',
    },
    {
      q: 'How is the double-blind chain of custody verified during handovers?',
      a: 'At every physical handover, both releasing and receiving security couriers scan the container barcode, inspect the tamper-evident steel seal ID, capture biometric signatures, and record exact GPS coordinates.',
    },
    {
      q: 'Can I track a high-value shipment without exposing exact locations publicly?',
      a: 'Yes. Public tracking shows approximate regional markers and masked valuations unless the viewer enters the sender-provided security passcode (e.g. VIP2026). Authorized accounts see exact live GPS telemetry.',
    },
    {
      q: 'How are diplomatic pouches and sovereign documents handled?',
      a: 'Diplomatic cargo is conveyed in Kevlar sealed bags under Vienna Convention immunity protocols, ensuring zero un-authorized X-ray tampering and direct hand-to-hand escort by credentialed officers.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (item) => item.q.toLowerCase().includes(searchTerm.toLowerCase()) || item.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          HELP CENTER & FAQ
        </div>
        <h1 className="text-4xl font-extrabold text-white">Frequently Asked Questions</h1>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search security protocols, insurance coverage, tracking format..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
        />
      </div>

      <div className="space-y-4">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-left p-4 font-bold text-white text-sm flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
