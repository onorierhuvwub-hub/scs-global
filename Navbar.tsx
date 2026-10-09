'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGlobalSettings } from '@/lib/store';
import { TRANSLATIONS, CURRENCY_RATES } from '@/lib/tracking';
import { Language, Currency } from '@/lib/types';
import { 
  ShieldCheck, 
  Globe, 
  DollarSign, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  Package, 
  LayoutDashboard, 
  Smartphone
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { currency, changeCurrency, language, changeLanguage, darkMode, toggleDarkMode } = useGlobalSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const navLinks = [
    { href: '/', label: t.nav_home },
    { href: '/about', label: t.nav_about },
    { href: '/services', label: t.nav_services },
    { href: '/quote', label: t.nav_quote },
    { href: '/coverage', label: t.nav_coverage },
    { href: '/security', label: t.nav_security },
    { href: '/track', label: t.nav_tracking },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              SOVEREIGN COURIER SECURITY • 256-BIT ENCRYPTED CHAIN OF CUSTODY
            </span>
            <span className="hidden md:inline-block text-slate-500">|</span>
            <span className="hidden md:inline-block text-slate-400">
              Lloyd's of London Underwritten Cover ($500M Single Shipment)
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Currency Selector */}
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-amber-400" />
              <select
                value={currency}
                onChange={(e) => changeCurrency(e.target.value as Currency)}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-1.5 py-0.5 text-xs focus:ring-1 focus:ring-amber-400 cursor-pointer"
              >
                {Object.keys(CURRENCY_RATES).map((c) => (
                  <option key={c} value={c}>
                    {c} ({CURRENCY_RATES[c as Currency].symbol.trim()})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-amber-400" />
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value as Language)}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-1.5 py-0.5 text-xs focus:ring-1 focus:ring-amber-400 cursor-pointer"
              >
                <option value="en">English 🇬🇧</option>
                <option value="fr">Français 🇫🇷</option>
                <option value="ar">العربية 🇦🇪</option>
                <option value="es">Español 🇪🇸</option>
                <option value="zh">中文 🇨🇳</option>
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1 text-slate-300 hover:text-amber-400 transition"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-amber-600 to-navy-950 rounded-lg p-0.5 shadow-lg group-hover:scale-105 transition">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent block">
              SCS GLOBAL
            </span>
            <span className="text-[10px] tracking-widest text-amber-400 uppercase font-semibold block -mt-1">
              Sovereign Security Courier
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1 ${
                  isActive ? 'text-amber-400 font-semibold border-b-2 border-amber-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Portal & Dashboard Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/portal"
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Package className="w-3.5 h-3.5 text-amber-400" />
            Client Portal
          </Link>

          <Link
            href="/admin"
            className="px-3.5 py-1.5 rounded-lg border border-amber-500/50 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-amber-950/50"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
            Ops Dashboard
          </Link>

          <Link
            href="/courier"
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
          >
            <Smartphone className="w-3.5 h-3.5" />
            Courier App
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-200 hover:text-amber-400 py-1.5 border-b border-slate-800/60 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 bg-slate-800 rounded-lg text-xs font-semibold text-slate-200"
            >
              Client Portal
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 bg-amber-950 text-amber-300 border border-amber-600/50 rounded-lg text-xs font-semibold"
            >
              Ops Dashboard
            </Link>
            <Link
              href="/courier"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
            >
              Courier Mobile App
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
