import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import api from "../api/axios";
import { BarChart3, Users, ShieldCheck, IndianRupee, FileText, Printer, Loader2, TrendingUp, PieChart } from "lucide-react";
import { RevenueBarChart, PolicyDonutChart } from "../components/AnalyticsCharts";

export const ReportsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout title="Reports & Analytics" subtitle="Business summary and insurance metrics.">
        <div className="p-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#4A2B4B]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Reports & Analytics" subtitle="Real-time business performance, policy distribution, and premium collections.">
      {/* Print / Export Report Header */}
      <div className="flex justify-end">
        <button
          onClick={handlePrint}
          className="h-10 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer hover:bg-slate-800"
        >
          <Printer className="w-4 h-4" />
          <span>Export / Print Report</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#4A2B4B] flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Customers</p>
            <p className="text-2xl font-extrabold text-slate-900">{metrics?.totalCustomers || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Active Policies</p>
            <p className="text-2xl font-extrabold text-slate-900">{metrics?.activePolicies || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Revenue</p>
            <p className="text-2xl font-extrabold text-slate-900">₹{(metrics?.totalPremiumCollected || 0).toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Pending Claims</p>
            <p className="text-2xl font-extrabold text-slate-900">{metrics?.pendingClaims || 0}</p>
          </div>
        </div>
      </div>

      {/* Interactive Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#4A2B4B]" />
              Monthly Premium Revenue (₹)
            </h3>
            <span className="text-xs font-semibold text-slate-400">2026 Collection</span>
          </div>

          <RevenueBarChart data={chartData} />
        </div>

        {/* Policy Distribution Donut Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#4A2B4B]" />
              Policy Distribution
            </h3>
            <span className="text-xs font-semibold text-slate-400">Status Breakdown</span>
          </div>

          <PolicyDonutChart
            active={metrics?.activePolicies || 0}
            renewed={metrics?.renewedPolicies || 0}
            expired={metrics?.expiredPolicies || 0}
            cancelled={metrics?.cancelledPolicies || 0}
          />
        </div>
      </div>

      {/* Claim Lifecycle Statistics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#4A2B4B]" />
          Claim Lifecycle Statistics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1">
            <p className="text-emerald-700 font-bold">Approved Claims</p>
            <p className="text-2xl font-extrabold text-emerald-900">{metrics?.approvedClaims || 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 space-y-1">
            <p className="text-amber-700 font-bold">Pending Review</p>
            <p className="text-2xl font-extrabold text-amber-900">{metrics?.pendingClaims || 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 space-y-1">
            <p className="text-rose-700 font-bold">Rejected Claims</p>
            <p className="text-2xl font-extrabold text-rose-900">{metrics?.rejectedClaims || 0}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
