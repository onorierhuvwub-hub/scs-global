export type ServiceType = 
  | 'armored_transit'
  | 'secure_doc'
  | 'high_value_cargo'
  | 'express_intl'
  | 'same_day_local'
  | 'customs_clearance'
  | 'vault_storage';

export type SecurityLevel = 
  | 'standard'
  | 'high_security'
  | 'maximum_armored'
  | 'diplomatic_vault';

export type ShipmentStatus = 
  | 'ORDER_CREATED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'SECURITY_SCREENING'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_HUB'
  | 'CUSTOMS_CLEARANCE'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELIVERY_ATTEMPTED'
  | 'ON_HOLD'
  | 'RETURNED';

export type TransportMode = 'road' | 'air' | 'sea';

export interface LocationPoint {
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
  hubName?: string;
  timestamp?: string;
}

export interface StatusLog {
  id: string;
  status: ShipmentStatus;
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  handlerName: string;
  notes?: string;
  transportMode?: TransportMode;
}

export interface HandoverRecord {
  id: string;
  releasingHandler: string;
  receivingHandler: string;
  sealVerified: string;
  sealStatus: 'intact' | 'broken' | 'replaced';
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  releasingSignatureUrl?: string;
  receivingSignatureUrl?: string;
}

export interface TelemetryPoint {
  timestamp: string;
  lat: number;
  lng: number;
  speedKmh: number;
  headingDeg: number;
  altitudeMeters?: number;
  transportMode: TransportMode;
  vehicleCode: string;
  batteryLevel?: number;
  temperatureCelsius?: number;
}

export interface Incident {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'route_deviation' | 'unexpected_stop' | 'tamper_alert' | 'delay' | 'damage' | 'sos_panic';
  description: string;
  locationName: string;
  lat: number;
  lng: number;
  status: 'open' | 'under_investigation' | 'resolved' | 'escalated';
  reportedBy: string;
  createdAt: string;
}

export interface ProofOfDelivery {
  id: string;
  recipientName: string;
  signatureUrl: string;
  photoUrl?: string;
  otpVerified: boolean;
  deliveredAt: string;
  lat: number;
  lng: number;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  accountType: 'individual' | 'corporate' | 'government';
  serviceType: ServiceType;
  securityLevel: SecurityLevel;
  
  sender: {
    name: string;
    phone: string;
    email: string;
    company?: string;
    address: string;
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  
  recipient: {
    name: string;
    phone: string;
    email: string;
    company?: string;
    address: string;
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  
  originHub: string;
  destinationHub: string;
  
  packageDetails: {
    description: string;
    packageType: string;
    pieces: number;
    weightKg: number;
    dimensionsCm: string; // e.g. "40x30x20"
    declaredValue: number;
    currency: string;
  };
  
  specialHandling: string[]; // e.g. ['Tamper-Evident Seal', 'Dual Armed Escort', 'Vault Storage']
  tamperSealNumber: string;
  
  currentStatus: ShipmentStatus;
  transportMode: TransportMode;
  
  origin: LocationPoint;
  destination: LocationPoint;
  currentLocation: LocationPoint;
  
  routePolyline: [number, number][]; // array of [lat, lng]
  telemetryHistory: TelemetryPoint[];
  statusLogs: StatusLog[];
  handovers: HandoverRecord[];
  incidents: Incident[];
  proofOfDelivery?: ProofOfDelivery;
  
  pricing: {
    baseRate: number;
    fuelSurcharge: number;
    securitySurcharge: number;
    insurancePremium: number;
    tax: number;
    totalAmount: number;
    currency: string;
    isPaid: boolean;
  };
  
  passwordProtected?: boolean;
  passcode?: string;
  
  estimatedDelivery: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'ops_manager' | 'dispatcher' | 'customer_support' | 'finance' | 'security_officer' | 'courier' | 'customer';
  phone: string;
  avatar?: string;
  company?: string;
  twoFactorEnabled: boolean;
  kycStatus?: 'verified' | 'pending' | 'unverified';
}

export interface Hub {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  address: string;
  securityRating: string;
  vaultCapacityKg: number;
  activeShipmentsCount: number;
  contactPhone: string;
}

export interface FleetVehicle {
  id: string;
  code: string;
  type: 'armored_truck' | 'armored_van' | 'security_aircraft' | 'vault_vessel';
  licensePlate: string;
  driverName: string;
  driverPhone: string;
  currentLat: number;
  currentLng: number;
  speedKmh: number;
  status: 'active' | 'in_transit' | 'idle' | 'maintenance';
  activeShipmentId?: string;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'AED' | 'JPY' | 'CAD' | 'CHF';
export type Language = 'en' | 'fr' | 'ar' | 'es' | 'zh';
