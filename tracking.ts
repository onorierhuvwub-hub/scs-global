import { Shipment, Currency, Language } from './types';

// Base36 Character Set for Luhn-36 check digit algorithm
const BASE36_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Calculates a Luhn-36 Check Digit for a string of Base36 characters.
 */
export function calculateLuhn36CheckDigit(input: string): string {
  const cleanStr = input.toUpperCase().replace(/[^0-9A-Z]/g, '');
  let sum = 0;
  const n = BASE36_CHARS.length; // 36

  for (let i = cleanStr.length - 1; i >= 0; i--) {
    const char = cleanStr[i];
    let val = BASE36_CHARS.indexOf(char);
    if (val === -1) val = 0;

    // Double every second digit from the right
    if ((cleanStr.length - 1 - i) % 2 === 0) {
      val *= 2;
      if (val >= n) {
        val = Math.floor(val / n) + (val % n);
      }
    }
    sum += val;
  }

  const remainder = sum % n;
  const checkVal = (n - remainder) % n;
  return BASE36_CHARS[checkVal];
}

/**
 * Generates a valid SCS tracking ID with Luhn-36 check digit:
 * Format: SCS-2026-XXXXXXXXXX (9 base36 chars + 1 check digit char)
 */
export function generateTrackingNumber(customSeed?: string): string {
  const year = new Date().getFullYear();
  let baseSequence = '';
  if (customSeed && customSeed.length === 9) {
    baseSequence = customSeed.toUpperCase();
  } else {
    for (let i = 0; i < 9; i++) {
      baseSequence += BASE36_CHARS[Math.floor(Math.random() * 36)];
    }
  }
  const checkDigit = calculateLuhn36CheckDigit(baseSequence);
  return `SCS-${year}-${baseSequence}${checkDigit}`;
}

/**
 * Validates an SCS Tracking Number check digit.
 */
export function validateTrackingNumber(trackingNum: string): boolean {
  const parts = trackingNum.trim().toUpperCase().split('-');
  if (parts.length !== 3 || parts[0] !== 'SCS') return false;
  const body = parts[2];
  if (!body || body.length !== 10) return false;

  const payload = body.slice(0, 9);
  const expectedCheckDigit = body.slice(9, 10);
  const actualCheckDigit = calculateLuhn36CheckDigit(payload);

  return expectedCheckDigit === actualCheckDigit;
}

// Currency Conversion Rates against USD base
export const CURRENCY_RATES: Record<Currency, { symbol: string; rate: number; name: string }> = {
  USD: { symbol: '$', rate: 1.0, name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.78, name: 'British Pound' },
  AED: { symbol: 'AED ', rate: 3.67, name: 'UAE Dirham' },
  JPY: { symbol: '¥', rate: 154.5, name: 'Japanese Yen' },
  CAD: { symbol: 'CA$', rate: 1.36, name: 'Canadian Dollar' },
  CHF: { symbol: 'CHF ', rate: 0.88, name: 'Swiss Franc' },
};

