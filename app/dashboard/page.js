import ButtonAccount from "@/components/ButtonAccount";
import { createClient } from "@/libs/supabase/server";
import Link from "next/link";
import config from "@/config";

export const dynamic = "force-dynamic";

// Dashboard for PLSFIX-THX Chrome extension users
export default async function Dashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get profile to check Pro status
  const { data: profile } = await supabase
    .from("profiles")
    .select("has_access, customer_id, price_id, created_at")
    .eq("id", user?.id)
    .single();

  const isPro = profile?.has_access === true;

  return (
    <main className="min-h-screen p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Your Account</h1>
            <p className="text-base-content/60 mt-1">{user?.email}</p>
          </div>
          <ButtonAccount />
        </div>

        {/* License Status */}
        {isPro ? (
          <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content">
            <div className="card-body">
              <h2 className="card-title text-2xl">Lifetime Pro</h2>
              <p>You have unlimited access to all PLSFIX-THX features.</p>
              <div className="flex flex-wrap gap-4 text-sm opacity-90 mt-2">
                <span>Unlimited screenshots</span>
                <span>No watermarks</span>
                <span>PDF, PNG & HTML export</span>
                <span>All annotation tools</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-2xl">Free Plan</h2>
              <p className="text-base-content/70">
                You have 5 annotated screenshots per day with watermarked exports.
              </p>
              <div className="card-actions mt-4">
                <Link href="/#pricing" className="btn btn-primary">
                  Upgrade to Lifetime Pro — $39
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* What You Get */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Your Features</h2>
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isPro ? "bg-success" : "bg-success"}`}></div>
                  <span className="text-sm">Numbered annotations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isPro ? "bg-success" : "bg-success"}`}></div>
                  <span className="text-sm">PNG export</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isPro ? "bg-success" : "bg-success"}`}></div>
                  <span className="text-sm">Chrome extension</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isPro ? "bg-success" : "bg-warning"}`}></div>
                  <span className="text-sm">{isPro ? "Unlimited screenshots" : "5 screenshots per day"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isPro ? "bg-success" : "bg-base-300"}`}></div>
                  <span className={`text-sm ${!isPro ? "text-base-content/40" : ""}`}>No watermarks</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isPro ? "bg-success" : "bg-base-300"}`}></div>
                  <span className={`text-sm ${!isPro ? "text-base-content/40" : ""}`}>PDF & HTML export</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isPro ? "bg-success" : "bg-base-300"}`}></div>
                  <span className={`text-sm ${!isPro ? "text-base-content/40" : ""}`}>All annotation tools</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isPro ? "bg-success" : "bg-base-300"}`}></div>
                  <span className={`text-sm ${!isPro ? "text-base-content/40" : ""}`}>Lifetime updates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Getting Started / Help */}
          <div className="space-y-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Getting Started</h2>
                <div className="space-y-3 mt-2 text-sm text-base-content/70">
                  <p><strong>1.</strong> Install the Chrome extension from the Web Store</p>
                  <p><strong>2.</strong> Press <kbd className="kbd kbd-sm">Alt+Shift+S</kbd> to capture an area, or <kbd className="kbd kbd-sm">Alt+Shift+F</kbd> for full page</p>
                  <p><strong>3.</strong> Click on the image to add numbered annotations</p>
                  <p><strong>4.</strong> Export and paste into ChatGPT, Claude, Cursor, or any AI tool</p>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Need Help?</h2>
                <p className="text-base-content/70 text-sm">
                  {isPro
                    ? "As a Pro user, you get priority support."
                    : "Have a question or running into an issue?"}
                </p>
                <div className="card-actions justify-end mt-4">
                  <a
                    href={`mailto:${config.resend.supportEmail}`}
                    className="btn btn-outline btn-sm"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
