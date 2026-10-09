'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGlobalSettings } from '@/lib/store';
import { calculateQuote, formatCurrency } from '@/lib/tracking';
import { ServiceType } from '@/lib/types';
import jsPDF from 'jspdf';
import { 
  Calculator, 
  ShieldCheck, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  Download, 
  ArrowRight,
  Package
} from 'lucide-react';

export default function QuotePage() {
  const router = useRouter();
  const { currency } = useGlobalSettings();

  const [originCountry, setOriginCountry] = useState('Switzerland');
  const [destinationCountry, setDestinationCountry] = useState('United States');
  const [weightKg, setWeightKg] = useState(15.0);
  const [declaredValue, setDeclaredValue] = useState(500000);
  const [serviceType, setServiceType] = useState<ServiceType>('armored_transit');
  const [insuranceRequired, setInsuranceRequired] = useState(true);
  const [specialHandling, setSpecialHandling] = useState<string[]>([
    'tamper_seal',
    'dual_armed_escort',
  ]);

  const quote = calculateQuote({
    originCountry,
    destinationCountry,
    weightKg,
    declaredValue,
    serviceType,
    insuranceRequired,
    specialHandling,
  });

  function toggleSpecial(flag: string) {
    if (specialHandling.includes(flag)) {
      setSpecialHandling(specialHandling.filter((f) => f !== flag));
    } else {
      setSpecialHandling([...specialHandling, flag]);
    }
  }

  function downloadPDFQuote() {
    const doc = new jsPDF();
    doc.setFillColor(11, 19, 43);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(212, 175, 55);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SOVEREIGN COURIER SECURITY', 15, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('OFFICIAL RATE ESTIMATE & AUDIT ESTIMATE', 15, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Origin: ${originCountry} → Destination: ${destinationCountry}`, 15, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`Service Level: ${serviceType.toUpperCase()}`, 15, 63);
    doc.text(`Weight: ${weightKg} kg | Declared Value: USD $${declaredValue.toLocaleString()}`, 15, 71);

    doc.line(15, 80, 195, 80);

    doc.setFontSize(10);
    doc.text(`Base Freight Charge: USD $${quote.baseRate.toLocaleString()}`, 15, 95);
    doc.text(`Fuel Surcharge (12%): USD $${quote.fuelSurcharge.toLocaleString()}`, 15, 103);
    doc.text(`Security & Escort Fee: USD $${quote.securitySurcharge.toLocaleString()}`, 15, 111);
    doc.text(`Lloyd's Underwritten Insurance Premium: USD $${quote.insurancePremium.toLocaleString()}`, 15, 119);
    doc.text(`Special Handling Fees: USD $${quote.specialFee.toLocaleString()}`, 15, 127);
    doc.text(`VAT / Statutory Taxes (5%): USD $${quote.tax.toLocaleString()}`, 15, 135);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`TOTAL ESTIMATED AMOUNT: USD $${quote.totalAmount.toLocaleString()}`, 15, 150);

    doc.save(`SCS-QUOTE-ESTIMATE-${Date.now()}.pdf`);
  }

  function handleProceedToBooking() {
    router.push(`/portal?action=create&origin=${encodeURIComponent(originCountry)}&dest=${encodeURIComponent(destinationCountry)}&weight=${weightKg}&val=${declaredValue}&service=${serviceType}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Calculator className="w-4 h-4" />
          INSTANT DYNAMIC PRICING ENGINE
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white">
          Calculate Custom Shipping Quote
        </h1>
        <p className="text-sm text-slate-300">
          Transparent pricing for armored ground transit, high-value bullion, diplomatic pouches, and international air courier escorts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Col */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <Package className="w-5 h-5 text-amber-400" />
            1. Shipment Specification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Origin Country</label>
              <select
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
              >
                <option value="Switzerland">Switzerland (Zurich Vault)</option>
                <option value="United Kingdom">United Kingdom (London Hub)</option>
                <option value="United States">United States (NYC Hub)</option>
                <option value="United Arab Emirates">UAE (Dubai Freezone)</option>
                <option value="Singapore">Singapore (Changi Vault)</option>
                <option value="France">France (Paris Vault)</option>
                <option value="Japan">Japan (Tokyo Hub)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Destination Country</label>
              <select
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
              >
                <option value="United States">United States (NYC Vault)</option>
                <option value="United Kingdom">United Kingdom (London)</option>
                <option value="Switzerland">Switzerland (Zurich)</option>
                <option value="United Arab Emirates">UAE (Dubai Vault)</option>
                <option value="Singapore">Singapore (Changi Vault)</option>
                <option value="Japan">Japan (Tokyo)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Service Tier</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as ServiceType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
              >
                <option value="armored_transit">Armored Ground & Air Transit</option>
                <option value="secure_doc">Secure Diplomatic Document Pouch</option>
                <option value="high_value_cargo">High-Value Bullion Cargo</option>
                <option value="express_intl">Express International Escort</option>
                <option value="same_day_local">Same-Day Armed Local Transit</option>
                <option value="vault_storage">Vaulting & Storage</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Gross Weight (kg)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-xs text-slate-300 font-semibold">Declared Cargo Valuation (USD)</label>
            <input
              type="number"
              step="50000"
              value={declaredValue}
              onChange={(e) => setDeclaredValue(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Cargo value is automatically underwritten by Lloyd's of London up to $500,000,000.
            </p>
          </div>

          <h2 className="text-xl font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-4 pt-4">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            2. Special Handling & Security Protocol
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={specialHandling.includes('dual_armed_escort')}
                onChange={() => toggleSpecial('dual_armed_escort')}
                className="rounded text-amber-500 focus:ring-amber-400"
              />
              <div>
                <strong className="text-white block">Dual Armed Tactical Escort</strong>
                <span className="text-slate-500 text-[11px]">+$600 flat fee</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={specialHandling.includes('tamper_seal')}
                onChange={() => toggleSpecial('tamper_seal')}
                className="rounded text-amber-500 focus:ring-amber-400"
              />
              <div>
                <strong className="text-white block">Tamper-Evident Steel Seal</strong>
                <span className="text-slate-500 text-[11px]">+$50 per box</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={specialHandling.includes('temperature_control')}
                onChange={() => toggleSpecial('temperature_control')}
                className="rounded text-amber-500 focus:ring-amber-400"
              />
              <div>
                <strong className="text-white block">Climate & Nitrogen Purge</strong>
                <span className="text-slate-500 text-[11px]">+$250 per cask</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={insuranceRequired}
                onChange={(e) => setInsuranceRequired(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-400"
              />
              <div>
                <strong className="text-white block">Lloyd's Insured Value Cover</strong>
                <span className="text-slate-500 text-[11px]">0.8% of declared value</span>
              </div>
            </label>
          </div>
        </div>

        {/* Right Output Col */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-navy-950 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 sticky top-24">
          <h2 className="text-xl font-extrabold text-white flex items-center justify-between border-b border-slate-800 pb-4">
            <span>Rate Breakdown</span>
            <span className="text-xs text-amber-400 font-mono">ESTIMATE #{Date.now().toString().slice(-6)}</span>
          </h2>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Base Freight Transit:</span>
              <strong className="text-white font-mono">{formatCurrency(quote.baseRate, currency)}</strong>
            </div>

            <div className="flex justify-between">
              <span>Fuel Surcharge (12%):</span>
              <strong className="text-white font-mono">{formatCurrency(quote.fuelSurcharge, currency)}</strong>
            </div>

            <div className="flex justify-between">
              <span>Armored & Security Surcharge:</span>
              <strong className="text-white font-mono">{formatCurrency(quote.securitySurcharge, currency)}</strong>
            </div>

            <div className="flex justify-between">
              <span>Lloyd's Insurance Premium:</span>
              <strong className="text-emerald-400 font-mono">{formatCurrency(quote.insurancePremium, currency)}</strong>
            </div>

            <div className="flex justify-between">
              <span>Special Security Add-ons:</span>
              <strong className="text-white font-mono">{formatCurrency(quote.specialFee, currency)}</strong>
            </div>

            <div className="flex justify-between">
              <span>Statutory VAT / Tax (5%):</span>
              <strong className="text-white font-mono">{formatCurrency(quote.tax, currency)}</strong>
            </div>

            <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block uppercase font-bold">Total Quote Amount</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {formatCurrency(quote.totalAmount, currency)}
                </span>
              </div>

              <button
                onClick={downloadPDFQuote}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-slate-700"
                title="Download PDF Estimate"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button
              onClick={handleProceedToBooking}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl text-sm shadow-xl flex items-center justify-center gap-2 transition"
            >
              Proceed to Book Shipment
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              Quotes are valid for 14 calendar days from calculation. Final rates subject to official weight audit at pickup dock.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
