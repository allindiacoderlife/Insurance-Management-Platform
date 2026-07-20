import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import api from "../api/axios";
import { ShieldCheck, Plus, Search, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const PolicyList = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [saving, setSaving] = useState(false);

  const [createData, setCreateData] = useState({
    customerId: "",
    policyType: "Health Insurance",
    premiumAmount: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  const [renewData, setRenewData] = useState({
    newEndDate: "",
    newPremiumAmount: "",
  });

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/policies?status=${statusFilter}&search=${search}`);
      setPolicies(res.data.data.policies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersList = async () => {
    if (user?.role === "ADMIN" || user?.role === "AGENT") {
      try {
        const res = await api.get("/customers?limit=100");
        setCustomers(res.data.data.customers);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [statusFilter, search]);

  useEffect(() => {
    fetchCustomersList();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/policies", {
        ...createData,
        premiumAmount: parseFloat(createData.premiumAmount),
      });
      setShowCreateModal(false);
      fetchPolicies();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/policies/${selectedPolicy.id}/renew`, {
        newEndDate: renewData.newEndDate,
        newPremiumAmount: renewData.newPremiumAmount ? parseFloat(renewData.newPremiumAmount) : undefined,
      });
      setShowRenewModal(false);
      fetchPolicies();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this policy?")) return;
    try {
      await api.put(`/policies/${id}/cancel`);
      fetchPolicies();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">ACTIVE</span>;
      case "RENEWED":
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold">RENEWED</span>;
      case "EXPIRED":
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">EXPIRED</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold">CANCELLED</span>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Policy Management" subtitle="Create, renew, and manage customer insurance policies.">
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {["", "ACTIVE", "RENEWED", "EXPIRED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {st || "ALL POLICIES"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search policy number or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:border-[#4A2B4B] outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {(user?.role === "ADMIN" || user?.role === "AGENT") && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-10 px-4 rounded-xl bg-[#4A2B4B] text-white font-bold text-xs shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Policy</span>
            </button>
          )}
        </div>
      </div>

      {/* Policies Table */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#4A2B4B]" />
        </div>
      ) : policies.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 font-medium">
          No insurance policies found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Policy Number</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Premium ($)</th>
                  <th className="p-4">Validity</th>
                  <th className="p-4">Status</th>
                  {(user?.role === "ADMIN" || user?.role === "AGENT") && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {policies.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-slate-900">{p.policyNumber}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{p.customer?.name}</p>
                      <p className="text-[11px] text-slate-400">{p.customer?.email}</p>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">{p.policyType}</td>
                    <td className="p-4 font-bold text-slate-900">${p.premiumAmount.toFixed(2)}</td>
                    <td className="p-4 text-slate-500">
                      {new Date(p.startDate).toLocaleDateString()} &rarr; {new Date(p.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">{getStatusBadge(p.status)}</td>
                    {(user?.role === "ADMIN" || user?.role === "AGENT") && (
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPolicy(p);
                            setRenewData({ newEndDate: new Date(Date.parse(p.endDate) + 365*24*60*60*1000).toISOString().slice(0, 10), newPremiumAmount: p.premiumAmount });
                            setShowRenewModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" /> Renew
                        </button>
                        {p.status === "ACTIVE" && (
                          <button
                            onClick={() => handleCancel(p.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3 h-3" /> Cancel
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

      {/* Create Policy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Create Insurance Policy</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Select Customer *</label>
                <select
                  required
                  value={createData.customerId}
                  onChange={(e) => setCreateData({ ...createData, customerId: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Policy Type *</label>
                <select
                  value={createData.policyType}
                  onChange={(e) => setCreateData({ ...createData, policyType: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                >
                  <option value="Health Insurance">Health Insurance</option>
                  <option value="Auto Insurance">Auto Insurance</option>
                  <option value="Life Insurance">Life Insurance</option>
                  <option value="Property Insurance">Property Insurance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Premium Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="500.00"
                  value={createData.premiumAmount}
                  onChange={(e) => setCreateData({ ...createData, premiumAmount: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={createData.startDate}
                    onChange={(e) => setCreateData({ ...createData, startDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={createData.endDate}
                    onChange={(e) => setCreateData({ ...createData, endDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 h-10 rounded-xl bg-[#4A2B4B] text-white text-xs font-bold"
                >
                  {saving ? "Creating..." : "Create Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renew Policy Modal */}
      {showRenewModal && selectedPolicy && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Renew Policy {selectedPolicy.policyNumber}</h3>
            <form onSubmit={handleRenewSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">New End Date *</label>
                <input
                  type="date"
                  required
                  value={renewData.newEndDate}
                  onChange={(e) => setRenewData({ ...renewData, newEndDate: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Renewal Premium ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={renewData.newPremiumAmount}
                  onChange={(e) => setRenewData({ ...renewData, newPremiumAmount: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRenewModal(false)}
                  className="w-1/2 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 h-10 rounded-xl bg-purple-700 text-white text-xs font-bold"
                >
                  {saving ? "Renewing..." : "Renew Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
