import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/DashboardLayout";
import api from "../api/axios";
import {
  ShieldCheck,
  Building2,
  TrendingUp,
  IndianRupee,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { RevenueBarChart, PolicyDonutChart, ClaimApprovalGauge } from "../components/AnalyticsCharts";

export const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/reports/summary");
        setMetrics(res.data.data.metrics);
        setChartData(res.data.data.chartData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Insurance Dashboard" subtitle="Track performance, manage policies, and settle claims.">
        <div className="p-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0b281a]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Insurance Dashboard"
      subtitle="Track performance, manage policies, and close more policy deals."
    >
      {/* Date Filter Bar */}
      <div className="flex justify-end mb-2">
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-2xl text-xs font-bold text-slate-700 shadow-xs cursor-pointer">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>May 5 – May 11, 2026</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* KPI Metric Stat Cards matching UX mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Policies */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Policies</span>
            <div className="w-10 h-10 rounded-2xl bg-[#0b281a] text-white flex items-center justify-center font-bold shadow-md shadow-[#0b281a]/20">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {metrics?.totalPolicies?.toLocaleString() || "1,248"}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 12.4% vs last month</span>
          </div>
        </div>

        {/* Active Policies */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Active Policies</span>
            <div className="w-10 h-10 rounded-2xl bg-[#e2f5cf] text-[#0b281a] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {metrics?.activePolicies?.toLocaleString() || "328"}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 8.7% vs last month</span>
          </div>
        </div>

        {/* Claims Approved */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Claims Approved</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {metrics?.approvedClaims || "86"}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 15.3% vs last month</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            ₹{(metrics?.totalPremiumCollected || 2480000).toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 18.6% vs last month</span>
          </div>
        </div>
      </div>

      {/* Featured Policy Banner & Sales Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Featured Policy Card */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold text-slate-900">Featured Policy</span>
            <span className="bg-[#e2f5cf] text-[#0b281a] px-3 py-1 rounded-full text-[10px] font-bold">
              Active Offer
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden mb-4 group h-48">
            <img
              src="/auth_hero.png"
              alt="Policy Hero"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <p className="text-xs font-semibold opacity-80">Health Shield Super Plan</p>
              <p className="text-lg font-bold">Full Family Coverage</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <p className="text-xl font-extrabold text-slate-900">₹75,000 / yr</p>
              <p className="text-[11px] text-slate-400 font-medium">123 Green Valley, Cyber City</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-extrabold">
              For Sale
            </span>
          </div>
        </div>

        {/* Weekly Revenue Bar Chart Card */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-slate-900">Weekly Revenue Overview</span>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-xl">
              This Week
            </span>
          </div>

          <RevenueBarChart data={chartData} />
        </div>
      </div>

      {/* Market Overview Donut, Agent Activity, & Closing Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Market Overview Donut */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900">Policy Breakdown</span>
            <span className="text-xs font-bold text-[#0b281a] hover:underline cursor-pointer flex items-center gap-0.5">
              View Report <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>

          <PolicyDonutChart
            active={metrics?.activePolicies || 328}
            renewed={metrics?.renewedPolicies || 186}
            expired={metrics?.expiredPolicies || 112}
            cancelled={metrics?.cancelledPolicies || 45}
          />
        </div>

        {/* Agent Activity Feed */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900">Agent Activity</span>
            <span className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer">
              View All
            </span>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                  SM
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">Sophia Mitchell</p>
                  <p className="text-[11px] text-slate-400">Added a new customer policy</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400">10m ago</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">
                  EB
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">Ethan Brooks</p>
                  <p className="text-[11px] text-slate-400">Closed health claim #402</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400">1h ago</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-[10px]">
                  OB
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">Olivia Bennett</p>
                  <p className="text-[11px] text-slate-400">Verified identity documents</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400">2h ago</span>
            </div>
          </div>
        </div>

        {/* Claim Approval Progress Semicircular SVG Gauge */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-extrabold text-slate-900 mb-2">Claim Approval Progress</span>

          <ClaimApprovalGauge
            percentage={72}
            approved={metrics?.approvedClaims || 52}
            verifying={18}
            pending={metrics?.pendingClaims || 6}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};
