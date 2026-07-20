import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import api from "../api/axios";
import { CreditCard, Plus, Search, Loader2, DollarSign, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const PaymentList = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    policyId: "",
    amount: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentStatus: "PAID",
  });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/payments?paymentStatus=${statusFilter}&search=${search}`);
      setPayments(res.data.data.payments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPoliciesList = async () => {
    try {
      const res = await api.get("/policies?limit=100");
      setPolicies(res.data.data.policies);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, search]);

  useEffect(() => {
    fetchPoliciesList();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/payments", {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setShowModal(false);
      fetchPayments();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">PAID</span>;
      case "PENDING":
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">PENDING</span>;
      case "OVERDUE":
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold">OVERDUE</span>;
      case "FAILED":
        return <span className="px-2.5 py-0.5 rounded-full bg-[#3b233c] text-white text-[11px] font-bold">FAILED</span>;
      default:
        return null;
    }
  };

  const totalCollected = payments
    .filter((p) => p.paymentStatus === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout title="Premium Tracking" subtitle="Record premium payments, monitor due dates, and view payment histories.">
      {/* Stats Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Premium Collected</p>
            <p className="text-2xl font-extrabold text-slate-900">${totalCollected.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Payments Recorded</p>
            <p className="text-2xl font-extrabold text-slate-900">{payments.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Overdue Payments</p>
            <p className="text-2xl font-extrabold text-slate-900">
              {payments.filter((p) => p.paymentStatus === "OVERDUE").length}
            </p>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {["", "PAID", "PENDING", "OVERDUE", "FAILED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {st || "ALL PAYMENTS"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search policy or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:border-[#4A2B4B] outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="h-10 px-4 rounded-xl bg-[#4A2B4B] text-white font-bold text-xs shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#4A2B4B]" />
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 font-medium">
          No premium payments recorded yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Payment Date</th>
                  <th className="p-4">Policy Number</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Policy Type</th>
                  <th className="p-4">Amount Paid ($)</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-4 text-slate-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td className="p-4 font-mono font-bold text-slate-900">{p.policy?.policyNumber}</td>
                    <td className="p-4 font-bold text-slate-800">{p.policy?.customer?.name}</td>
                    <td className="p-4 font-semibold text-slate-600">{p.policy?.policyType}</td>
                    <td className="p-4 font-bold text-emerald-600">${p.amount.toFixed(2)}</td>
                    <td className="p-4">{getStatusBadge(p.paymentStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Record Premium Payment</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Select Policy *</label>
                <select
                  required
                  value={formData.policyId}
                  onChange={(e) => {
                    const selected = policies.find((pol) => pol.id === e.target.value);
                    setFormData({
                      ...formData,
                      policyId: e.target.value,
                      amount: selected ? selected.premiumAmount : formData.amount,
                    });
                  }}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                >
                  <option value="">-- Choose Policy --</option>
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.policyNumber} - {p.customer?.name} (${p.premiumAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Payment Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="500.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Payment Status</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                >
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                  <option value="OVERDUE">OVERDUE</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 h-10 rounded-xl bg-[#4A2B4B] text-white text-xs font-bold"
                >
                  {saving ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
