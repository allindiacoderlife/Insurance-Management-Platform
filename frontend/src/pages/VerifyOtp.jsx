import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { KeyRound, Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/AuthLayout";

export const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp, user } = useAuth();

  const targetEmail = location.state?.email || user?.email || "";
  const mode = location.state?.mode || "verification";
  const [email, setEmail] = useState(targetEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const inputRefs = useRef([]);

  // Countdown timer effect
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to next input box if typed
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    if (!email) {
      setError("Email address is missing.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await verifyOtp(email, otpCode);
      setSuccessMsg("Verification successful! Opening Dashboard...");
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !email) return;

    setResending(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await resendOtp(email);
      setSuccessMsg("A new 6-digit OTP has been sent to your email.");
      setTimer(60);
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title={mode === "login" ? "Login OTP Verification" : "Verify Email OTP"}
      subtitle={`We have sent a 6-digit security code to ${email || "your email"}. Enter code to open dashboard.`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email Input if not provided */}
        {!targetEmail && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block pl-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-semibold focus:bg-white focus:border-[#0b281a] outline-none"
            />
          </div>
        )}

        {/* 6-Digit OTP Boxes */}
        <div>
          <label className="text-xs font-semibold text-slate-600 block pl-1 mb-3 text-center">
            Enter 6-Digit Verification Code
          </label>
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-extrabold text-[#0b281a] rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#0b281a] focus:ring-4 focus:ring-[#0b281a]/15 outline-none transition-all"
              />
            ))}
          </div>
        </div>

        {/* Resend OTP Timer */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Didn't receive code?</span>
          {timer > 0 ? (
            <span className="text-slate-400 font-semibold">Resend in {timer}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-bold text-[#0b281a] hover:underline cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {resending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>Resend OTP</span>
            </button>
          )}
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={loading || otp.join("").length !== 6}
          className="w-full h-12 rounded-xl bg-[#0b281a] hover:bg-[#061d12] text-white font-extrabold text-xs shadow-md shadow-[#0b281a]/25 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              <span>Verify & Continue to Dashboard</span>
            </>
          )}
        </button>

        {/* Return link */}
        <div className="text-center text-xs text-slate-500 font-medium">
          Back to{" "}
          <Link to="/login" className="font-bold text-[#0b281a] hover:underline">
            Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
