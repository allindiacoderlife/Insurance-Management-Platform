import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordRequirements, getPasswordCriteria } from "../components/PasswordRequirements";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp || !newPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    const criteria = getPasswordCriteria(newPassword);
    if (!criteria.minLength) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await resetPassword(email, otp, newPassword);
      setSuccessMsg("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please check your OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter the 6-digit OTP code sent to your email and your new password."
      showSocial={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email Address */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 block pl-1">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium focus:bg-white focus:border-[#4A2B4B] outline-none"
          />
        </div>

        {/* 6-Digit OTP */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 block pl-1">
            6-Digit Reset OTP *
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="w-full h-11 px-4 text-center letter-spacing-4 tracking-widest text-lg font-bold rounded-xl border border-slate-200 bg-slate-50/50 text-[#4A2B4B] focus:bg-white focus:border-[#4A2B4B] outline-none"
          />
        </div>

        {/* New Password */}
        <div className="space-y-1 relative">
          <label className="text-xs font-semibold text-slate-600 block pl-1">
            New Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Create strong password"
              className="w-full h-11 pl-4 pr-11 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium focus:bg-white focus:border-[#4A2B4B] outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Real-time Password Conditions Indicator */}
          <PasswordRequirements password={newPassword} />
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 block pl-1">
            Confirm New Password *
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium focus:bg-white focus:border-[#4A2B4B] outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-2 rounded-xl bg-[#4A2B4B] hover:bg-[#391e3a] text-white font-bold text-sm shadow-md shadow-[#4A2B4B]/25 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Reset Password</span>
            </>
          )}
        </button>

        {/* Back Link */}
        <div className="text-center text-xs text-slate-500 font-medium pt-1">
          Back to{" "}
          <Link to="/login" className="font-bold text-[#4A2B4B] hover:underline cursor-pointer">
            Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
