import ButtonAccount from "@/components/ButtonAccount";
import { createClient } from "@/libs/supabase/server";
import config from "@/config";

export const dynamic = "force-dynamic";

// Dashboard for PLSFIX-THX Chrome extension users
export default async function Dashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

        {/* Status */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content">
          <div className="card-body">
            <h2 className="card-title text-2xl">All Features Unlocked</h2>
            <p>You have full access to every PLSFIX-THX feature — completely free.</p>
            <div className="flex flex-wrap gap-4 text-sm opacity-90 mt-2">
              <span>Unlimited markups</span>
              <span>No watermarks</span>
              <span>PDF, PNG & HTML export</span>
              <span>Copy for AI</span>
              <span>All annotation tools</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* What You Get */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Your Features</h2>
              <div className="space-y-3 mt-4">
                {[
                  "Unlimited markups",
                  "Numbered annotations",
                  "All annotation tools",
                  "PNG export",
                  "PDF & HTML export",
                  "No watermarks",
                  "Copy for AI",
                  "Chrome extension",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
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
                  Have a question or running into an issue?
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
