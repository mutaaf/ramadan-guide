/**
 * Accountability Partner Sync Logic
 *
 * Lightweight stat sync using Vercel serverless functions.
 * All personal data stays local - only aggregate stats are synced.
 */

import {
  DailySync,
  PartnerStats,
  ConnectResponse,
  SyncResponse,
  DisconnectResponse,
  SYNC_INTERVAL_MS,
  HYDRATION_ON_TRACK_THRESHOLD,
  getOrCreateDeviceId,
  generatePartnerCode,
  isValidPartnerCode,
} from './types';

const API_BASE = '/api/partner';

/**
 * Storage keys for partner data
 */
const STORAGE_KEYS = {
  MY_CODE: 'ramadan-partner-my-code',
  PARTNER_CODE: 'ramadan-partner-code',
  PARTNER_DEVICE_ID: 'ramadan-partner-device-id',
  CONNECTED_AT: 'ramadan-partner-connected-at',
  LAST_SYNC: 'ramadan-partner-last-sync',
  PARTNER_STATS: 'ramadan-partner-stats',
};

/**
 * Get or generate this device's partner code
 */
export function getMyPartnerCode(): string {
  if (typeof window === 'undefined') return '';

  let code = localStorage.getItem(STORAGE_KEYS.MY_CODE);
  if (!code) {
    code = generatePartnerCode();
    localStorage.setItem(STORAGE_KEYS.MY_CODE, code);
  }
  return code;
}

/**
 * Check if currently connected to a partner
 */
export function isConnectedToPartner(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(STORAGE_KEYS.PARTNER_CODE);
}

/**
 * Get the connected partner's code
 */
export function getPartnerCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.PARTNER_CODE);
}

/**
 * Get cached partner stats (for offline/fast display)
 */
export function getCachedPartnerStats(): PartnerStats | null {
  if (typeof window === 'undefined') return null;

  const cached = localStorage.getItem(STORAGE_KEYS.PARTNER_STATS);
  if (!cached) return null;

  try {
    return JSON.parse(cached) as PartnerStats;
  } catch {
    return null;
  }
}

/**
 * Connect to a partner using their code
 */
export async function connectToPartner(partnerCode: string): Promise<ConnectResponse> {
  if (!isValidPartnerCode(partnerCode)) {
    return { success: false, message: 'Invalid partner code format' };
  }

  const myCode = getMyPartnerCode();
  const deviceId = getOrCreateDeviceId();
  const normalizedCode = partnerCode.toUpperCase();

  // Can't connect to yourself
  if (normalizedCode === myCode) {
    return { success: false, message: "You can't connect to yourself" };
  }

  try {
    const response = await fetch(`${API_BASE}/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        myCode,
        partnerCode: normalizedCode,
        deviceId,
      }),
    });

    const data = await response.json() as ConnectResponse;

    if (data.success) {
      // Store connection locally
      localStorage.setItem(STORAGE_KEYS.PARTNER_CODE, normalizedCode);
      localStorage.setItem(STORAGE_KEYS.CONNECTED_AT, Date.now().toString());
      if (data.partnerDeviceId) {
        localStorage.setItem(STORAGE_KEYS.PARTNER_DEVICE_ID, data.partnerDeviceId);
      }
    }

    return data;
  } catch (error) {
    console.error('Partner connect error:', error);
    return { success: false, message: 'Connection failed. Please try again.' };
  }
}

/**
 * Disconnect from current partner
 */
export async function disconnectFromPartner(): Promise<DisconnectResponse> {
  const myCode = getMyPartnerCode();
  const partnerCode = getPartnerCode();
  const deviceId = getOrCreateDeviceId();

  if (!partnerCode) {
    return { success: false, message: 'Not connected to a partner' };
  }

  try {
    const response = await fetch(`${API_BASE}/disconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        myCode,
        partnerCode,
        deviceId,
      }),
    });

    const data = await response.json() as DisconnectResponse;

    // Clear local storage regardless of server response
    localStorage.removeItem(STORAGE_KEYS.PARTNER_CODE);
    localStorage.removeItem(STORAGE_KEYS.PARTNER_DEVICE_ID);
    localStorage.removeItem(STORAGE_KEYS.CONNECTED_AT);
    localStorage.removeItem(STORAGE_KEYS.PARTNER_STATS);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);

    return data;
  } catch (error) {
    console.error('Partner disconnect error:', error);
    // Still clear local data even if server fails
    localStorage.removeItem(STORAGE_KEYS.PARTNER_CODE);
    localStorage.removeItem(STORAGE_KEYS.PARTNER_DEVICE_ID);
    localStorage.removeItem(STORAGE_KEYS.CONNECTED_AT);
    localStorage.removeItem(STORAGE_KEYS.PARTNER_STATS);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    return { success: true, message: 'Disconnected locally' };
  }
}

