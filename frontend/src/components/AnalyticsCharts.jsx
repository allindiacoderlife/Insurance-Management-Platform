import { useState } from "react";

// Monthly Premium Revenue Bar Chart Component
export const RevenueBarChart = ({ data = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-slate-400 font-medium">
        No monthly revenue data available.
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount), 1000);

  return (
    <div className="space-y-4">
      {/* Chart SVG Canvas */}
      <div className="relative h-60 w-full pt-6 pb-2 flex items-end justify-between gap-2 px-2 border-b border-slate-100">
        {data.map((item, idx) => {
          const heightPercent = Math.max((item.amount / maxAmount) * 100, 8);
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Hover Tooltip */}
              {isHovered && (
                <div className="absolute -top-10 z-20 bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xl animate-fadeIn whitespace-nowrap">
                  {item.month}: ₹{item.amount.toLocaleString("en-IN")}
                </div>
              )}

              {/* Animated Bar */}
              <div
                className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                  isHovered
                    ? "bg-gradient-to-t from-[#061d12] to-[#0b281a] shadow-lg shadow-[#0b281a]/30 scale-x-105"
                    : "bg-gradient-to-t from-[#0b281a] to-[#15803d] opacity-90"
                }`}
                style={{ height: `${heightPercent}%` }}
              ></div>
            </div>
          );
        })}
      </div>

      {/* X-Axis Month Labels */}
      <div className="flex justify-between px-2 text-[11px] font-bold text-slate-400">
        {data.map((item, idx) => (
          <span
            key={idx}
            className={`flex-1 text-center truncate ${
              hoveredIndex === idx ? "text-[#0b281a] font-extrabold" : ""
            }`}
          >
            {item.month}
          </span>
        ))}
      </div>
    </div>
  );
};

// Donut Chart Component for Policy Breakdown
export const PolicyDonutChart = ({
  active = 0,
  renewed = 0,
  expired = 0,
  cancelled = 0,
}) => {
  const total = active + renewed + expired + cancelled || 1;

  const items = [
    { label: "Active", value: active, color: "#10b981", bg: "bg-emerald-500" },
    { label: "Renewed", value: renewed, color: "#a855f7", bg: "bg-purple-500" },
    { label: "Expired", value: expired, color: "#f59e0b", bg: "bg-amber-500" },
    {
      label: "Cancelled",
      value: cancelled,
      color: "#f43f5e",
      bg: "bg-rose-500",
    },
  ];

  // SVG Conic Gradient Segments calculation
  let cumulativeAngle = 0;
  const strokeWidth = 24;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* SVG Donut Visual */}
      <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full transform -rotate-90"
        >
          {items.map((item, idx) => {
            const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativeAngle;
            cumulativeAngle += (item.value / total) * circumference;

            return (
              <circle
                key={idx}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 hover:opacity-80 cursor-pointer"
              />
            );
          })}
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-extrabold text-slate-900">
            {total}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Policies
          </span>
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="flex-1 space-y-2.5 w-full">
        {items.map((item, idx) => {
          const percent = Math.round((item.value / total) * 100);
          return (
            <div
              key={idx}
              className="flex items-center justify-between text-xs font-semibold text-slate-700"
            >
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${item.bg}`}></span>
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">{item.value}</span>
                <span className="font-extrabold text-slate-900 w-10 text-right">
                  {percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Semicircular SVG Gauge Chart Component for Claim Approval Progress
export const ClaimApprovalGauge = ({
  percentage = 72,
  approved = 52,
  verifying = 18,
  pending = 6,
}) => {
  const radius = 60;
  const circumference = Math.PI * radius; // Half-circle circumference (~188.5)
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-between h-full space-y-4">
      {/* Semicircular SVG Canvas */}
      <div className="relative w-48 h-28 flex items-end justify-center pt-2">
        <svg viewBox="0 0 160 90" className="w-full h-full">
          {/* Background Arc */}
          <path
            d="M 20 80 A 60 60 0 0 1 140 80"
            fill="none"
            stroke="#e2f5cf"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Foreground Animated Arc */}
          <path
            d="M 20 80 A 60 60 0 0 1 140 80"
            fill="none"
            stroke="#0b281a"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Percentage & Label */}
        <div className="absolute bottom-1 flex flex-col items-center text-center">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
            {percentage}%
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Approved Rate
          </span>
        </div>
      </div>

      {/* Details Breakdown */}
      <div className="w-full space-y-1.5 text-xs border-t border-slate-100 pt-3">
        <div className="flex justify-between font-semibold">
          <span className="text-slate-500 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0b281a]"></span>{" "}
            Approved
          </span>
          <span className="font-bold text-slate-900">{approved}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span className="text-slate-500 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> In
            Verification
          </span>
          <span className="font-bold text-slate-900">{verifying}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span className="text-slate-500 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>{" "}
            Pending
          </span>
          <span className="font-bold text-slate-900">{pending}</span>
        </div>
      </div>
    </div>
  );
};
