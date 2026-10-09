import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Award, 
  FileCheck, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  ExternalLink 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Trust Badges Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-xl mb-12 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">256-BIT ENCRYPTED</div>
              <div className="text-[11px] text-slate-400">Chain of Custody Data</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">ISO 27001 & 28000</div>
              <div className="text-[11px] text-slate-400">Certified Supply Security</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">LLOYD'S INSURED</div>
              <div className="text-[11px] text-slate-400">Underwritten up to $500M</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">IATA & WCO REGULATED</div>
              <div className="text-[11px] text-slate-400">Diplomatic & Armed Clearance</div>
            </div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-slate-950 font-bold shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-wider">
                SOVEREIGN COURIER SECURITY
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Global premier security courier providing high-value bullion transport, diplomatic pouch movement, fine art transit, confidential document delivery, and vault storage under 256-bit encrypted chain of custody.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded font-mono">
                HEADQUARTERS: ZURICH • LONDON • DUBAI • NEW YORK
              </span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-4">Core Services</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/services#armored" className="hover:text-white transition">Armored Ground Transit</Link></li>
              <li><Link href="/services#docs" className="hover:text-white transition">Secure Diplomatic Bags</Link></li>
              <li><Link href="/services#cargo" className="hover:text-white transition">High-Value Bullion Cargo</Link></li>
              <li><Link href="/services#intl" className="hover:text-white transition">Express International Escort</Link></li>
              <li><Link href="/services#same-day" className="hover:text-white transition">Same-Day Armed Local</Link></li>
              <li><Link href="/services#customs" className="hover:text-white transition">Customs & Vaulting</Link></li>
            </ul>
          </div>

          {/* Col 3: Quick Links & Company */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-4">Company & Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-white transition">About SCS Global</Link></li>
              <li><Link href="/security" className="hover:text-white transition">Security Standards</Link></li>
              <li><Link href="/coverage" className="hover:text-white transition">Global Hub Map</Link></li>
              <li><Link href="/prohibited" className="hover:text-white transition">Prohibited Items</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy (GDPR)</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Terms of Carriage</Link></li>
              <li><Link href="/faq" className="hover:text-white transition">FAQ & Help Center</Link></li>
            </ul>
          </div>

          {/* Col 4: 24/7 Security Operations Room */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-4">24/7 Security Room</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-mono text-white">+1 (800) 555-SOVEREIGN</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>ops@scs-global.sec</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-400 font-semibold">WhatsApp Secure Chat Line</span>
              </div>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-xs transition"
                >
                  Contact Control Room
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Sovereign Courier Security (SCS Global) Inc. All Rights Reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:underline">GDPR & NDPR Compliance</Link>
            <Link href="/security" className="hover:underline">Chain-of-Custody Audit Log</Link>
            <Link href="/terms" className="hover:underline">Insurance Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
