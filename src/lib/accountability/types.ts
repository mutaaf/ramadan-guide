/**
 * Accountability Partner System Types
 *
 * Privacy-preserving partner system that syncs only aggregate stats.
 * No personal data, no names, no chat - just accountability through shared progress.
 */

/**
 * What gets synced daily between partners - ONLY this, nothing else.
 * Designed to be minimal and privacy-preserving.
 */
export interface DailySync {
  oderId: string;           // Anonymous device ID (typo preserved from spec)
  prayerCount: number;      // 0-5 (just the count of obligatory prayers)
  hydrationOnTrack: boolean; // Yes/no only (4+ glasses = on track)
  streak: number;           // Current prayer streak days
  lastUpdated: number;      // Timestamp
}

/**
 * Partner connection stored locally
 */
export interface PartnerConnection {
  partnerCode: string;      // The code used to connect (e.g., "FAJR7K")
  myCode: string;           // This device's generated code
  deviceId: string;         // Anonymous device identifier
  connectedAt: number;      // Timestamp when connected
  isActive: boolean;        // Whether connection is active
}

/**
 * Partner stats received from sync
 */
export interface PartnerStats {
  prayerCount: number;      // Partner's prayer count today (0-5)
  hydrationOnTrack: boolean; // Partner's hydration status
  streak: number;           // Partner's current streak
  lastUpdated: number;      // When partner last synced
  todayCompleted: boolean;  // Did partner complete all 5 prayers today?
}

/**
 * Combined view for dashboard display
 */
export interface PartnerDashboardData {
  connected: boolean;
  myStats: DailySync | null;
  partnerStats: PartnerStats | null;
  myCode: string | null;
  partnerCode: string | null;
  lastSyncTime: number | null;
}

/**
 * API response types
 */
export interface ConnectResponse {
  success: boolean;
  message: string;
  partnerDeviceId?: string;
}

export interface SyncResponse {
  success: boolean;
  partnerStats: PartnerStats | null;
  message?: string;
}

export interface DisconnectResponse {
  success: boolean;
  message: string;
}

/**
 * Partner code format: 6 alphanumeric characters
 * Pattern: 4 letters + 2 digits (e.g., "FAJR7K", "PRAY42")
 */
export const PARTNER_CODE_LENGTH = 6;
export const PARTNER_CODE_PATTERN = /^[A-Z]{4}[0-9][A-Z0-9]$/;

/**
 * Hydration threshold: 4+ glasses = on track
 */
export const HYDRATION_ON_TRACK_THRESHOLD = 4;

/**
 * Sync frequency: Only sync on app open, max once per hour
 */
export const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generate a unique device ID (stored in localStorage)
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';

  const DEVICE_ID_KEY = 'ramadan-guide-device-id';
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    // Generate a random ID: 16 hex characters
    deviceId = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Generate a partner code
 * Format: 4 consonants + 1 digit + 1 letter/digit
 * Uses consonants to avoid accidental bad words
 */
export function generatePartnerCode(): string {
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
  const alphanumeric = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  let code = '';
  // 4 consonants
  for (let i = 0; i < 4; i++) {
    code += consonants[Math.floor(Math.random() * consonants.length)];
  }
  // 1 digit
  code += Math.floor(Math.random() * 10).toString();
  // 1 alphanumeric
  code += alphanumeric[Math.floor(Math.random() * alphanumeric.length)];

  return code;
}

/**
 * Validate a partner code format
 */
export function isValidPartnerCode(code: string): boolean {
  if (!code || code.length !== PARTNER_CODE_LENGTH) return false;
  // Basic validation: 6 alphanumeric, uppercase
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
}
