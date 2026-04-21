import { NeuroProfile, NeuroProfileId } from './lib/neuro/profiles';

export type InterfaceProfileId = NeuroProfileId;

export type GlowLevel = 'none' | 'low' | 'medium' | 'high';

export type MotionLevel = 'static' | 'smooth' | 'dynamic';

export type InterfaceProfile = NeuroProfile;

export interface TradeEntry {
  id?: string;
  uid: string;
  createdAt: any;
  pair: string;
  direction: 'long' | 'short';
  timeframe: string;
  entry: number;
  sl: number;
  tp: number;
  rr: number | null;
  resultR: number | null;
  outcome: 'good' | 'bad';
  emotion: string;
  screenshot: string;
  notes: string;
}

export interface JournalSettings {
  startingCapital: number;
  riskPercent: number;
  currencySymbol: string;
  currencyCode: string;
  language: string;
}

export interface Trade {
  ticker: string;
  pos: number;
  entry: number;
}

export interface NewsItem {
  id: string;
  text: string;
  timestamp: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  username?: string;
  email: string;
  photoURL: string;
  coverURL?: string;
  isVerified?: boolean;
  interfaceType: InterfaceProfileId;
  customTheme?: {
    primaryColor: string;
    secondaryColor: string;
    fontSize: string;
    highContrast: boolean;
  };
  bio?: string;
  keywords?: string[];
  linkInBio?: string;
  contactInfo?: {
    email?: string;
    twitter?: string;
    discord?: string;
    instagram?: string;
    website?: string;
  };
  metrics?: {
    followers: number;
    following: number;
    mutuals: number;
  };
  intro?: {
    bio: string;
    location: string;
    company: string;
  };
  lastLegalAck?: any;
  createdAt: any;
}

export interface TimelinePost {
  id?: string;
  uid: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'none';
  chartMarkup?: string;
  market_layer?: string;
  likesCount?: number;
  createdAt: any;
}

export interface AboutContent {
  title: string;
  body: string;
  lastUpdated: any;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  price?: string;
  change?: string;
  group: string;
}

export interface MarketGroup {
  name: string;
  assets: MarketAsset[];
}

export interface TraderProfile {
  universe: {
    tickers: string[];
    industries: string[];
    countries: string[];
    commodities: string[];
  };
  exposures: {
    factor: string[];
    sector: string[];
    region: string[];
    rates: number; // sensitivity
    fx: string[];
  };
  constraints: {
    holdingPeriod: string;
    maxDrawdown: number;
    leverage: number;
    liquidityNeeds: string;
    eventRiskTolerance: 'low' | 'medium' | 'high';
  };
  catalystCalendar: {
    earningsWindows: string[];
    rollDates: string[];
    fomcCpiSensitivity: number;
    electionRegulatorySensitivity: number;
  };
  preferredSources: string[];
}

export interface EventObject {
  event_id: string;
  event_time: number; // UTC
  event_type: string; // filing, rule, bill, macro_update, article, advisory...
  entities: string[]; // CIKs, tickers, agencies, committees, countries
  topics: string[]; // energy, banking, AI, defense, sanctions, taxes...
  raw_source: {
    url: string;
    provider: string;
    original_payload?: any;
  };
  title?: string;
  detail?: string;
  source?: string;
  color?: string;
  confidence: number; // 0-1
  impactScore?: number;
  impactExplanation?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AIAsset {
  id: string;
  uid: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  model: string;
  config: any;
  createdAt: any;
}

export interface Task {
  id?: string;
  uid: string;
  title: string;
  completed: boolean;
  dueDate: any; // Timestamp
  createdAt: any;
}
