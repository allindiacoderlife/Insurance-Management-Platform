import { useAuth } from "../context/AuthContext";
import { LogOut, ShieldCheck, MailCheck, User, Phone, MapPin, Calendar, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

export const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4A2B4B] text-white flex items-center justify-center font-bold">
              H
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              Havenix <span className="text-[#4A2B4B] text-xs px-2 py-0.5 rounded-full bg-[#4A2B4B]/10">Platform</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{user?.name}</p>
              <p className="text-[11px] text-slate-500">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="h-9 px-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Email Verification Banner if not verified */}
        {!user?.isEmailVerified && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold">Email Not Verified</p>
                <p className="text-xs text-amber-700">Please verify your email address to unlock full insurance policy management.</p>
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

        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#4A2B4B] to-[#2B172C] rounded-3xl p-8 text-white shadow-xl shadow-[#4A2B4B]/10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3 tracking-wide">
              {user?.role} DASHBOARD
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Welcome, {user?.name}!
            </h1>
            <p className="text-slate-200 text-sm leading-relaxed opacity-90">
              Manage your insurance policies, submit claim requests, track premium payments, and view uploaded documents.
            </p>
          </div>
        </div>

        {/* User Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Account Card */}
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
                <span className="font-mono text-slate-700 font-semibold truncate max-w-[140px]">{user?.id}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Email Address</span>
                <span className="font-semibold text-slate-800">{user?.email}</span>
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

          {/* Customer Details Card if present */}
          {user?.customer && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 md:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#4A2B4B]" />
                  Customer Profile
                </h3>
                <span className="text-xs font-semibold text-slate-400">Policy Holder</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <p className="text-slate-400 font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </p>
                  <p className="font-bold text-slate-800">{user.customer.phone}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <p className="text-slate-400 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Address
                  </p>
                  <p className="font-bold text-slate-800">{user.customer.address}</p>
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
      </main>
    </div>
  );
};
