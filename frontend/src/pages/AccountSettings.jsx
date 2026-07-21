import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/DashboardLayout";
import { Settings, Bell, Shield, Globe, Save } from "lucide-react";

export const AccountSettings = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    emailRenewals: true,
    claimStatusAlerts: true,
    paymentReminders: true,
    weeklyReportSummary: false,
  });
  const [currency, setCurrency] = useState("INR");

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout title="Account Settings" subtitle="Configure system preferences, notification alerts, and platform currency settings.">
      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fadeIn">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Notification Preferences */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-[#0b281a]" />
            Notification Preferences
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900">Policy Renewal Email Reminders</p>
                <p className="text-[11px] text-slate-500 font-medium">Receive email notifications 30 days before policy expiration</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailRenewals}
                onChange={(e) => setNotifications({ ...notifications, emailRenewals: e.target.checked })}
                className="w-4 h-4 text-[#0b281a] rounded-md focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900">Claim Approval Alerts</p>
                <p className="text-[11px] text-slate-500 font-medium">Get instant status updates when claims are verified or approved</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.claimStatusAlerts}
                onChange={(e) => setNotifications({ ...notifications, claimStatusAlerts: e.target.checked })}
                className="w-4 h-4 text-[#0b281a] rounded-md focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900">Premium Payment Reminders</p>
                <p className="text-[11px] text-slate-500 font-medium">Receive alerts for overdue premium payments</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.paymentReminders}
                onChange={(e) => setNotifications({ ...notifications, paymentReminders: e.target.checked })}
                className="w-4 h-4 text-[#0b281a] rounded-md focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900">Weekly Analytics Report</p>
                <p className="text-[11px] text-slate-500 font-medium">Receive a weekly summary email of policy performance</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.weeklyReportSummary}
                onChange={(e) => setNotifications({ ...notifications, weeklyReportSummary: e.target.checked })}
                className="w-4 h-4 text-[#0b281a] rounded-md focus:ring-0"
              />
            </label>
          </div>
        </div>

        {/* Currency & Regional Preferences */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-[#0b281a]" />
            Regional & Display Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Display Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Timezone</label>
              <select
                defaultValue="Asia/Kolkata"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
              >
                <option value="Asia/Kolkata">IST (GMT +5:30) - New Delhi</option>
                <option value="UTC">UTC (GMT +0:00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Changes CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="h-11 px-6 rounded-2xl bg-[#0b281a] hover:bg-[#061d12] text-white font-extrabold text-xs shadow-md shadow-[#0b281a]/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};
