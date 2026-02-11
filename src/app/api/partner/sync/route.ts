import { NextRequest, NextResponse } from "next/server";
import type { DailySync, PartnerStats } from "@/lib/accountability/types";

/**
 * Partner Sync API
 *
 * Exchanges daily stats between connected partners.
 * Only syncs aggregate data - no personal information.
 */

// In-memory store (shared with connect route in production, use Vercel KV)
const partnerStore = new Map<string, {
  deviceId: string;
  connectedTo: string | null;
  createdAt: number;
  stats: {
    prayerCount: number;
    hydrationOnTrack: boolean;
    streak: number;
    lastUpdated: number;
  } | null;
}>();

export async function POST(req: NextRequest) {
  try {
    const { myCode, partnerCode, myStats } = await req.json() as {
      myCode: string;
      partnerCode: string;
      myStats: DailySync;
    };

    if (!myCode || !partnerCode || !myStats) {
      return NextResponse.json(
        { success: false, partnerStats: null, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update my stats
    let myData = partnerStore.get(myCode);
    if (!myData) {
      myData = {
        deviceId: myStats.oderId,
        connectedTo: partnerCode,
        createdAt: Date.now(),
        stats: null,
      };
    }

    myData.stats = {
      prayerCount: myStats.prayerCount,
      hydrationOnTrack: myStats.hydrationOnTrack,
      streak: myStats.streak,
      lastUpdated: myStats.lastUpdated,
    };
    partnerStore.set(myCode, myData);

    // Get partner stats
    const partnerData = partnerStore.get(partnerCode);

    if (!partnerData || !partnerData.stats) {
      return NextResponse.json({
        success: true,
        partnerStats: null,
        message: "Partner hasn't synced yet",
      });
    }

    // Verify connection is valid
    if (partnerData.connectedTo !== myCode) {
      return NextResponse.json({
        success: false,
        partnerStats: null,
        message: "Connection not established",
      });
    }

    const partnerStats: PartnerStats = {
      prayerCount: partnerData.stats.prayerCount,
      hydrationOnTrack: partnerData.stats.hydrationOnTrack,
      streak: partnerData.stats.streak,
      lastUpdated: partnerData.stats.lastUpdated,
      todayCompleted: partnerData.stats.prayerCount === 5,
    };

    return NextResponse.json({
      success: true,
      partnerStats,
    });
  } catch (error) {
    console.error("Partner sync error:", error);
    return NextResponse.json(
      { success: false, partnerStats: null, message: "Server error" },
      { status: 500 }
    );
  }
}

// Export the store for shared state
export { partnerStore };
