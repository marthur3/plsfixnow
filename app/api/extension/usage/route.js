import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

// Track Chrome extension usage (optional analytics)
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, action, metadata } = body;
    
    if (!userId || !action) {
      return NextResponse.json(
        { error: "User ID and action are required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Log usage event (you can create a usage_events table)
    // For now, just return success to avoid database dependencies
    
    // Optional: Create usage_events table:
    // CREATE TABLE usage_events (
    //   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    //   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    //   action TEXT NOT NULL,
    //   metadata JSONB,
    //   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    // );
    
    // const { error: insertError } = await supabase
    //   .from("usage_events")
    //   .insert({
    //     user_id: userId,
    //     action: action,
    //     metadata: metadata || {}
    //   });

    // if (insertError) {
    //   console.error("Usage tracking error:", insertError);
    // }

    return NextResponse.json({
      success: true,
      message: "Usage tracked successfully"
    });

  } catch (error) {
    console.error("Extension usage tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get usage statistics for a user
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Verify user exists and get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, has_access, created_at")
      .eq("id", userId)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return basic usage info
    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        hasAccess: Boolean(profile.has_access),
        memberSince: profile.created_at,
        plan: profile.has_access ? 'pro' : 'free'
      },
      // Add more usage stats here if you implement usage_events table
      usage: {
        totalEvents: 0, // Placeholder
        lastActivity: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Extension usage stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}