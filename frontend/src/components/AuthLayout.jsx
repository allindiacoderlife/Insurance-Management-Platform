import { Shield, CheckCircle2, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const AuthLayout = ({ children, title, subtitle }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full bg-[#f7f8f4] dark:bg-[#080e18] flex items-center justify-center p-4 md:p-8 font-sans antialiased selection:bg-[#0b281a] selection:text-white transition-colors duration-300">
      {/* Outer Card Container */}
      <div className="w-full max-w-[1200px] bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/60 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        {/* Left Form Container */}
        <div className="lg:col-span-6 p-6 sm:p-12 md:p-14 flex flex-col justify-between max-w-[540px] mx-auto w-full">
          {/* Top Header & Logo */}
          <div>
            {/* Brand Logo & Theme Toggle */}
            <div className="flex items-center justify-between gap-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0b281a] dark:bg-emerald-600 flex items-center justify-center text-emerald-400 dark:text-white shadow-md shadow-[#0b281a]/20">
                  <Shield className="w-5 h-5 fill-emerald-400/20" />
                </div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Havenix<span className="text-emerald-500">.</span>
                </span>
              </div>

              {/* Theme Switcher Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800 text-amber-500 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-all"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                {title}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Form Content Body */}
          <div className="w-full">{children}</div>

          {/* Footer note */}
          <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold">
            &copy; 2026 Havenix Insurance Platform. Enterprise Encryption.
          </div>
        </div>

        {/* Right Hero Visual Banner matching mockup */}
        <div className="hidden lg:block lg:col-span-6 p-4">
          <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-inner bg-[#0b281a] dark:bg-slate-950 flex flex-col justify-between p-10">
            {/* Background Image */}
            <img
              src="/auth_hero.png"
              alt="Insurance Platform Architecture Hero"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-85 transition-transform duration-700 hover:scale-105"
            />
            {/* Dark Forest Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#061d12] via-[#0b281a]/60 to-transparent dark:from-slate-950 dark:via-slate-900/80"></div>

            {/* Top Badge */}
            <div className="relative z-10 self-end">
              <span className="backdrop-blur-md bg-white/20 text-white border border-white/30 text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2 shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Trusted by 50,000+ Policy Holders
              </span>
            </div>

            {/* Bottom Overlay Card with Text */}
            <div className="relative z-10 max-w-md text-white">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 leading-snug">
                Browse thousands of policies to buy, renew, or claim with trusted agents.
              </h2>
              <p className="text-slate-200 text-xs font-medium leading-relaxed opacity-90">
                Centralized, transparent, and hassle-free insurance management for customers, agents, and administrators.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
