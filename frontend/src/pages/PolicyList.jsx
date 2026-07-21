import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import api from "../api/axios";
import { Plus, Search, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const PolicyList = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
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
    customerId: user?.customer?.id || "",
    policyType: "Health Insurance",
    premiumAmount: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  const [renewData, setRenewData] = useState({
    newEndDate: "",
    newPremiumAmount: "",
  });

  // Automatically open Create Policy Modal if ?create=true URL query param is present
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setShowCreateModal(true);
    }
  }, [searchParams]);

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
    try {
      const res = await api.get("/customers?limit=100");
      setCustomers(res.data.data.customers);
    } catch (err) {
      console.error(err);
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

    const targetCustomerId = createData.customerId || user?.customer?.id || customers[0]?.id;

    if (!targetCustomerId) {
      alert("Please select or register a customer first.");
      setSaving(false);
      return;
    }

    try {
      await api.post("/policies", {
        ...createData,
        customerId: targetCustomerId,
        premiumAmount: parseFloat(createData.premiumAmount),
      });
      setShowCreateModal(false);
      fetchPolicies();
    } catch (err) {
      alert(err.message || "Failed to create policy");
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
        return <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold whitespace-nowrap">ACTIVE</span>;
      case "RENEWED":
        return <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[11px] font-extrabold whitespace-nowrap">RENEWED</span>;
      case "EXPIRED":
        return <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-extrabold whitespace-nowrap">EXPIRED</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-extrabold whitespace-nowrap">CANCELLED</span>;
      default:
        return null;
    }
  };

  const statusOptions = [
    { id: "", label: "ALL" },
    { id: "ACTIVE", label: "ACTIVE" },
    { id: "RENEWED", label: "RENEWED" },
    { id: "EXPIRED", label: "EXPIRED" },
    { id: "CANCELLED", label: "CANCELLED" },
  ];

  return (
    <DashboardLayout
      title="Policy Management"
      subtitle="Create, renew, and manage customer insurance policies."
      onAddNew={() => setShowCreateModal(true)}
    >
      {/* Filters & Actions Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/60 shadow-xs">
        {/* Status Filter Tabs */}
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
          {/* Search Input */}
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

          {/* New Policy Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-4 rounded-2xl bg-[#0b281a] hover:bg-[#061d12] text-white font-extrabold text-xs shadow-md shadow-[#0b281a]/20 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Policy</span>
          </button>
        </div>
      </div>

      {/* Policies List Display */}
      {loading ? (
        <div className="p-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0b281a]" />
        </div>
      ) : policies.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 text-slate-500 font-semibold text-xs">
          No insurance policies found matching your filters.
        </div>
      ) : (
        <>
          {/* Mobile Card View (screens < md) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {policies.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-extrabold text-[#0b281a] block">{p.policyNumber}</span>
                    <span className="text-[11px] font-semibold text-slate-500">{p.policyType}</span>
                  </div>
                  {getStatusBadge(p.status)}
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Customer</span>
                    <span className="font-bold text-slate-900">{p.customer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Premium</span>
                    <span className="font-bold text-slate-900">₹{p.premiumAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Validity</span>
                    <span className="text-slate-600 font-semibold">
                      {new Date(p.startDate).toLocaleDateString()} &rarr; {new Date(p.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {(user?.role === "ADMIN" || user?.role === "AGENT") && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedPolicy(p);
                        setRenewData({
                          newEndDate: new Date(Date.parse(p.endDate) + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                          newPremiumAmount: p.premiumAmount,
                        });
                        setShowRenewModal(true);
                      }}
                      className="flex-1 h-9 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Renew
                    </button>

                    {p.status === "ACTIVE" && (
                      <button
                        onClick={() => handleCancel(p.id)}
                        className="flex-1 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel
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
                    <th className="p-4 whitespace-nowrap">Policy Number</th>
                    <th className="p-4 whitespace-nowrap">Customer</th>
                    <th className="p-4 whitespace-nowrap">Type</th>
                    <th className="p-4 whitespace-nowrap">Premium (₹)</th>
                    <th className="p-4 whitespace-nowrap">Validity</th>
                    <th className="p-4 whitespace-nowrap">Status</th>
                    {(user?.role === "ADMIN" || user?.role === "AGENT") && (
                      <th className="p-4 text-right whitespace-nowrap">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {policies.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono font-extrabold text-slate-900 whitespace-nowrap">
                        {p.policyNumber}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900">{p.customer?.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{p.customer?.email}</p>
                      </td>
                      <td className="p-4 font-semibold text-slate-600 whitespace-nowrap">{p.policyType}</td>
                      <td className="p-4 font-extrabold text-slate-900 whitespace-nowrap">
                        ₹{p.premiumAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 text-slate-500 whitespace-nowrap font-medium">
                        {new Date(p.startDate).toLocaleDateString()} &rarr; {new Date(p.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 whitespace-nowrap">{getStatusBadge(p.status)}</td>
                      {(user?.role === "ADMIN" || user?.role === "AGENT") && (
                        <td className="p-4 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => {
                              setSelectedPolicy(p);
                              setRenewData({
                                newEndDate: new Date(Date.parse(p.endDate) + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                                newPremiumAmount: p.premiumAmount,
                              });
                              setShowRenewModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Renew
                          </button>
                          {p.status === "ACTIVE" && (
                            <button
                              onClick={() => handleCancel(p.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Cancel
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

      {/* Create Policy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-slate-900">Create Insurance Policy</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Select Customer *</label>
                <select
                  required
                  value={createData.customerId}
                  onChange={(e) => setCreateData({ ...createData, customerId: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Policy Type *</label>
                <select
                  value={createData.policyType}
                  onChange={(e) => setCreateData({ ...createData, policyType: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
                >
                  <option value="Health Insurance">Health Insurance</option>
                  <option value="Auto Insurance">Auto Insurance</option>
                  <option value="Life Insurance">Life Insurance</option>
                  <option value="Property Insurance">Property Insurance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Premium Amount (₹) *</label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="25000"
                  value={createData.premiumAmount}
                  onChange={(e) => setCreateData({ ...createData, premiumAmount: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
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
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={createData.endDate}
                    onChange={(e) => setCreateData({ ...createData, endDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 h-10 rounded-xl bg-[#0b281a] hover:bg-[#061d12] text-white text-xs font-extrabold cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-slate-900">Renew Policy {selectedPolicy.policyNumber}</h3>
            <form onSubmit={handleRenewSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">New End Date *</label>
                <input
                  type="date"
                  required
                  value={renewData.newEndDate}
                  onChange={(e) => setRenewData({ ...renewData, newEndDate: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Renewal Premium (₹)</label>
                <input
                  type="number"
                  step="1"
                  value={renewData.newPremiumAmount}
                  onChange={(e) => setRenewData({ ...renewData, newPremiumAmount: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRenewModal(false)}
                  className="w-1/2 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 h-10 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-extrabold cursor-pointer"
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
