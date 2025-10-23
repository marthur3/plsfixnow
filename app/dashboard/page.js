import ButtonAccount from "@/components/ButtonAccount";

export const dynamic = "force-dynamic";

// Premium feature management dashboard for PLSFIX-THX Chrome extension users
export default async function Dashboard() {
  return (
    <main className="min-h-screen p-8 pb-24 bg-base-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">Premium Dashboard</h1>
          <ButtonAccount />
        </div>

        {/* Premium Status Card */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content">
          <div className="card-body">
            <h2 className="card-title text-2xl">🎉 Premium Active</h2>
            <p>You have access to all premium features in the PLSFIX-THX extension.</p>
            <div className="flex gap-4 text-sm opacity-90">
              <span>• Advanced PDF exports</span>
              <span>• Cloud storage & sync</span>
              <span>• Collaboration tools</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Usage Statistics */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Usage Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="stat">
                    <div className="stat-title">Screenshots</div>
                    <div className="stat-value text-2xl">1,234</div>
                    <div className="stat-desc">This month</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Annotations</div>
                    <div className="stat-value text-2xl">5,678</div>
                    <div className="stat-desc">Total created</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">PDF Exports</div>
                    <div className="stat-value text-2xl">89</div>
                    <div className="stat-desc">This month</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Storage Used</div>
                    <div className="stat-value text-2xl">2.1GB</div>
                    <div className="stat-desc">of 10GB</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cloud Storage Management */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Cloud Storage</h2>
                <p className="text-base-content/70">Manage your synced screenshots and annotations</p>
                <div className="mt-4">
                  <progress className="progress progress-primary w-full" value="21" max="100"></progress>
                  <p className="text-sm mt-2 text-base-content/60">2.1 GB of 10 GB used</p>
                </div>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-primary btn-sm">Manage Storage</button>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Features Panel */}
          <div className="space-y-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Premium Features</h2>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">Advanced PDF exports</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">Cloud storage & sync</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">Collaboration tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">Priority support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">Advanced annotation tools</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Extension Settings</h2>
                <p className="text-base-content/70 text-sm">Configure your extension preferences</p>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-outline btn-sm">Open Settings</button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Need Help?</h2>
                <p className="text-base-content/70 text-sm">Get priority support as a premium user</p>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-outline btn-sm">Contact Support</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
