import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/AuthLayout";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.message || "Failed to login. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Let's login to grab amazing deal and manage your policies."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 block pl-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rownok@gmail.com"
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium focus:bg-white focus:border-[#4A2B4B] focus:ring-4 focus:ring-[#4A2B4B]/10 outline-none transition-all duration-200"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1 relative">
          <label className="text-xs font-semibold text-slate-600 block pl-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-12 pl-4 pr-11 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium focus:bg-white focus:border-[#4A2B4B] focus:ring-4 focus:ring-[#4A2B4B]/10 outline-none transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#4A2B4B] focus:ring-[#4A2B4B]/20 cursor-pointer accent-[#4A2B4B]"
            />
            <span>Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="font-bold text-[#4A2B4B] hover:underline cursor-pointer transition-all"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit CTA Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-2 rounded-xl bg-[#4A2B4B] hover:bg-[#391e3a] text-white font-bold text-sm shadow-md shadow-[#4A2B4B]/25 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Login</span>
          )}
        </button>

        {/* Sign Up Navigation link */}
        <div className="text-center pt-3 text-xs text-slate-500 font-medium">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-[#4A2B4B] hover:underline cursor-pointer ml-1"
          >
            Sign Up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
