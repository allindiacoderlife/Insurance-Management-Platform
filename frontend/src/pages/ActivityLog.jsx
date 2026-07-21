import { useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Activity, ShieldCheck, FileText, CreditCard, UserCheck, Search, Filter } from "lucide-react";

export const ActivityLog = () => {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const activities = [
    {
      id: 1,
      user: "Sophia Mitchell",
      role: "AGENT",
      action: "Created Policy",
      details: "Issued Auto Insurance policy POL-202607-1002 for Chirag Saxena (₹18,000)",
      time: "10m ago",
      timestamp: "2026-07-21 11:20 AM",
      type: "POLICY",
    },
    {
      id: 2,
      user: "Ethan Brooks",
      role: "AGENT",
      action: "Approved Claim",
      details: "Approved Health Insurance claim #402 for ₹85,000",
      time: "1h ago",
      timestamp: "2026-07-21 10:30 AM",
      type: "CLAIM",
    },
    {
      id: 3,
      user: "Olivia Bennett",
      role: "ADMIN",
      action: "Verified Document",
      details: "Verified Aadhaar ID & Pan Card documents for Rahul Sharma",
      time: "2h ago",
      timestamp: "2026-07-21 09:15 AM",
      type: "DOCUMENT",
    },
    {
      id: 4,
      user: "Chirag Saxena",
      role: "CUSTOMER",
      action: "Recorded Payment",
      details: "Paid premium installment of ₹25,000 for Health Policy POL-202607-1001",
      time: "3h ago",
      timestamp: "2026-07-21 08:45 AM",
      type: "PAYMENT",
    },
    {
      id: 5,
      user: "Sophia Mitchell",
      role: "AGENT",
      action: "Renewed Policy",
      details: "Renewed Property Insurance policy POL-202607-1000 till July 2027",
      time: "5h ago",
      timestamp: "2026-07-21 06:30 AM",
      type: "POLICY",
    },
    {
      id: 6,
      user: "System Administrator",
      role: "ADMIN",
      action: "Security Login",
      details: "Authenticated via 6-digit OTP from IP 192.168.1.45",
      time: "1d ago",
      timestamp: "2026-07-20 04:15 PM",
      type: "AUTH",
    },
  ];

  const filteredActivities = activities.filter((act) => {
    const matchesFilter = filter === "ALL" || act.type === filter;
    const matchesSearch =
      act.user.toLowerCase().includes(search.toLowerCase()) ||
      act.details.toLowerCase().includes(search.toLowerCase()) ||
      act.action.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActionIcon = (type) => {
    switch (type) {
      case "POLICY":
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      case "CLAIM":
        return <FileText className="w-4 h-4 text-amber-600" />;
      case "PAYMENT":
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case "DOCUMENT":
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "POLICY":
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-extrabold">POLICY</span>;
      case "CLAIM":
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold">CLAIM</span>;
      case "PAYMENT":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">PAYMENT</span>;
      case "DOCUMENT":
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold">DOCUMENT</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold">SYSTEM</span>;
    }
  };

  return (
    <DashboardLayout title="Activity Logs & Audit Trail" subtitle="Real-time timeline of agent actions, policy creations, and claim updates.">
      {/* Control Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/60 shadow-xs">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
          {["ALL", "POLICY", "CLAIM", "PAYMENT", "DOCUMENT", "AUTH"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filter === type ? "bg-white text-[#0b281a] shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 md:w-72">
          <input
            type="text"
            placeholder="Search activity by agent or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-2xl border border-slate-200/80 bg-slate-50 text-xs font-semibold focus:bg-white focus:border-[#0b281a] outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-semibold text-xs">
            No activity logs match your filter criteria.
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-100">
            {filteredActivities.map((act) => (
              <div key={act.id} className="relative flex items-start gap-4 pl-2">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 z-10 shadow-xs">
                  {getActionIcon(act.type)}
                </div>

                <div className="flex-1 bg-slate-50/60 p-4 rounded-2xl border border-slate-100/80 space-y-1 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{act.user}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">({act.role})</span>
                      {getTypeBadge(act.type)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{act.timestamp}</span>
                  </div>

                  <p className="text-xs font-bold text-slate-800">{act.action}</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{act.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
