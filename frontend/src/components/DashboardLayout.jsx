import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  Search,
  Plus,
  Bell,
  LogOut,
  User,
  Settings,
  Sparkles,
  ChevronDown,
  Menu,
  ShieldCheck,
  FileText,
  CreditCard,
  FolderCheck,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const DashboardLayout = ({ children, title, subtitle, onAddNew }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const userId = user?.id || "guest";
  const readStorageKey = `havenix_read_notes_${userId}`;
  const clearedStorageKey = `havenix_cleared_notes_${userId}`;

  // Helper to load read IDs from localStorage
  const getStoredReadIds = () => {
    try {
      const stored = localStorage.getItem(readStorageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Helper to load cleared status from localStorage
  const isClearedAllStored = () => {
    return localStorage.getItem(clearedStorageKey) === "true";
  };

  // Notifications State
  const [notificationsList, setNotificationsList] = useState([]);

  // Fetch real policies & claims and synchronize with localStorage
  useEffect(() => {
    const fetchRealNotifications = async () => {
      // If user previously clicked Clear All, keep notification list empty
      if (isClearedAllStored()) {
        setNotificationsList([]);
        return;
      }

      try {
        const [policiesRes, claimsRes] = await Promise.allSettled([
          api.get("/policies?limit=3"),
          api.get("/claims?limit=3"),
        ]);

        const rawNotes = [];

        if (
          policiesRes.status === "fulfilled" &&
          policiesRes.value.data.data.policies
        ) {
          policiesRes.value.data.data.policies.forEach((p) => {
            rawNotes.push({
              id: `pol-${p.id}`,
              title: `Policy: ${p.policyNumber}`,
              desc: `${p.type} Policy (${p.status}) - ₹${p.premiumAmount.toLocaleString("en-IN")}/yr`,
              time: new Date(p.createdAt || Date.now()).toLocaleDateString(),
              type: "policy",
              read: false,
              link: "/policies",
            });
          });
        }

        if (
          claimsRes.status === "fulfilled" &&
          claimsRes.value.data.data.claims
        ) {
          claimsRes.value.data.data.claims.forEach((c) => {
            rawNotes.push({
              id: `claim-${c.id}`,
              title: `Claim #${c.claimNumber}`,
              desc: `Amount ₹${c.claimAmount.toLocaleString("en-IN")} - Status: ${c.status}`,
              time: new Date(c.incidentDate || Date.now()).toLocaleDateString(),
              type: "claim",
              read: false,
              link: "/claims",
            });
          });
        }

        // Fallback default notifications if database yields none
        const baseNotes =
          rawNotes.length > 0
            ? rawNotes
            : [
                {
                  id: "demo-1",
                  title: "Policy Expiration Alert",
                  desc: "Health Policy POL-202607-1001 renewal due in 15 days.",
                  time: "10m ago",
                  type: "policy",
                  read: false,
                  link: "/policies",
                },
                {
                  id: "demo-2",
                  title: "New Claim Submission",
                  desc: "Health claim #402 submitted requiring verification.",
                  time: "1h ago",
                  type: "claim",
                  read: false,
                  link: "/claims",
                },
                {
                  id: "demo-3",
                  title: "Premium Payment Received",
                  desc: "Payment of ₹25,000 received for policy POL-202607-1001.",
                  time: "3h ago",
                  type: "payment",
                  read: false,
                  link: "/payments",
                },
              ];

        // Apply persistent read state from localStorage
        const readIds = getStoredReadIds();
        const syncedNotes = baseNotes.map((n) => ({
          ...n,
          read: readIds.includes(n.id),
        }));

        setNotificationsList(syncedNotes);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    if (user) {
      fetchRealNotifications();
    }
  }, [user]);

  const unreadCount = notificationsList.filter((n) => !n.read).length;

  const markAllAsRead = (e) => {
    e.stopPropagation();
    const allIds = notificationsList.map((n) => n.id);
    localStorage.setItem(readStorageKey, JSON.stringify(allIds));
    localStorage.removeItem(clearedStorageKey);
    setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = (e) => {
    e.stopPropagation();
    localStorage.setItem(clearedStorageKey, "true");
    setNotificationsList([]);
  };

  const markSingleAsRead = (id, link) => {
    const currentReadIds = getStoredReadIds();
    if (!currentReadIds.includes(id)) {
      const updatedReadIds = [...currentReadIds, id];
      localStorage.setItem(readStorageKey, JSON.stringify(updatedReadIds));
    }

    setNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setShowNotifications(false);
    navigate(link);
  };

  const handleAddNewClick = () => {
    if (onAddNew) {
      onAddNew();
    } else {
      navigate("/policies?create=true");
    }
  };

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "policy":
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      case "claim":
        return <FileText className="w-4 h-4 text-amber-600" />;
      case "payment":
        return <CreditCard className="w-4 h-4 text-rose-600" />;
      case "document":
        return <FolderCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-[#0b281a]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f4] flex font-sans antialiased text-slate-900 selection:bg-[#0b281a] selection:text-white overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between bg-[#f7f8f4]/90 backdrop-blur-md border-b border-slate-200/50 gap-2">
          {/* Mobile Hamburger & Search Input */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Input on medium+ screens */}
            <div className="relative hidden md:block w-72 lg:w-96">
              <input
                type="text"
                placeholder="Search properties, policies, clients..."
                className="w-full h-10 lg:h-11 pl-10 pr-12 rounded-2xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0b281a]/10 focus:border-[#0b281a] transition-all shadow-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-100 text-slate-400 font-mono text-[10px] px-1.5 py-0.5 rounded-md border border-slate-200">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Add New Policy Button */}
            <button
              onClick={handleAddNewClick}
              className="h-9 sm:h-11 px-3 sm:px-5 rounded-2xl bg-[#0b281a] hover:bg-[#061d12] text-white font-extrabold text-xs shadow-md shadow-[#0b281a]/20 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Add New</span>
            </button>

            {/* Notification Bell Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center relative shadow-xs cursor-pointer transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"></span>
                )}
              </button>

              {/* Notification Center Popover */}
              {showNotifications && (
                <div className="absolute right-0 sm:right-0 -right-12 mt-2 w-80 sm:w-96 bg-white rounded-3xl p-4 shadow-2xl border border-slate-100 z-50 animate-fadeIn space-y-3 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="bg-[#e2f5cf] text-[#0b281a] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-bold text-[#0b281a] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mark read</span>
                        </button>
                      )}

                      {notificationsList.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear all</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notification Items */}
                  {notificationsList.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-semibold text-slate-400">
                        No notifications at this time
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notificationsList.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markSingleAsRead(n.id, n.link)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                            n.read
                              ? "bg-white border-slate-100 hover:bg-slate-50/80 opacity-75"
                              : "bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50/80 shadow-xs"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-xs">
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-extrabold text-slate-900">
                                {n.title}
                              </p>
                              <span className="text-[10px] font-semibold text-slate-400">
                                {n.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium leading-snug">
                              {n.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/activity");
                      }}
                      className="text-xs font-bold text-[#0b281a] hover:underline cursor-pointer"
                    >
                      View All Activity Logs &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1 rounded-2xl hover:bg-white/80 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-200/80 text-amber-900 font-extrabold flex items-center justify-center text-xs shadow-xs">
                  {getInitials(user?.name)}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-extrabold text-slate-900 leading-tight">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 capitalize">
                    {user?.role?.toLowerCase() || "Member"}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl p-3 shadow-xl border border-slate-100 z-50 animate-fadeIn space-y-1">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-extrabold text-slate-900">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Account Settings</span>
                  </Link>

                  <Link
                    to="/upgrade-plan"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Upgrade Plan</span>
                  </Link>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1400px] w-full mx-auto space-y-5 sm:space-y-6">
          {/* Page Title & Subtitle */}
          {(title || subtitle) && (
            <div className="mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
};
