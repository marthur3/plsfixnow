import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

// Handle authentication callback from Chrome extension
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Exchange the code for a session
    const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code);

    if (authError) {
      console.error("Auth exchange error:", authError);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const user = authData.user;
    if (!user) {
      return NextResponse.json(
        { error: "No user found" },
        { status: 401 }
      );
    }

    // Get user profile to check license status
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("has_access, customer_id, price_id")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Profile error:", profileError);
    }

    // Create redirect URL back to extension with user info
    const redirectUrl = new URL('chrome-extension://extension-id/editor.html');
    redirectUrl.searchParams.set('auth', 'success');
    redirectUrl.searchParams.set('user_id', user.id);
    redirectUrl.searchParams.set('email', user.email);
    redirectUrl.searchParams.set('has_access', profile?.has_access ? 'true' : 'false');
    
    if (authData.session?.access_token) {
      redirectUrl.searchParams.set('token', authData.session.access_token);
    }

    // Redirect back to extension
    return NextResponse.redirect(redirectUrl.toString());

  } catch (error) {
    console.error("Extension auth callback error:", error);
    
    // Redirect to extension with error
    const errorUrl = new URL('chrome-extension://extension-id/editor.html');
    errorUrl.searchParams.set('auth', 'error');
    errorUrl.searchParams.set('message', 'Authentication failed');
    
    return NextResponse.redirect(errorUrl.toString());
  }
}

// Handle POST requests for extension auth
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, action } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    let authResult;
    if (action === 'signup') {
      authResult = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/extension/auth/callback`
        }
      });
    } else {
      authResult = await supabase.auth.signInWithPassword({
        email,
        password
      });
    }

    const { data, error } = authResult;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("has_access, customer_id, price_id")
      .eq("id", data.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Profile error:", profileError);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        hasAccess: Boolean(profile?.has_access),
        customerId: profile?.customer_id,
        priceId: profile?.price_id
      },
      session: data.session
    });

  } catch (error) {
    console.error("Extension auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}