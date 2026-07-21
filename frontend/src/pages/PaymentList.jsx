import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import api from "../api/axios";
import { CreditCard, Plus, Search, Loader2, IndianRupee, AlertCircle } from "lucide-react";
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
        return <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold whitespace-nowrap">PAID</span>;
      case "PENDING":
        return <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-extrabold whitespace-nowrap">PENDING</span>;
      case "OVERDUE":
        return <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-extrabold whitespace-nowrap">OVERDUE</span>;
      case "FAILED":
        return <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-extrabold whitespace-nowrap">FAILED</span>;
      default:
        return null;
    }
  };

  const totalCollected = payments
    .filter((p) => p.paymentStatus === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const statusOptions = [
    { id: "", label: "ALL" },
    { id: "PAID", label: "PAID" },
    { id: "PENDING", label: "PENDING" },
    { id: "OVERDUE", label: "OVERDUE" },
    { id: "FAILED", label: "FAILED" },
  ];

  return (
    <DashboardLayout title="Premium Tracking" subtitle="Record premium payments, monitor due dates, and view payment histories.">
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Total Premium Collected</p>
            <p className="text-2xl font-extrabold text-slate-900">₹{totalCollected.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#e2f5cf] text-[#0b281a] flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Total Payments Recorded</p>
            <p className="text-2xl font-extrabold text-slate-900">{payments.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Overdue Payments</p>
            <p className="text-2xl font-extrabold text-slate-900">
              {payments.filter((p) => p.paymentStatus === "OVERDUE").length}
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/60 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
          {statusOptions.map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === st.id ? "bg-white text-[#0b281a] shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search policy or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-2xl border border-slate-200/80 bg-slate-50 text-xs font-semibold focus:bg-white focus:border-[#0b281a] outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="h-10 px-4 rounded-2xl bg-[#0b281a] hover:bg-[#061d12] text-white font-extrabold text-xs shadow-md shadow-[#0b281a]/20 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Record Payment</span>
          </button>
        </div>
      </div>

      {/* Payments Display */}
      {loading ? (
        <div className="p-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0b281a]" />
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 text-slate-500 font-semibold text-xs">
          No premium payments recorded yet.
        </div>
      ) : (
        <>
          {/* Mobile Card View (screens < md) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {payments.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-extrabold text-[#0b281a] block">{p.policy?.policyNumber}</span>
                    <span className="text-[11px] font-semibold text-slate-500">{p.policy?.policyType}</span>
                  </div>
                  {getStatusBadge(p.paymentStatus)}
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Customer</span>
                    <span className="font-bold text-slate-900">{p.policy?.customer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Amount Paid</span>
                    <span className="font-bold text-emerald-600">₹{p.amount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Date</span>
                    <span className="text-slate-600 font-semibold">{new Date(p.paymentDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (screens >= md) */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/60 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4 whitespace-nowrap">Payment Date</th>
                    <th className="p-4 whitespace-nowrap">Policy Number</th>
                    <th className="p-4 whitespace-nowrap">Customer</th>
                    <th className="p-4 whitespace-nowrap">Policy Type</th>
                    <th className="p-4 whitespace-nowrap">Amount Paid (₹)</th>
                    <th className="p-4 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td className="p-4 font-mono font-extrabold text-slate-900 whitespace-nowrap">{p.policy?.policyNumber}</td>
                      <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{p.policy?.customer?.name}</td>
                      <td className="p-4 font-semibold text-slate-600 whitespace-nowrap">{p.policy?.policyType}</td>
                      <td className="p-4 font-extrabold text-emerald-600 whitespace-nowrap">₹{p.amount.toLocaleString("en-IN")}</td>
                      <td className="p-4 whitespace-nowrap">{getStatusBadge(p.paymentStatus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
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
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
                >
                  <option value="">-- Choose Policy --</option>
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.policyNumber} - {p.customer?.name} (₹{p.premiumAmount.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="25000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Payment Status</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
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
                  className="w-1/2 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 h-10 rounded-xl bg-[#0b281a] hover:bg-[#061d12] text-white text-xs font-extrabold cursor-pointer"
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
