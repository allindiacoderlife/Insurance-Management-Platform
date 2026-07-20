import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CreditCard,
  FileText,
  FolderOpen,
  BarChart3,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "AGENT", "CUSTOMER"] },
    { label: "Customers", path: "/customers", icon: Users, roles: ["ADMIN", "AGENT"] },
    { label: "Policies", path: "/policies", icon: ShieldCheck, roles: ["ADMIN", "AGENT", "CUSTOMER"] },
    { label: "Payments", path: "/payments", icon: CreditCard, roles: ["ADMIN", "AGENT", "CUSTOMER"] },
    { label: "Claims", path: "/claims", icon: FileText, roles: ["ADMIN", "AGENT", "CUSTOMER"] },
    { label: "Documents", path: "/documents", icon: FolderOpen, roles: ["ADMIN", "AGENT", "CUSTOMER"] },
    { label: "Reports & Analytics", path: "/reports", icon: BarChart3, roles: ["ADMIN", "AGENT"] },
  ];

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(user?.role || "CUSTOMER")
  );

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between p-4 border-r border-slate-800 shadow-xl shrink-0">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3b233c] to-[#4A2B4B] flex items-center justify-center text-white font-bold shadow-md shadow-[#4A2B4B]/30">
            <Shield className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Havenix<span className="text-purple-400">.</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                    isActive
                      ? "bg-[#4A2B4B] text-white font-bold shadow-md shadow-[#4A2B4B]/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
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

      {/* Role Footer */}
      <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
        <div>
          <p className="font-semibold text-slate-300 truncate max-w-[130px]">{user?.name}</p>
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
            {user?.role}
          </span>
        </div>
      </div>
    </aside>
  );
};
