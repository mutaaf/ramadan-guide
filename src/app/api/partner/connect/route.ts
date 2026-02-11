import { NextRequest, NextResponse } from "next/server";

/**
 * Partner Connection API
 *
 * This endpoint handles partner code exchange.
 * Uses Vercel KV or simple in-memory store for partner codes.
 *
 * Privacy: Only stores code-to-deviceId mapping, no personal data.
 */

// In-memory store for development (replace with Vercel KV in production)
// Structure: { code: { deviceId, connectedTo, createdAt } }
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

// Cleanup old entries (older than 30 days)
function cleanupOldEntries() {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  for (const [code, data] of partnerStore.entries()) {
    if (data.createdAt < thirtyDaysAgo) {
      partnerStore.delete(code);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { myCode, partnerCode, deviceId } = await req.json() as {
      myCode: string;
      partnerCode: string;
      deviceId: string;
    };

    if (!myCode || !partnerCode || !deviceId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Cleanup old entries periodically
    if (Math.random() < 0.1) cleanupOldEntries();

    // Register my code if not exists
    if (!partnerStore.has(myCode)) {
      partnerStore.set(myCode, {
        deviceId,
        connectedTo: null,
        createdAt: Date.now(),
        stats: null,
      });
    }

    // Check if partner code exists
    const partnerData = partnerStore.get(partnerCode);

    if (!partnerData) {
      // Partner hasn't registered yet - create a pending connection
      // When they register and try to connect, they'll find us
      partnerStore.set(partnerCode, {
        deviceId: '', // Unknown until they register
        connectedTo: myCode,
        createdAt: Date.now(),
        stats: null,
      });

      // Update my connection
      const myData = partnerStore.get(myCode)!;
      myData.connectedTo = partnerCode;
      partnerStore.set(myCode, myData);

      return NextResponse.json({
        success: true,
        message: "Connection pending - waiting for partner to connect",
      });
    }

    // Partner exists - establish bidirectional connection
    partnerData.connectedTo = myCode;
    partnerStore.set(partnerCode, partnerData);

    const myData = partnerStore.get(myCode)!;
    myData.connectedTo = partnerCode;
    partnerStore.set(myCode, myData);

    return NextResponse.json({
      success: true,
      message: "Connected successfully!",
      partnerDeviceId: partnerData.deviceId,
    });
  } catch (error) {
    console.error("Partner connect error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// Export the store for use by other routes
export { partnerStore };
