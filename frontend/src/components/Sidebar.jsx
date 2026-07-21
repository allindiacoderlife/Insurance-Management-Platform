import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CreditCard,
  FileText,
  FolderOpen,
  BarChart3,
  Shield,
  Sparkles,
  ArrowUpRight,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user } = useAuth();

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "AGENT", "CUSTOMER"] },
    { label: "Customers", path: "/customers", icon: Users, roles: ["ADMIN", "AGENT"] },
    { label: "Policies", path: "/policies", icon: ShieldCheck, roles: ["ADMIN", "AGENT", "CUSTOMER"] },
    { label: "Payments", path: "/payments", icon: CreditCard, roles: ["ADMIN", "AGENT", "CUSTOMER"] },
    { label: "Claims", path: "/claims", icon: FileText, roles: ["ADMIN", "AGENT", "CUSTOMER"] },
    { label: "Documents", path: "/documents", icon: FolderOpen, roles: ["ADMIN", "AGENT", "CUSTOMER"] },
    { label: "Reports", path: "/reports", icon: BarChart3, roles: ["ADMIN", "AGENT"] },
  ];

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(user?.role || "CUSTOMER")
  );

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden animate-fadeIn"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 w-64 bg-[#f7f8f4] h-screen lg:h-auto flex flex-col justify-between p-4 shrink-0 font-sans select-none transition-transform duration-300 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Top Dark Curved Brand Logo Header */}
          <div className="bg-[#0b281a] text-white p-5 rounded-3xl mb-6 flex items-center justify-between shadow-lg shadow-[#0b281a]/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold">
                <Shield className="w-5 h-5 fill-emerald-400/20" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-white block">
                  Havenix<span className="text-emerald-400">.</span>
                </span>
                <span className="text-[10px] text-emerald-300 font-semibold tracking-wider uppercase">
                  Insurance ERP
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-1.5 px-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-[#e2f5cf] text-[#0b281a] font-extrabold shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Promo Card */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm space-y-3 mt-6">
          <div className="w-10 h-10 rounded-2xl bg-[#e2f5cf] text-[#0b281a] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 mb-1">Grow your business</h4>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Get more policy leads & automate claims with smart tools.
            </p>
          </div>
          <Link
            to="/upgrade-plan"
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="w-full h-9 rounded-xl bg-[#0b281a] hover:bg-[#061d12] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Upgrade Plan</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          </Link>
        </div>
      </aside>
    </>
  );
};
