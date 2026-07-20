import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import api from "../api/axios";
import { FileText, Plus, Search, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const ClaimList = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    policyId: "",
    claimAmount: "",
    reason: "",
  });

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/claims?status=${statusFilter}&search=${search}`);
      setClaims(res.data.data.claims);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivePolicies = async () => {
    try {
      const res = await api.get("/policies?status=ACTIVE&limit=100");
      setPolicies(res.data.data.policies);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [statusFilter, search]);

  useEffect(() => {
    fetchActivePolicies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/claims", {
        ...formData,
        claimAmount: parseFloat(formData.claimAmount),
      });
      setShowModal(false);
      setFormData({ policyId: "", claimAmount: "", reason: "" });
      fetchClaims();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/claims/${id}/status`, { status: newStatus });
      fetchClaims();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">PENDING</span>;
      case "VERIFYING":
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">VERIFYING</span>;
      case "APPROVED":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">APPROVED</span>;
      case "REJECTED":
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold">REJECTED</span>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Claim Management" subtitle="Submit insurance claims, verify supporting documents, and approve or reject claims.">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {["", "PENDING", "VERIFYING", "APPROVED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {st || "ALL CLAIMS"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search claim reason, policy..."
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
            <span>Submit Claim</span>
          </button>
        </div>
      </div>

      {/* Claims Table */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#4A2B4B]" />
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 font-medium">
          No insurance claims submitted yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Submission Date</th>
                  <th className="p-4">Policy Number</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Reason / Details</th>
                  <th className="p-4">Claim Amount ($)</th>
                  <th className="p-4">Status</th>
                  {(user?.role === "ADMIN" || user?.role === "AGENT") && <th className="p-4 text-right">Verification</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {claims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="p-4 text-slate-500">{new Date(c.submissionDate).toLocaleDateString()}</td>
                    <td className="p-4 font-mono font-bold text-slate-900">{c.policy?.policyNumber}</td>
                    <td className="p-4 font-bold text-slate-800">{c.policy?.customer?.name}</td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{c.reason}</td>
                    <td className="p-4 font-bold text-slate-900">${c.claimAmount.toFixed(2)}</td>
                    <td className="p-4">{getStatusBadge(c.status)}</td>
                    {(user?.role === "ADMIN" || user?.role === "AGENT") && (
                      <td className="p-4 text-right space-x-2">
                        {c.status !== "APPROVED" && (
                          <button
                            onClick={() => handleUpdateStatus(c.id, "APPROVED")}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3 h-3" /> Approve
                          </button>
                        )}
                        {c.status !== "REJECTED" && (
                          <button
                            onClick={() => handleUpdateStatus(c.id, "REJECTED")}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submit Claim Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Submit Insurance Claim</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Select Policy *</label>
                <select
                  required
                  value={formData.policyId}
                  onChange={(e) => setFormData({ ...formData, policyId: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                >
                  <option value="">-- Choose Active Policy --</option>
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.policyNumber} - {p.policyType} ({p.customer?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Claim Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="1500.00"
                  value={formData.claimAmount}
                  onChange={(e) => setFormData({ ...formData, claimAmount: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Claim Reason / Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide incident details or medical expenses..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                />
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
                  {saving ? "Submitting..." : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
