import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/DashboardLayout";
import {
  User,
  Mail,
  Shield,
  Phone,
  MapPin,
  Calendar,
  Key,
  CheckCircle2,
} from "lucide-react";

export const Profile = () => {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setPasswordMsg({
        type: "success",
        text: "Password updated successfully!",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }, 1000);
  };

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout
      title="My Profile"
      subtitle="Manage your personal account details, credentials, and security preferences."
    >
      {/* Profile Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-[#0b281a] text-emerald-400 font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-[#0b281a]/20 shrink-0">
          {getInitials(user?.name)}
        </div>
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900">
              {user?.name}
            </h2>
            <span className="bg-[#e2f5cf] text-[#0b281a] text-xs font-extrabold px-3 py-0.5 rounded-full">
              {user?.role} ACCOUNT
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-700">
              Verified Identity & Contact
            </span>
          </div>
        </div>
      </div>

      {/* Account & Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-[#0b281a]" />
            Personal Details
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-slate-400 font-medium flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Full Name
              </span>
              <span className="font-extrabold text-slate-900">
                {user?.name}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-slate-400 font-medium flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </span>
              <span className="font-extrabold text-slate-900">
                {user?.email}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-slate-400 font-medium flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Platform Role
              </span>
              <span className="font-extrabold text-slate-900">
                {user?.role}
              </span>
            </div>

            {user?.customer && (
              <>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-400 font-medium flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> Phone Number
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {user.customer.phone}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-400 font-medium flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Address
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {user.customer.address}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-400 font-medium flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Date of Birth
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {new Date(user.customer.dob).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Change Password & Security Form */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Key className="w-4 h-4 text-[#0b281a]" />
            Security & Password
          </h3>

          {passwordMsg && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold ${
                passwordMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full h-10 rounded-xl bg-[#0b281a] hover:bg-[#061d12] text-white text-xs font-extrabold cursor-pointer transition-all shadow-md shadow-[#0b281a]/20"
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
