import { useState } from 'react';
import { Upload, User, Shield, Lock, Settings as SettingsIcon, Building, Mail, CreditCard, Search, ChevronDown } from 'lucide-react';
import { useGetAdminRoles } from '@/api/api_controllers/adminController';
import { useInviteAdmin } from '@/api/api_controllers/userController';
import ProfileTab from '@/components/portal/ProfileTab';
import PasswordTab from '@/components/portal/PasswordTab';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('User Profile');
  const [fullName, setFullName] = useState('');
  // const [currentPage] = useState(1);
  const [email, setEmail] = useState('');
  const [adminRole, setAdminRole] = useState(""); // selected role id

  const { data: rolesData, isLoading: rolesLoading } = useGetAdminRoles({
    page: 1,
    perPage: 100,
    enabled: activeTab === "Admin Management",
  });

  const { inviteAdmin, isLoading } = useInviteAdmin();

  const canInvite =
    fullName.trim() !== "" &&
    email.trim() !== "" &&
    adminRole !== "" &&
    !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const [firstName, ...rest] = fullName.trim().split(/\s+/);

    try {
      await inviteAdmin({
        email: email.trim(),
        roleId: adminRole,
        firstName,
        lastName: rest.join(" "),
      });
      setFullName("");
      setEmail("");
      setAdminRole("");
    } catch {
      // useApiManager already toasted the error; keep the form filled
    }
  };

  // Handles [..], { data: [..] }, { data: { roles: [..] } }, { data: { data: [..] } }
  const roles: { id: string; name: string }[] = (() => {
    if (Array.isArray(rolesData)) return rolesData;
    const d = rolesData?.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.roles)) return d.roles;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.items)) return d.items;
    return [];
  })();

  const tabs = [
    { id: 'User Profile', label: 'User Profile', description: 'User Account Profile Settings', icon: User },
    { id: 'Admin Management', label: 'Admin Management', description: 'Admin Settings', icon: Shield },
    { id: 'Password', label: 'Password', description: 'Password Settings', icon: Lock },
    { id: 'General', label: 'General', description: 'General Settings', icon: SettingsIcon },
    { id: 'Company', label: 'Company', description: 'Platform Settings', icon: Building },
    { id: 'Email', label: 'Email', description: 'Email SMTP Settings', icon: Mail },
    { id: 'Payment', label: 'Payment', description: 'Payment Settings', icon: CreditCard },
    { id: 'Site SEO', label: 'Site SEO', description: 'Site SEO Settings', icon: Search },
  ];

  return (
    <div className="space-y-4">
      {/* Page Heading */}
      <h1
        className="text-2xl font-display font-semibold text-foreground"
        style={{ fontFamily: "Poppins", fontWeight: 600, color: "#393939" }}
      >
        Settings
      </h1>

      {/* Settings Layout */}
      <div className="flex gap-6">
        {/* Left Sidebar - Tabs */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-card rounded-lg overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  activeTab === tab.id ? "bg-[#FFF0F0]" : "hover:bg-muted"
                }`}
                style={{ fontFamily: "Poppins" }}
              >
                <div className="flex items-start gap-3">
                  <tab.icon
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      activeTab === tab.id ? "text-[#f30100]" : "text-gray-400"
                    }`}
                  />
                  <div className="flex-1">
                    <div
                      className={`text-sm font-medium ${
                        activeTab === tab.id ? "text-gray-900" : "text-gray-600"
                      }`}
                    >
                      {tab.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {tab.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1">
          {activeTab === "User Profile" && (
            <div
              className="bg-card border border-border rounded-lg p-6"
              style={{
                borderColor: "#e3e3e3",
                borderRadius: "12px",
                border: "none",
              }}
            >
               <ProfileTab />
              </div>
          )}

          {activeTab === "Admin Management" && (
            <form
              onSubmit={handleSubmit}
              className="bg-card border border-border rounded-lg p-6"
              style={{
                borderColor: "#e3e3e3",
                borderRadius: "12px",
                border: "none",
              }}
            >
              <div
                className="flex items-center gap-2 text-sm mb-6"
                style={{ fontFamily: "Poppins" }}
              >
                <span className="text-muted-foreground">Settings</span>
                <span className="text-muted-foreground">{">"}</span>
                <span
                  className="text-brand-text font-medium"
                  style={{ color: "#f30100" }}
                >
                  Admin Management
                </span>
              </div>

              <h2
                className="text-base font-medium mb-6"
                style={{ fontFamily: "Poppins", color: "#393939" }}
              >
                Add New Admin
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="invite-name"
                    className="block text-sm font-medium mb-2"
                    style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
                  >
                    Full Name
                  </label>
                  <input
                    id="invite-name"
                    type="text"
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-text/20"
                    style={{
                      fontFamily: "Poppins",
                      borderColor: "#e3e3e3",
                      height: "40px",
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="invite-email"
                    className="block text-sm font-medium mb-2"
                    style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
                  >
                    Email Address
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-text/20"
                    style={{
                      fontFamily: "Poppins",
                      borderColor: "#e3e3e3",
                      height: "40px",
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="invite-role"
                    className="block text-sm font-medium mb-2"
                    style={{ fontFamily: "Poppins", color: "#4c4c4c" }}
                  >
                    Admin Role
                  </label>
                  <div className="relative">
                    <select
                      id="invite-role"
                      value={adminRole}
                      onChange={(e) => setAdminRole(e.target.value)}
                      disabled={rolesLoading}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-text/20 appearance-none disabled:opacity-60"
                      style={{
                        fontFamily: "Poppins",
                        borderColor: "#e3e3e3",
                        height: "40px",
                      }}
                    >
                      <option value="">
                        {rolesLoading ? "Loading roles..." : "Select role..."}
                      </option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={!canInvite}
                  className="text-sm text-white transition-colors px-6 py-2 disabled:opacity-60"
                  style={{
                    fontFamily: "Poppins",
                    borderRadius: "8px",
                    backgroundColor: "#f30100",
                    border: "none",
                    height: "40px",
                  }}
                >
                  {isLoading ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          )}

          {activeTab !== "User Profile" && activeTab !== "Admin Management" && (
            <div
              className="bg-card border border-border rounded-lg p-6"
              style={{ borderColor: "#e3e3e3", borderRadius: "12px" }}
            >
              <p
                className="text-muted-foreground"
                style={{ fontFamily: "Poppins" }}
              >
                  {tabs.find((t) => t.id === activeTab)?.label} 
                  <PasswordTab />
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