export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const converted = amount * info.rate;
  if (currency === 'JPY') {
    return `${info.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${info.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Simple Pricing Estimator logic
export interface QuoteInput {
  originCountry: string;
  destinationCountry: string;
  weightKg: number;
  declaredValue: number;
  serviceType: string;
  insuranceRequired: boolean;
  specialHandling: string[];
}

export function calculateQuote(input: QuoteInput) {
  const isDomestic = input.originCountry === input.destinationCountry;
  let baseRate = isDomestic ? 150 : 450;
  
  // Weight calculation ($15/kg domestic, $35/kg intl)
  const weightFee = input.weightKg * (isDomestic ? 15 : 35);
  
  // Service tier multiplier
  let serviceMultiplier = 1.0;
  if (input.serviceType === 'armored_transit') serviceMultiplier = 2.5;
  if (input.serviceType === 'high_value_cargo') serviceMultiplier = 2.0;
  if (input.serviceType === 'same_day_local') serviceMultiplier = 1.8;
  if (input.serviceType === 'vault_storage') serviceMultiplier = 1.5;
  
  baseRate = (baseRate + weightFee) * serviceMultiplier;
  
  // Insurance premium (0.8% of declared value above $5,000)
  let insurancePremium = 0;
  if (input.insuranceRequired && input.declaredValue > 0) {
    insurancePremium = Math.max(50, input.declaredValue * 0.008);
  }
  
  // Fuel & Security surcharges
  const fuelSurcharge = baseRate * 0.12;
  const securitySurcharge = baseRate * 0.18;
  
  // Special handling additions
  let specialFee = 0;
  if (input.specialHandling.includes('dual_armed_escort')) specialFee += 600;
  if (input.specialHandling.includes('tamper_seal')) specialFee += 50;
  if (input.specialHandling.includes('temperature_control')) specialFee += 250;
  
  const subtotal = baseRate + fuelSurcharge + securitySurcharge + insurancePremium + specialFee;
  const tax = subtotal * 0.05; // 5% VAT/Tax
  const total = subtotal + tax;
  
  return {
    baseRate: Math.round(baseRate),
    fuelSurcharge: Math.round(fuelSurcharge),
    securitySurcharge: Math.round(securitySurcharge),
    insurancePremium: Math.round(insurancePremium),
    specialFee: Math.round(specialFee),
    tax: Math.round(tax),
    totalAmount: Math.round(total),
    currency: 'USD' as Currency,
  };
}

// Translations / i18n Dictionary
export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    nav_home: 'Home',
    nav_about: 'About Us',
    nav_services: 'Services',
    nav_quote: 'Get a Quote',
    nav_coverage: 'Global Coverage',
    nav_security: 'Security & Compliance',
    nav_tracking: 'Track Shipment',
    nav_portal: 'Client Portal',
    nav_admin: 'Ops Dashboard',
    nav_courier: 'Courier App',
    hero_title: 'Fortress-Grade Global Security Courier',
    hero_subtitle: 'Armored transit, high-value bullion, diplomatic pouches, and time-critical confidential cargo protected by 256-bit encrypted chain-of-custody.',
    track_placeholder: 'Enter SCS Tracking Numbers (e.g. SCS-2026-0000000001, separated by comma)',
    track_btn: 'Track Securely',
    quick_demo: 'Try Demo Tracking ID:',
    stat_countries: '140+ Countries',
    stat_vaults: '28 Armed Vaults',
    stat_escort: '100% Armed Escort',
    stat_insured: '$5B+ Underwritten',
  },
  fr: {
    nav_home: 'Accueil',
    nav_about: 'À Propos',
    nav_services: 'Nos Services',
    nav_quote: 'Devis Instantané',
    nav_coverage: 'Couverture Mondiale',
    nav_security: 'Sécurité & Conformité',
    nav_tracking: 'Suivre un Colis',
    nav_portal: 'Portail Client',
    nav_admin: 'Tableau de Bord Operations',
    nav_courier: 'App Agent',
    hero_title: 'Transporteur Sécurisé de Classe Internationale',
    hero_subtitle: 'Transit blindé, lingots de valeur, plis diplomatiques et cargaisons confidentielles sous chaîne de traçabilité chiffrée 256-bit.',
    track_placeholder: 'Entrez les numéros de suivi SCS (ex: SCS-2026-0000000001)',
    track_btn: 'Suivre en Sécurité',
    quick_demo: 'Démo Suivi Rapide:',
    stat_countries: '140+ Pays',
    stat_vaults: '28 Coffres Blindés',
    stat_escort: '100% Escorte Armée',
    stat_insured: '$5Mrd+ Assurés',
  },
  ar: {
    nav_home: 'الرئيسية',
    nav_about: 'من نحن',
    nav_services: 'خدماتنا',
    nav_quote: 'حاسبة التكلفة',
    nav_coverage: 'التغطية العالمية',
    nav_security: 'الأمان والامتثال',
    nav_tracking: 'تتبع الشحنة',
    nav_portal: 'بوابة العملاء',
    nav_admin: 'لوحة العمليات',
    nav_courier: 'تطبيق المندوب',
    hero_title: 'شركة الشحن الأمني الدولي فائقة الحماية',
    hero_subtitle: 'نقل مصفح، شحنات عالية القيمة، وثائق دبلوماسية، ومستندات سرية مع تتبع مباشر وتشفير 256 بت.',
    track_placeholder: 'أدخل أرقام تتبع SCS (مثال: SCS-2026-0000000001)',
    track_btn: 'تتبع الآن',
    quick_demo: 'تجربة التتبع:',
    stat_countries: '140+ دولة',
    stat_vaults: '28 خزينة مصفحة',
    stat_escort: 'حراسة مسلحة 100%',
    stat_insured: 'تأمين بقيمة 5$+ مليار',
  },
  es: {
    nav_home: 'Inicio',
    nav_about: 'Nosotros',
    nav_services: 'Servicios',
    nav_quote: 'Cotizar',
    nav_coverage: 'Cobertura Global',
    nav_security: 'Seguridad y Cumplimiento',
    nav_tracking: 'Rastrear Envío',
    nav_portal: 'Portal Clientes',
    nav_admin: 'Panel Operaciones',
    nav_courier: 'App Mensajero',
    hero_title: 'Mensajería de Alta Seguridad Internacional',
    hero_subtitle: 'Transporte blindado, metales preciosos, correo diplomático y carga confidencial con cadena de custodia protegida por cifrado de 256 bits.',
    track_placeholder: 'Ingrese números de rastreo SCS (ej. SCS-2026-0000000001)',
    track_btn: 'Rastrear',
    quick_demo: 'Ver Demostración:',
    stat_countries: '140+ Países',
    stat_vaults: '28 Bóvedas Armadas',
    stat_escort: '100% Escolta Armada',
    stat_insured: '$5B+ Asegurados',
  },
  zh: {
    nav_home: '首页',
    nav_about: '关于我们',
    nav_services: '服务项目',
    nav_quote: '获取报价',
    nav_coverage: '全球网络',
    nav_security: '安全与合规',
    nav_tracking: '货物追踪',
    nav_portal: '客户门户',
    nav_admin: '运营控制台',
    nav_courier: '押运员端 App',
    hero_title: '全球军工级高安防安保快递与装甲运输',
    hero_subtitle: '武装押运、高价值贵重物品、外交邮袋及机密文件，由 256 位加密监管链全流程实时护航。',
    track_placeholder: '输入 SCS 追踪单号 (例如: SCS-2026-0000000001)',
    track_btn: '安全查询',
    quick_demo: '演示单号:',
    stat_countries: '140+ 国家与地区',
    stat_vaults: '28 座金库',
    stat_escort: '100% 武装押运',
    stat_insured: '承保额超 50 亿美元',
  },
};

// Seed dataset of initial sample shipments
export const SEED_SHIPMENTS: Shipment[] = [
  {
    id: 'shipment-001',
    trackingNumber: 'SCS-2026-0000000001',
    customerName: 'Aegis Asset Management AG',
    customerEmail: 'logistics@aegis-assets.ch',
    accountType: 'corporate',
    serviceType: 'armored_transit',
    securityLevel: 'maximum_armored',
    
    sender: {
      name: 'Zurich Vault Operations',
      phone: '+41 44 211 4000',
      email: 'vault-ch@scs-global.sec',
      company: 'Zurich Central Bullion Reserve',
      address: 'Bahnhofstrasse 45',
      city: 'Zurich',
      country: 'Switzerland',
      lat: 47.3769,
      lng: 8.5417,
    },
    
    recipient: {
      name: 'Federal Reserve Security Vault',
      phone: '+1 212 720 5000',
      email: 'vault-nyc@scs-global.sec',
      company: 'Federal Reserve Bank of NY',
      address: '33 Liberty Street',
      city: 'New York',
      country: 'United States',
      lat: 40.7081,
      lng: -74.0086,
    },
    
    originHub: 'Zurich Vault Hub (ZRH-V1)',
    destinationHub: 'New York Financial District Vault (NYC-F1)',
    
    packageDetails: {
      description: 'Physical Gold Bullion Bars (400 oz Good Delivery x 5)',
      packageType: 'Tamper-Evident Steel Case',
      pieces: 2,
      weightKg: 65.5,
      dimensionsCm: '50x40x30',
      declaredValue: 2450000,
      currency: 'USD',
    },
    
    specialHandling: ['Tamper-Evident Seal', 'Dual Armed Escort', 'Satellite GPS Beacon', 'Lloyds Insurance Cover'],
    tamperSealNumber: 'SEAL-ZRH-994821',
    
    currentStatus: 'IN_TRANSIT',
    transportMode: 'air',
    
    origin: {
      lat: 47.3769,
      lng: 8.5417,
      address: 'Bahnhofstrasse 45',
      city: 'Zurich',
      country: 'Switzerland',
      hubName: 'Zurich Vault (ZRH-V1)',
    },
    
    destination: {
      lat: 40.7081,
      lng: -74.0086,
      address: '33 Liberty Street',
      city: 'New York',
      country: 'United States',
      hubName: 'NYC Vault (NYC-F1)',
    },
    
    currentLocation: {
      lat: 51.4700,
      lng: -0.4543,
      address: 'London Heathrow Secure Cargo Terminal',
      city: 'London',
      country: 'United Kingdom',
      hubName: 'London Heathrow Armed Hub (LHR-H2)',
      timestamp: '2026-10-05T13:40:00Z',
    },
    
    routePolyline: [
      [47.3769, 8.5417],   // Zurich Vault
      [47.4582, 8.5555],   // Zurich Airport ZRH
      [51.4700, -0.4543],  // London Heathrow Airport LHR (Current location)
      [40.6413, -73.7781], // JFK Airport NY
      [40.7081, -74.0086]  // NYC Vault
    ],
    
    telemetryHistory: [
      {
        timestamp: '2026-10-05T06:00:00Z',
        lat: 47.3769,
        lng: 8.5417,
        speedKmh: 0,
        headingDeg: 0,
        transportMode: 'road',
        vehicleCode: 'ARMORED-VAN-CH01',
        temperatureCelsius: 18.5,
      },
      {
        timestamp: '2026-10-05T08:30:00Z',
        lat: 47.4582,
        lng: 8.5555,
        speedKmh: 45,
        headingDeg: 340,
        transportMode: 'road',
        vehicleCode: 'ARMORED-VAN-CH01',
      },
      {
        timestamp: '2026-10-05T11:15:00Z',
        lat: 49.5000,
        lng: 4.2000,
        speedKmh: 820,
        headingDeg: 295,
        altitudeMeters: 10600,
        transportMode: 'air',
        vehicleCode: 'SECURITY-AIR-SCS707',
      },
      {
        timestamp: '2026-10-05T13:40:00Z',
        lat: 51.4700,
        lng: -0.4543,
        speedKmh: 20,
        headingDeg: 270,
        transportMode: 'road',
        vehicleCode: 'ARMORED-TRUCK-UK04',
      }
    ],
    
    statusLogs: [
      {
        id: 'log-1',
        status: 'ORDER_CREATED',
        location: 'Zurich Vault (ZRH-V1)',
        lat: 47.3769,
        lng: 8.5417,
        timestamp: '2026-10-05T04:15:00Z',
        handlerName: 'Chief Vault Officer Hans Weber',
        notes: 'High-security manifest created & steel container sealed.',
      },
      {
        id: 'log-2',
        status: 'PICKED_UP',
        location: 'Zurich Vault (ZRH-V1)',
        lat: 47.3769,
        lng: 8.5417,
        timestamp: '2026-10-05T06:00:00Z',
        handlerName: 'Commander Markus Keller (Armed Escort)',
        notes: 'Double-blind custody handover verified with seal SEAL-ZRH-994821.',
      },
      {
        id: 'log-3',
        status: 'SECURITY_SCREENING',
        location: 'Zurich Airport Security Hub (ZRH-H1)',
        lat: 47.4582,
        lng: 8.5555,
        timestamp: '2026-10-05T08:30:00Z',
        handlerName: 'Swiss Customs Security Agent L. Meyer',
        notes: 'X-ray density scan & radiation check cleared.',
      },
      {
        id: 'log-4',
        status: 'IN_TRANSIT',
        location: 'London Heathrow Armed Transit Hub (LHR-H2)',
        lat: 51.4700,
        lng: -0.4543,
        timestamp: '2026-10-05T13:40:00Z',
        handlerName: 'Officer James Sterling (UK Escort Lead)',
        notes: 'Refueling handover complete. Transshipment to Flight SCS-707 underway.',
        transportMode: 'air',
      },
    ],
    
    handovers: [
      {
        id: 'ho-1',
        releasingHandler: 'Hans Weber (Zurich Vault)',
        receivingHandler: 'Markus Keller (Armored Courier)',
        sealVerified: 'SEAL-ZRH-994821',
        sealStatus: 'intact',
        location: 'Zurich Vault Loading Dock',
        lat: 47.3769,
        lng: 8.5417,
        timestamp: '2026-10-05T06:00:00Z',
      },
      {
        id: 'ho-2',
        releasingHandler: 'Markus Keller (Armored Courier)',
        receivingHandler: 'James Sterling (UK Escort Lead)',
        sealVerified: 'SEAL-ZRH-994821',
        sealStatus: 'intact',
        location: 'London Heathrow Vault Terminal',
        lat: 51.4700,
        lng: -0.4543,
        timestamp: '2026-10-05T13:35:00Z',
      }
    ],
    
    incidents: [
      {
        id: 'inc-101',
        shipmentId: 'shipment-001',
        trackingNumber: 'SCS-2026-0000000001',
        severity: 'low',
        type: 'delay',
        description: 'Flight departure delayed 18 mins due to Heathrow VIP tarmac clearance.',
        locationName: 'London Heathrow Airport',
        lat: 51.4700,
        lng: -0.4543,
        status: 'resolved',
        reportedBy: 'Dispatcher S. Vance',
        createdAt: '2026-10-05T12:10:00Z',
      }
    ],
    
    pricing: {
      baseRate: 4500,
      fuelSurcharge: 540,
      securitySurcharge: 1200,
      insurancePremium: 19600, // 0.8% of $2.45M
      tax: 1292,
      totalAmount: 27132,
      currency: 'USD',
      isPaid: true,
    },
    
    passwordProtected: true,
    passcode: 'VIP2026',
    estimatedDelivery: '2026-10-06T18:00:00Z',
    createdAt: '2026-10-05T04:00:00Z',
    updatedAt: '2026-10-05T13:40:00Z',
  },
  
  {
    id: 'shipment-002',
    trackingNumber: 'SCS-2026-89A7B2C1X4',
    customerName: 'Cartier High Jewelry Division',
    customerEmail: 'logistics@cartier-secure.fr',
    accountType: 'corporate',
    serviceType: 'high_value_cargo',
    securityLevel: 'high_security',
    
    sender: {
      name: 'Cartier Flagship Store Paris',
      phone: '+33 1 42 68 55 00',
      email: 'paris-store@cartier.fr',
      company: 'Cartier Paris',
      address: '13 Rue de la Paix',
      city: 'Paris',
      country: 'France',
      lat: 48.8698,
      lng: 2.3308,
    },
    
    recipient: {
      name: 'Dubai Mall Luxury Vault',
      phone: '+971 4 362 7500',
      email: 'dubai-vip@cartier.ae',
      company: 'Cartier Middle East',
      address: 'Financial Center Road',
      city: 'Dubai',
      country: 'United Arab Emirates',
      lat: 25.1972,
      lng: 55.2797,
    },
    
    originHub: 'Paris CDG Vault Hub',
    destinationHub: 'Dubai International Airport Freezone Vault',
    
    packageDetails: {
      description: 'Diamond Necklace & Royal Emerald Timepiece Set',
      packageType: 'Armored Titanium Briefcase',
      pieces: 1,
      weightKg: 8.2,
      dimensionsCm: '35x25x15',
      declaredValue: 890000,
      currency: 'USD',
    },
    
    specialHandling: ['Tamper-Evident Seal', 'Biometric Lock', 'OTP Verification Required'],
    tamperSealNumber: 'SEAL-PAR-551290',
    
    currentStatus: 'DELIVERED',
    transportMode: 'road',
    
    origin: {
      lat: 48.8698,
      lng: 2.3308,
      address: '13 Rue de la Paix',
      city: 'Paris',
      country: 'France',
    },
    
    destination: {
      lat: 25.1972,
      lng: 55.2797,
      address: 'Financial Center Road',
      city: 'Dubai',
      country: 'United Arab Emirates',
    },
    
    currentLocation: {
      lat: 25.1972,
      lng: 55.2797,
      address: 'Dubai Mall Luxury Vault',
      city: 'Dubai',
      country: 'United Arab Emirates',
      timestamp: '2026-10-04T15:20:00Z',
    },
    
    routePolyline: [
      [48.8698, 2.3308],
      [49.0097, 2.5479],
      [25.2532, 55.3657],
      [25.1972, 55.2797]
    ],
    
    telemetryHistory: [],
    
    statusLogs: [
      {
        id: 'log-201',
        status: 'DELIVERED',
        location: 'Dubai Mall Luxury Vault',
        lat: 25.1972,
        lng: 55.2797,
        timestamp: '2026-10-04T15:20:00Z',
        handlerName: 'Senior Courier Tariq Al-Mansi',
        notes: 'Handover completed with OTP verification code 882914.',
      }
    ],
    
    handovers: [],
    incidents: [],
    
    proofOfDelivery: {
      id: 'pod-002',
      recipientName: 'Sheikh Mansoor Al-Khalifa',
      signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><path d="M 10 30 Q 50 10 90 35 T 180 20" stroke="%23000" fill="none" stroke-width="3"/></svg>',
      photoUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60',
      otpVerified: true,
      deliveredAt: '2026-10-04T15:20:00Z',
      lat: 25.1972,
      lng: 55.2797,
    },
    
    pricing: {
      baseRate: 2100,
      fuelSurcharge: 250,
      securitySurcharge: 500,
      insurancePremium: 7120,
      tax: 498,
      totalAmount: 10468,
      currency: 'USD',
      isPaid: true,
    },
    
    estimatedDelivery: '2026-10-04T16:00:00Z',
    createdAt: '2026-10-03T09:00:00Z',
    updatedAt: '2026-10-04T15:20:00Z',
  },

  {
    id: 'shipment-003',
    trackingNumber: 'SCS-2026-9912001A89',
    customerName: 'Embassy of Japan - London',
    customerEmail: 'diplomatic-cargo@ld.mofa.go.jp',
    accountType: 'government',
    serviceType: 'secure_doc',
    securityLevel: 'diplomatic_vault',
    
    sender: {
      name: 'Embassy Security Attache',
      phone: '+44 20 7465 6500',
      email: 'attache@ld.mofa.go.jp',
      company: 'Embassy of Japan',
      address: '101-104 Piccadilly',
      city: 'London',
      country: 'United Kingdom',
      lat: 51.5055,
      lng: -0.1448,
    },
    
    recipient: {
      name: 'Ministry of Foreign Affairs Tokyo',
      phone: '+81 3 3580 3311',
      email: 'diplomatic-bag@mofa.go.jp',
      company: 'MOFA Japan',
      address: '2-2-1 Kasumigaseki, Chiyoda-ku',
      city: 'Tokyo',
      country: 'Japan',
      lat: 35.6749,
      lng: 139.7537,
    },
    
    originHub: 'London Diplomatic Hub',
    destinationHub: 'Tokyo Haneda High Security Hub',
    
    packageDetails: {
      description: 'Sealed Diplomatic Pouch #JP-2026-991',
      packageType: 'Kevlar Reinforced Diplomatic Bag',
      pieces: 1,
      weightKg: 4.5,
      dimensionsCm: '30x20x10',
      declaredValue: 500000,
      currency: 'USD',
    },
    
    specialHandling: ['Diplomatic Immunity Clearance', 'Dual Armed Escort', 'No X-Ray Inspection Sealed'],
    tamperSealNumber: 'SEAL-DIPLO-JP990',
    
    currentStatus: 'SECURITY_SCREENING',
    transportMode: 'air',
    
    origin: {
      lat: 51.5055,
      lng: -0.1448,
      address: '101-104 Piccadilly',
      city: 'London',
      country: 'United Kingdom',
    },
    
    destination: {
      lat: 35.6749,
      lng: 139.7537,
      address: '2-2-1 Kasumigaseki, Chiyoda-ku',
      city: 'Tokyo',
      country: 'Japan',
    },
    
    currentLocation: {
      lat: 51.4700,
      lng: -0.4543,
      address: 'London Heathrow Airport Terminal 3 VIP Courier Lounge',
      city: 'London',
      country: 'United Kingdom',
      timestamp: '2026-10-05T12:00:00Z',
    },
    
    routePolyline: [
      [51.5055, -0.1448],
      [51.4700, -0.4543],
      [35.5494, 139.7798],
      [35.6749, 139.7537]
    ],
    
    telemetryHistory: [],
    statusLogs: [
      {
        id: 'log-301',
        status: 'ORDER_CREATED',
        location: 'Japanese Embassy London',
        lat: 51.5055,
        lng: -0.1448,
        timestamp: '2026-10-05T09:00:00Z',
        handlerName: 'Diplomatic Courier Kenji Sato',
      },
      {
        id: 'log-302',
        status: 'SECURITY_SCREENING',
        location: 'Heathrow Diplomatic Gate',
        lat: 51.4700,
        lng: -0.4543,
        timestamp: '2026-10-05T12:00:00Z',
        handlerName: 'Diplomatic Courier Kenji Sato',
        notes: 'Vienna Convention diplomatic immunity document verified.',
      }
    ],
    handovers: [],
    incidents: [],
    
    pricing: {
      baseRate: 3200,
      fuelSurcharge: 380,
      securitySurcharge: 800,
      insurancePremium: 4000,
      tax: 419,
      totalAmount: 8799,
      currency: 'USD',
      isPaid: true,
    },
    
    estimatedDelivery: '2026-10-06T10:00:00Z',
    createdAt: '2026-10-05T08:30:00Z',
    updatedAt: '2026-10-05T12:00:00Z',
  },

  {
    id: 'shipment-004',
    trackingNumber: 'SCS-2026-47F1902K33',
    customerName: 'Global Microchip Systems Corp',
    customerEmail: 'cargo@microchip-systems.sg',
    accountType: 'corporate',
    serviceType: 'express_intl',
    securityLevel: 'high_security',
    
    sender: {
      name: 'Singapore Wafer Fab 4',
      phone: '+65 6789 0000',
      email: 'shipping-sg@microchip.com',
      company: 'Microchip Systems SG',
      address: '10 Science Park Road',
      city: 'Singapore',
      country: 'Singapore',
      lat: 1.2882,
      lng: 103.7801,
    },
    
    recipient: {
      name: 'Silicon Valley AI Research Lab',
      phone: '+1 408 555 0199',
      email: 'intake@ai-research.io',
      company: 'Silicon AI Lab',
      address: '2800 Sand Hill Road',
      city: 'Menlo Park',
      country: 'United States',
      lat: 37.4220,
      lng: -122.2045,
    },
    
    originHub: 'Singapore Changi Vault Terminal',
    destinationHub: 'San Francisco SFO Security Vault',
    
    packageDetails: {
      description: 'Next-Gen 2nm AI Semiconductor Prototype Wafers',
      packageType: 'Temperature & Nitrogen Controlled Cask',
      pieces: 4,
      weightKg: 28.0,
      dimensionsCm: '60x60x50',
      declaredValue: 3500000,
      currency: 'USD',
    },
    
    specialHandling: ['Nitrogen Purge Monitoring', 'Shock & Tilt Sensor Log', 'Customs Inspection Hold'],
    tamperSealNumber: 'SEAL-SIN-009941',
    
    currentStatus: 'CUSTOMS_CLEARANCE',
    transportMode: 'air',
    
    origin: {
      lat: 1.2882,
      lng: 103.7801,
      address: '10 Science Park Road',
      city: 'Singapore',
      country: 'Singapore',
    },
    
    destination: {
      lat: 37.4220,
      lng: -122.2045,
      address: '2800 Sand Hill Road',
      city: 'Menlo Park',
      country: 'United States',
    },
    
    currentLocation: {
      lat: 37.6213,
      lng: -122.3790,
      address: 'San Francisco International Airport Bonded Vault',
      city: 'San Francisco',
      country: 'United States',
      timestamp: '2026-10-05T13:10:00Z',
    },
    
    routePolyline: [
      [1.2882, 103.7801],
      [1.3644, 103.9915],
      [37.6213, -122.3790],
      [37.4220, -122.2045]
    ],
    
    telemetryHistory: [],
    statusLogs: [
      {
        id: 'log-401',
        status: 'CUSTOMS_CLEARANCE',
        location: 'SFO Bonded Customs Vault',
        lat: 37.6213,
        lng: -122.3790,
        timestamp: '2026-10-05T13:10:00Z',
        handlerName: 'US Customs Officer D. Miller',
        notes: 'Routine high-value technology export customs documentation review under way.',
      }
    ],
    handovers: [],
    incidents: [
      {
        id: 'inc-401',
        shipmentId: 'shipment-004',
        trackingNumber: 'SCS-2026-47F1902K33',
        severity: 'medium',
        type: 'delay',
        description: 'US Customs documentation hold requiring import license verification.',
        locationName: 'SFO Airport Customs',
        lat: 37.6213,
        lng: -122.3790,
        status: 'under_investigation',
        reportedBy: 'Customs Compliance Agent L. Chang',
        createdAt: '2026-10-05T13:15:00Z',
      }
    ],
    
    pricing: {
      baseRate: 5400,
      fuelSurcharge: 648,
      securitySurcharge: 1350,
      insurancePremium: 28000,
      tax: 1770,
      totalAmount: 37168,
      currency: 'USD',
      isPaid: true,
    },
    
    estimatedDelivery: '2026-10-07T14:00:00Z',
    createdAt: '2026-10-04T02:00:00Z',
    updatedAt: '2026-10-05T13:10:00Z',
  }
];
