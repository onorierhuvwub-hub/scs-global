'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, MessageSquare, ShieldCheck, Check, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: 'General Inquiries',
    message: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', phone: '', company: '', subject: 'General Inquiries', message: '' });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          24/7 SECURITY CONTROL ROOM
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          Contact Control & Dispatch
        </h1>
        <p className="text-sm text-slate-300">
          Reach our round-the-clock Security Operations Desk, request emergency dispatch, or inquire about corporate accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Col */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            Global Control Room Terminals
          </h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-amber-400 mt-1 shrink-0" />
              <div>
                <span className="text-slate-400 block font-semibold">24/7 Toll-Free Hotline</span>
                <strong className="text-white text-sm font-mono">+1 (800) 555-SOVEREIGN</strong>
                <div className="text-slate-500 text-[11px]">+41 44 211 4000 (Zurich Vault Control)</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-amber-400 mt-1 shrink-0" />
              <div>
                <span className="text-slate-400 block font-semibold">Encrypted Email Desk</span>
                <strong className="text-white font-mono">ops@scs-global.sec</strong>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
              <div>
                <span className="text-slate-400 block font-semibold">WhatsApp Security Hotline</span>
                <strong className="text-emerald-400 font-mono">+971 50 998 4400</strong>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <MapPin className="w-4 h-4 text-amber-400 mt-1 shrink-0" />
              <div>
                <span className="text-slate-400 block font-semibold">Global Headquarters</span>
                <strong className="text-white">Bahnhofstrasse 45, 8001 Zurich, Switzerland</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Form Col */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
            Send Encrypted Message
          </h2>

          {submitted ? (
            <div className="p-6 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-center space-y-2">
              <Check className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Message Transmitted to Control Room</h3>
              <p className="text-xs text-emerald-200">
                A duty security officer will review and respond within 15 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Company / Institution</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                >
                  <option value="General Inquiries">General Inquiries</option>
                  <option value="Emergency Armored Dispatch">Emergency Armored Dispatch</option>
                  <option value="Corporate Account Setup">Corporate Account Setup</option>
                  <option value="Diplomatic Pouch Clearance">Diplomatic Pouch Clearance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                  placeholder="Describe your security cargo or dispatch requirements..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Transmit Secure Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
