import { NextRequest, NextResponse } from "next/server";

/**
 * Partner Disconnect API
 *
 * Removes the connection between two partners.
 * Both partners' connections are cleared.
 */

// In-memory store (shared with other routes in production, use Vercel KV)
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
    const { myCode, partnerCode, deviceId } = await req.json() as {
      myCode: string;
      partnerCode: string;
      deviceId: string;
    };

    if (!myCode || !deviceId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Clear my connection
    const myData = partnerStore.get(myCode);
    if (myData) {
      myData.connectedTo = null;
      partnerStore.set(myCode, myData);
    }

    // Clear partner's connection to me
    if (partnerCode) {
      const partnerData = partnerStore.get(partnerCode);
      if (partnerData && partnerData.connectedTo === myCode) {
        partnerData.connectedTo = null;
        partnerStore.set(partnerCode, partnerData);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Disconnected successfully",
    });
  } catch (error) {
    console.error("Partner disconnect error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// Export the store for shared state
export { partnerStore };
