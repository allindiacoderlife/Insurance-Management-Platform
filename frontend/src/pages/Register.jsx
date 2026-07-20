import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordRequirements, getPasswordCriteria } from "../components/PasswordRequirements";

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
    phone: "",
    address: "",
    dob: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    // Check Password Conditions
    const criteria = getPasswordCriteria(formData.password);
    if (!criteria.minLength) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(formData);
      // Navigate to OTP verification page
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      setError(err.message || "Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Havenix Insurance Platform to manage policies & claims."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 block pl-1">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium focus:bg-white focus:border-[#4A2B4B] focus:ring-4 focus:ring-[#4A2B4B]/10 outline-none transition-all"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 block pl-1">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium focus:bg-white focus:border-[#4A2B4B] focus:ring-4 focus:ring-[#4A2B4B]/10 outline-none transition-all"
          />
        </div>

        {/* Password */}
        <div className="space-y-1 relative">
          <label className="text-xs font-semibold text-slate-600 block pl-1">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Create strong password"
              className="w-full h-11 pl-4 pr-11 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium focus:bg-white focus:border-[#4A2B4B] focus:ring-4 focus:ring-[#4A2B4B]/10 outline-none transition-all"
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
          <PasswordRequirements password={formData.password} />
        </div>

        {/* User Role Selection */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 block pl-1">
            Account Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium focus:bg-white focus:border-[#4A2B4B] focus:ring-4 focus:ring-[#4A2B4B]/10 outline-none transition-all cursor-pointer"
          >
            <option value="CUSTOMER">Customer (Policy Holder)</option>
            <option value="AGENT">Insurance Agent</option>
            <option value="ADMIN">System Administrator</option>
          </select>
        </div>

        {/* Additional Customer Fields if Role === CUSTOMER */}
        {formData.role === "CUSTOMER" && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block pl-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-medium focus:bg-white focus:border-[#4A2B4B] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block pl-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-medium focus:bg-white focus:border-[#4A2B4B] outline-none"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 mt-3 rounded-xl bg-[#4A2B4B] hover:bg-[#391e3a] text-white font-bold text-sm shadow-md shadow-[#4A2B4B]/25 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Sign Up</span>
          )}
        </button>

        {/* Footer Link */}
        <div className="text-center pt-2 text-xs text-slate-500 font-medium">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-[#4A2B4B] hover:underline cursor-pointer ml-1"
          >
            Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
