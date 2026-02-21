import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

// UUID v4 format validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Simple in-memory rate limiter (resets on cold start, good enough for serverless)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per userId

function checkRateLimit(key) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { windowStart: now, count: 1 });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Verify Chrome extension user license status
export async function GET(req, { params }) {
  try {
    const { userId } = params;

    if (!userId || !UUID_REGEX.test(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Rate limit by userId
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const supabase = createClient();

    // Only select the fields we need to return
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, has_access")
      .eq("id", userId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return only license status — no email, customerId, or priceId
    return NextResponse.json({
      success: true,
      hasAccess: Boolean(profile.has_access),
    });

  } catch (error) {
    console.error("Extension verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
