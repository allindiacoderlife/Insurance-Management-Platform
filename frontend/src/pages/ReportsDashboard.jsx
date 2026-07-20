import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import api from "../api/axios";
import { BarChart3, Users, ShieldCheck, DollarSign, FileText, Printer, Loader2, TrendingUp } from "lucide-react";

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
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Revenue</p>
            <p className="text-2xl font-extrabold text-slate-900">${(metrics?.totalPremiumCollected || 0).toFixed(2)}</p>
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

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Policy Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#4A2B4B]" />
            Policy Distribution
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Active ({metrics?.activePolicies || 0})</span>
                <span className="text-emerald-600 font-bold">
                  {metrics?.totalPolicies ? Math.round((metrics.activePolicies / metrics.totalPolicies) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${metrics?.totalPolicies ? (metrics.activePolicies / metrics.totalPolicies) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Renewed ({metrics?.renewedPolicies || 0})</span>
                <span className="text-purple-600 font-bold">
                  {metrics?.totalPolicies ? Math.round((metrics.renewedPolicies / metrics.totalPolicies) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${metrics?.totalPolicies ? (metrics.renewedPolicies / metrics.totalPolicies) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Expired ({metrics?.expiredPolicies || 0})</span>
                <span className="text-amber-600 font-bold">
                  {metrics?.totalPolicies ? Math.round((metrics.expiredPolicies / metrics.totalPolicies) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${metrics?.totalPolicies ? (metrics.expiredPolicies / metrics.totalPolicies) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Claim Statistics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#4A2B4B]" />
            Claim Lifecycle Statistics
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Approved ({metrics?.approvedClaims || 0})</span>
                <span className="text-emerald-600 font-bold">
                  {metrics?.totalClaims ? Math.round((metrics.approvedClaims / metrics.totalClaims) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${metrics?.totalClaims ? (metrics.approvedClaims / metrics.totalClaims) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Pending Review ({metrics?.pendingClaims || 0})</span>
                <span className="text-amber-600 font-bold">
                  {metrics?.totalClaims ? Math.round((metrics.pendingClaims / metrics.totalClaims) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${metrics?.totalClaims ? (metrics.pendingClaims / metrics.totalClaims) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Rejected ({metrics?.rejectedClaims || 0})</span>
                <span className="text-rose-600 font-bold">
                  {metrics?.totalClaims ? Math.round((metrics.rejectedClaims / metrics.totalClaims) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${metrics?.totalClaims ? (metrics.rejectedClaims / metrics.totalClaims) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