/**
 * Build my daily sync data from current store state
 */
export function buildMySyncData(
  prayerCount: number,
  glassesOfWater: number,
  streak: number
): DailySync {
  return {
    oderId: getOrCreateDeviceId(),
    prayerCount: Math.min(5, Math.max(0, prayerCount)),
    hydrationOnTrack: glassesOfWater >= HYDRATION_ON_TRACK_THRESHOLD,
    streak: Math.max(0, streak),
    lastUpdated: Date.now(),
  };
}

/**
 * Sync stats with partner
 * Returns partner's stats if available
 */
export async function syncWithPartner(myStats: DailySync): Promise<SyncResponse> {
  const partnerCode = getPartnerCode();
  const myCode = getMyPartnerCode();

  if (!partnerCode) {
    return { success: false, partnerStats: null, message: 'Not connected' };
  }

  // Check if we've synced recently (within interval)
  const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  if (lastSync) {
    const elapsed = Date.now() - parseInt(lastSync, 10);
    if (elapsed < SYNC_INTERVAL_MS) {
      // Return cached stats instead
      const cached = getCachedPartnerStats();
      return { success: true, partnerStats: cached };
    }
  }

  try {
    const response = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        myCode,
        partnerCode,
        myStats,
      }),
    });

    const data = await response.json() as SyncResponse;

    if (data.success && data.partnerStats) {
      // Cache partner stats locally
      localStorage.setItem(STORAGE_KEYS.PARTNER_STATS, JSON.stringify(data.partnerStats));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
    }

    return data;
  } catch (error) {
    console.error('Partner sync error:', error);
    // Return cached stats on error
    const cached = getCachedPartnerStats();
    return { success: false, partnerStats: cached, message: 'Sync failed, showing cached data' };
  }
}

/**
 * Calculate prayer streak from day entries
 * A streak is consecutive days with all 5 prayers completed
 */
export function calculatePrayerStreak(
  days: Record<string, { prayers: { fajr: boolean; dhur: boolean; asr: boolean; maghrib: boolean; ishaa: boolean } }>
): number {
  const sortedDates = Object.keys(days).sort().reverse();
  let streak = 0;

  for (const date of sortedDates) {
    const day = days[date];
    const prayers = day.prayers;
    const completed = [prayers.fajr, prayers.dhur, prayers.asr, prayers.maghrib, prayers.ishaa]
      .filter(Boolean).length;

    if (completed === 5) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get the time since last partner sync, formatted
 */
export function getTimeSinceLastSync(): string | null {
  if (typeof window === 'undefined') return null;

  const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  if (!lastSync) return null;

  const elapsed = Date.now() - parseInt(lastSync, 10);
  const minutes = Math.floor(elapsed / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Check if partner has completed all prayers today
 */
export function didPartnerCompleteToday(stats: PartnerStats | null): boolean {
  if (!stats) return false;
  return stats.prayerCount === 5;
}

/**
 * Get connection status information
 */
export function getConnectionInfo(): {
  connected: boolean;
  myCode: string;
  partnerCode: string | null;
  connectedAt: number | null;
} {
  const myCode = getMyPartnerCode();
  const partnerCode = getPartnerCode();
  const connectedAtStr = typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_KEYS.CONNECTED_AT)
    : null;

  return {
    connected: !!partnerCode,
    myCode,
    partnerCode,
    connectedAt: connectedAtStr ? parseInt(connectedAtStr, 10) : null,
  };
}
