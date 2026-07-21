import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import api from "../api/axios";
import { Plus, Search, Loader2, CheckCircle, XCircle } from "lucide-react";
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
        return <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-extrabold whitespace-nowrap">PENDING</span>;
      case "VERIFYING":
        return <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-extrabold whitespace-nowrap">VERIFYING</span>;
      case "APPROVED":
        return <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold whitespace-nowrap">APPROVED</span>;
      case "REJECTED":
        return <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-extrabold whitespace-nowrap">REJECTED</span>;
      default:
        return null;
    }
  };

  const statusOptions = [
    { id: "", label: "ALL" },
    { id: "PENDING", label: "PENDING" },
    { id: "VERIFYING", label: "VERIFYING" },
    { id: "APPROVED", label: "APPROVED" },
    { id: "REJECTED", label: "REJECTED" },
  ];

  return (
    <DashboardLayout title="Claim Management" subtitle="Submit insurance claims, verify supporting documents, and approve or reject claims.">
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
              placeholder="Search claim reason, policy..."
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
            <span className="hidden sm:inline">Submit Claim</span>
          </button>
        </div>
      </div>

      {/* Claims Display */}
      {loading ? (
        <div className="p-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0b281a]" />
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 text-slate-500 font-semibold text-xs">
          No insurance claims submitted yet.
        </div>
      ) : (
        <>
          {/* Mobile Card View (screens < md) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {claims.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-extrabold text-[#0b281a] block">{c.policy?.policyNumber}</span>
                    <span className="text-[11px] font-semibold text-slate-500">{c.policy?.customer?.name}</span>
                  </div>
                  {getStatusBadge(c.status)}
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-slate-600 font-medium">{c.reason}</p>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400 font-medium">Claim Amount</span>
                    <span className="font-bold text-slate-900">₹{c.claimAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Submission Date</span>
                    <span className="text-slate-500 font-semibold">{new Date(c.submissionDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {(user?.role === "ADMIN" || user?.role === "AGENT") && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {c.status !== "APPROVED" && (
                      <button
                        onClick={() => handleUpdateStatus(c.id, "APPROVED")}
                        className="flex-1 h-9 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {c.status !== "REJECTED" && (
                      <button
                        onClick={() => handleUpdateStatus(c.id, "REJECTED")}
                        className="flex-1 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View (screens >= md) */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/60 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4 whitespace-nowrap">Submission Date</th>
                    <th className="p-4 whitespace-nowrap">Policy Number</th>
                    <th className="p-4 whitespace-nowrap">Customer</th>
                    <th className="p-4 whitespace-nowrap">Reason / Details</th>
                    <th className="p-4 whitespace-nowrap">Claim Amount (₹)</th>
                    <th className="p-4 whitespace-nowrap">Status</th>
                    {(user?.role === "ADMIN" || user?.role === "AGENT") && (
                      <th className="p-4 text-right whitespace-nowrap">Verification</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {claims.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(c.submissionDate).toLocaleDateString()}</td>
                      <td className="p-4 font-mono font-extrabold text-slate-900 whitespace-nowrap">{c.policy?.policyNumber}</td>
                      <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{c.policy?.customer?.name}</td>
                      <td className="p-4 text-slate-600 max-w-xs truncate">{c.reason}</td>
                      <td className="p-4 font-extrabold text-slate-900 whitespace-nowrap">₹{c.claimAmount.toLocaleString("en-IN")}</td>
                      <td className="p-4 whitespace-nowrap">{getStatusBadge(c.status)}</td>
                      {(user?.role === "ADMIN" || user?.role === "AGENT") && (
                        <td className="p-4 text-right whitespace-nowrap space-x-2">
                          {c.status !== "APPROVED" && (
                            <button
                              onClick={() => handleUpdateStatus(c.id, "APPROVED")}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                          )}
                          {c.status !== "REJECTED" && (
                            <button
                              onClick={() => handleUpdateStatus(c.id, "REJECTED")}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
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
        </>
      )}

      {/* Submit Claim Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-slate-900">Submit Insurance Claim</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Select Policy *</label>
                <select
                  required
                  value={formData.policyId}
                  onChange={(e) => setFormData({ ...formData, policyId: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
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
                <label className="text-xs font-semibold text-slate-600 block mb-1">Claim Amount (₹) *</label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="50000"
                  value={formData.claimAmount}
                  onChange={(e) => setFormData({ ...formData, claimAmount: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
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
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
                />
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
