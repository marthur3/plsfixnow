import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

// Verify Chrome extension user license status
export async function GET(req, { params }) {
  try {
    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get user profile with license status
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, email, has_access, customer_id, price_id")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return license verification result
    return NextResponse.json({
      success: true,
      userId: profile.id,
      email: profile.email,
      hasAccess: Boolean(profile.has_access),
      customerId: profile.customer_id,
      priceId: profile.price_id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Extension verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}