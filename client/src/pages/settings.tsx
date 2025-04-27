import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types/user";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { EditProfileDialog } from "@/components/settings/EditProfileDialog";

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    retry: false
  });

  // Placeholder handlers for demonstration
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Settings saved (demo only)");
  };

  // Save profile changes (simulate API call)
  const handleProfileSave = async (data: { name: string; email: string }) => {
    setProfile(data);
    alert("Profile updated (demo only)");
    // TODO: Replace with actual API call and refetch user data
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <i className="fas fa-user-lock text-3xl mb-2"></i>
        <p>Please log in to access settings.</p>
      </div>
    );
  }

  // Use updated profile if available
  const displayUser = profile ? { ...user, ...profile } : user;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-8 lg:p-12 xl:p-16 w-full max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-8 text-gray-900">Settings</h1>
          <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          {activeTab === "account" && (
            <section className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 text-primary">Account</h2>
              <div className="flex flex-col gap-2 text-gray-700 mb-4">
                <div><span className="font-medium">Name:</span> {displayUser.name}</div>
                <div><span className="font-medium">Email:</span> {displayUser.email}</div>
                <div><span className="font-medium">Role:</span> {displayUser.role}</div>
              </div>
              <Button variant="outline" className="mt-2" onClick={() => setEditProfileOpen(true)}>Edit Profile</Button>
              <EditProfileDialog
                open={editProfileOpen}
                onClose={() => setEditProfileOpen(false)}
                user={displayUser}
                onSave={handleProfileSave}
              />
            </section>
          )}

          {activeTab === "security" && (
            <section className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 text-primary">Security</h2>
              <form className="flex flex-col gap-4" onSubmit={handleSave}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Change Password</label>
                  <input type="password" placeholder="New password" className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input type="password" placeholder="Confirm new password" className="w-full border rounded px-3 py-2" />
                </div>
                <Button type="submit" className="w-fit">Update Password</Button>
              </form>
            </section>
          )}

          {activeTab === "preferences" && (
            <section className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 text-primary">Preferences</h2>
              <form className="flex flex-col gap-4" onSubmit={handleSave}>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="notif" className="accent-primary" />
                  <label htmlFor="notif" className="text-gray-700">Enable Email Notifications</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="darkmode" className="accent-primary" />
                  <label htmlFor="darkmode" className="text-gray-700">Enable Dark Mode</label>
                </div>
                <Button type="submit" className="w-fit">Save Preferences</Button>
              </form>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
