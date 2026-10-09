import { useState, useEffect } from 'react';
import { Shipment, User, Currency, Language, Incident, HandoverRecord, StatusLog, ProofOfDelivery } from './types';
import { SEED_SHIPMENTS } from './tracking';

const LOCAL_STORAGE_KEY_SHIPMENTS = 'scs_global_shipments_v1';
const LOCAL_STORAGE_KEY_USER = 'scs_global_current_user_v1';
const LOCAL_STORAGE_KEY_CURRENCY = 'scs_global_currency_v1';
const LOCAL_STORAGE_KEY_LANG = 'scs_global_lang_v1';

export const DEFAULT_USER: User = {
  id: 'usr-admin-01',
  name: 'Commander Alexander Vance',
  email: 'a.vance@scs-global.sec',
  role: 'super_admin',
  phone: '+1 800 555 9000',
  company: 'Sovereign Courier Security Ltd',
  twoFactorEnabled: true,
  kycStatus: 'verified',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
};

export function getStoredShipments(): Shipment[] {
  if (typeof window === 'undefined') return SEED_SHIPMENTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SHIPMENTS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_SHIPMENTS, JSON.stringify(SEED_SHIPMENTS));
      return SEED_SHIPMENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading shipments from storage', err);
    return SEED_SHIPMENTS;
  }
}

export function saveStoredShipments(shipments: Shipment[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_SHIPMENTS, JSON.stringify(shipments));
    window.dispatchEvent(new Event('scs_shipments_updated'));
  } catch (err) {
    console.error('Error saving shipments to storage', err);
  }
}

export function useShipmentsStore() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setShipments(getStoredShipments());
    setIsLoaded(true);

    const handleUpdate = () => {
      setShipments(getStoredShipments());
    };
    window.addEventListener('scs_shipments_updated', handleUpdate);
    return () => window.removeEventListener('scs_shipments_updated', handleUpdate);
  }, []);

  const addShipment = (newShipment: Shipment) => {
    const updated = [newShipment, ...shipments];
    saveStoredShipments(updated);
    setShipments(updated);
  };

  const updateShipmentStatus = (
    trackingNumber: string,
    newStatus: Shipment['currentStatus'],
    location: string,
    lat: number,
    lng: number,
    handlerName: string,
    notes?: string
  ) => {
    const updated = shipments.map((s) => {
      if (s.trackingNumber.toUpperCase() === trackingNumber.toUpperCase()) {
        const newLog: StatusLog = {
          id: `log-${Date.now()}`,
          status: newStatus,
          location,
          lat,
          lng,
          timestamp: new Date().toISOString(),
          handlerName,
          notes,
        };
        return {
          ...s,
          currentStatus: newStatus,
          currentLocation: {
            ...s.currentLocation,
            lat,
            lng,
            address: location,
            timestamp: new Date().toISOString(),
          },
          statusLogs: [newLog, ...s.statusLogs],
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });
    saveStoredShipments(updated);
    setShipments(updated);
  };

  const addHandover = (trackingNumber: string, handover: HandoverRecord) => {
    const updated = shipments.map((s) => {
      if (s.trackingNumber.toUpperCase() === trackingNumber.toUpperCase()) {
        return {
          ...s,
          handovers: [handover, ...s.handovers],
          tamperSealNumber: handover.sealVerified,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });
    saveStoredShipments(updated);
    setShipments(updated);
  };

  const addIncident = (incident: Incident) => {
    const updated = shipments.map((s) => {
      if (s.trackingNumber.toUpperCase() === incident.trackingNumber.toUpperCase()) {
        return {
          ...s,
          incidents: [incident, ...s.incidents],
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });
    saveStoredShipments(updated);
    setShipments(updated);
  };

  const setProofOfDelivery = (trackingNumber: string, pod: ProofOfDelivery) => {
    const updated = shipments.map((s) => {
      if (s.trackingNumber.toUpperCase() === trackingNumber.toUpperCase()) {
        const newLog: StatusLog = {
          id: `log-pod-${Date.now()}`,
          status: 'DELIVERED',
          location: s.destination.address,
          lat: pod.lat,
          lng: pod.lng,
          timestamp: pod.deliveredAt,
          handlerName: `Recipient Signature (${pod.recipientName})`,
          notes: `Verified OTP ${pod.otpVerified ? 'YES' : 'NO'}`,
        };
        return {
          ...s,
          currentStatus: 'DELIVERED' as const,
          proofOfDelivery: pod,
          statusLogs: [newLog, ...s.statusLogs],
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });
    saveStoredShipments(updated);
    setShipments(updated);
  };

  return {
    shipments,
    isLoaded,
    addShipment,
    updateShipmentStatus,
    addHandover,
    addIncident,
    setProofOfDelivery,
  };
}

export function useUserStore() {
  const [user, setUser] = useState<User>(DEFAULT_USER);

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const switchRole = (role: User['role']) => {
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(updated));
  };

  return { user, setUser, switchRole };
}

export function useGlobalSettings() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [language, setLanguage] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const savedCurr = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENCY) as Currency;
    if (savedCurr) setCurrency(savedCurr);

    const savedLang = localStorage.getItem(LOCAL_STORAGE_KEY_LANG) as Language;
    if (savedLang) setLanguage(savedLang);

    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const changeCurrency = (c: Currency) => {
    setCurrency(c);
    localStorage.setItem(LOCAL_STORAGE_KEY_CURRENCY, c);
  };

  const changeLanguage = (l: Language) => {
    setLanguage(l);
    localStorage.setItem(LOCAL_STORAGE_KEY_LANG, l);
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return {
    currency,
    changeCurrency,
    language,
    changeLanguage,
    darkMode,
    toggleDarkMode,
  };
}
