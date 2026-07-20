import { Shield, CheckCircle2 } from "lucide-react";

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 md:p-8 font-sans antialiased selection:bg-[#4A2B4B] selection:text-white">
      {/* Outer Card Container */}
      <div className="w-full max-w-[1200px] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        
        {/* Left Form Container */}
        <div className="lg:col-span-6 p-8 sm:p-12 md:p-14 flex flex-col justify-between max-w-[540px] mx-auto w-full">
          
          {/* Top Header & Logo */}
          <div>
            {/* Brand Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3b233c] to-[#4A2B4B] flex items-center justify-center text-white shadow-md shadow-[#4A2B4B]/20">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-[#1e1b1e] tracking-tight">
                Havenix<span className="text-[#4A2B4B]">.</span>
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#181219] tracking-tight mb-2">
                {title}
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Form Content Body */}
          <div className="w-full">{children}</div>

          {/* Footer note */}
          <div className="mt-8 text-center text-xs text-slate-400">
            &copy; 2026 Havenix Insurance Platform. Secure & Encrypted.
          </div>
        </div>

        {/* Right Hero Visual Banner matching mockup */}
        <div className="hidden lg:block lg:col-span-6 p-4">
          <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-inner bg-slate-900 flex flex-col justify-between p-10">
            {/* Background Image */}
            <img
              src="/auth_hero.png"
              alt="Insurance Platform Architecture Hero"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-90 transition-transform duration-700 hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent"></div>

            {/* Top Badge */}
            <div className="relative z-10 self-end">
              <span className="backdrop-blur-md bg-white/20 text-white border border-white/30 text-xs font-medium px-4 py-2 rounded-full inline-flex items-center gap-2 shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Trusted by 50,000+ Customers
              </span>
            </div>

            {/* Bottom Overlay Card with Text */}
            <div className="relative z-10 max-w-md text-white">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 leading-snug">
                Browse thousands of policies to buy, renew, or claim with trusted agents.
              </h2>
              <p className="text-slate-200 text-sm leading-relaxed opacity-90">
                Centralized, transparent, and hassle-free insurance management for customers, agents, and administrators.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
