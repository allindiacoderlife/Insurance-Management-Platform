import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/AuthLayout";

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await forgotPassword(email);
      // Navigate to Reset Password page with email prefilled
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(
        err.message || "Failed to send reset OTP. Please check your email.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your registered email address to receive a 6-digit reset OTP code."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 block pl-1">
            Registered Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-semibold focus:bg-white focus:border-[#0b281a] focus:ring-4 focus:ring-[#0b281a]/10 outline-none transition-all"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-[#0b281a] hover:bg-[#061d12] text-white font-extrabold text-xs shadow-md shadow-[#0b281a]/25 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Reset OTP...</span>
            </>
          ) : (
            <>
              <span>Send Reset OTP</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Back Link */}
        <div className="text-center text-xs text-slate-500 font-medium pt-2">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="font-bold text-[#0b281a] hover:underline cursor-pointer ml-1"
          >
            Back to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
