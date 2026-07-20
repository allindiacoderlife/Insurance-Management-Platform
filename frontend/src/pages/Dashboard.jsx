import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  MailCheck,
  User,
  Phone,
  MapPin,
  Calendar,
  ShieldAlert,
  Users,
  CreditCard,
  FileText,
  FolderOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout
      title="Dashboard Overview"
      subtitle="Welcome back to Havenix Insurance Platform."
    >
      {/* Email Verification Banner if not verified */}
      {!user?.isEmailVerified && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold">Email Not Verified</p>
              <p className="text-xs text-amber-700">
                Please verify your email address to unlock full insurance policy
                management.
              </p>
            </div>
          </div>
          <Link
            to="/verify-otp"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Verify Email Now
          </Link>
        </div>
      )}

      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-[#4A2B4B] to-[#2B172C] rounded-3xl p-8 text-white shadow-xl shadow-[#4A2B4B]/10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3 tracking-wide">
            {user?.role} DASHBOARD
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-slate-200 text-sm leading-relaxed opacity-90">
            Manage your insurance policies, submit claim requests, track premium
            payments, and view uploaded documents.
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(user?.role === "ADMIN" || user?.role === "AGENT") && (
          <Link
            to="/customers"
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#4A2B4B] hover:shadow-md transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#4A2B4B] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="font-bold text-slate-800 text-xs">Customers</span>
          </Link>
        )}

        <Link
          to="/policies"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#4A2B4B] hover:shadow-md transition-all flex flex-col items-center text-center gap-2 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-800 text-xs">Policies</span>
        </Link>

        <Link
          to="/payments"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#4A2B4B] hover:shadow-md transition-all flex flex-col items-center text-center gap-2 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-800 text-xs">Payments</span>
        </Link>

        <Link
          to="/claims"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#4A2B4B] hover:shadow-md transition-all flex flex-col items-center text-center gap-2 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-800 text-xs">Claims</span>
        </Link>
      </div>

      {/* User Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-[#4A2B4B]" />
              Account Overview
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#4A2B4B]/10 text-[#4A2B4B]">
              {user?.role}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">User ID</span>
              <span className="font-mono text-slate-700 font-semibold truncate max-w-[140px]">
                {user?.id}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Email Address</span>
              <span className="font-semibold text-slate-800">
                {user?.email}
              </span>
            </div>
            <div className="flex justify-between py-1 items-center">
              <span className="text-slate-500 font-medium">Email Status</span>
              {user?.isEmailVerified ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                  <MailCheck className="w-3 h-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                  Unverified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Customer Profile if present */}
        {user?.customer && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 md:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4A2B4B]" />
                Customer Profile
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                Policy Holder
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-slate-400 font-medium flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone
                </p>
                <p className="font-bold text-slate-800">
                  {user.customer.phone}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-slate-400 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Address
                </p>
                <p className="font-bold text-slate-800">
                  {user.customer.address}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Date of Birth
                </p>
                <p className="font-bold text-slate-800">
                  {new Date(user.customer.dob).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
