import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import api from "../api/axios";
import { UserCheck, Plus, Search, Loader2, Mail, CheckCircle2, XCircle, Trash2, KeyRound, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const AgentManager = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "AgentPassword123!",
  });

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/agents?search=${search}`);
      setAgents(res.data.data.agents);
    } catch (err) {
      console.error(err);
    } fontally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchAgents();
    } else {
      setLoading(false);
    }
  }, [search, user?.role]);

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const res = await api.post("/agents", formData);
      setShowModal(false);
      setFormData({ name: "", email: "", password: "AgentPassword123!" });
      setNotice({ type: "success", text: res.data.message });
      fetchAgents();
    } catch (err) {
      alert(err.message || "Failed to create agent account");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVerify = async (agentId) => {
    setActionLoadingId(agentId);
    try {
      const res = await api.put(`/agents/${agentId}/toggle-verify`);
      setNotice({ type: "success", text: res.data.message });
      fetchAgents();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResendCredentials = async (agentId) => {
    if (!window.confirm("Generate a fresh password and resend login credentials email to this agent?")) return;
    setActionLoadingId(agentId);
    try {
      const res = await api.post(`/agents/${agentId}/resend-credentials`);
      setNotice({ type: "success", text: res.data.message });
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (!window.confirm("Are you sure you want to delete this agent account?")) return;
    setActionLoadingId(agentId);
    try {
      await api.delete(`/agents/${agentId}`);
      setNotice({ type: "success", text: "Agent account deleted successfully." });
      fetchAgents();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredAgents = agents.filter((a) => {
    if (statusFilter === "VERIFIED") return a.isEmailVerified;
    if (statusFilter === "UNVERIFIED") return !a.isEmailVerified;
    return true;
  });

  return (
    <DashboardLayout title="Agent Account Management" subtitle="Provision new agent accounts, control verification status, and dispatch email credentials.">
      {/* Notice Banner */}
      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fadeIn flex items-center justify-between">
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="text-emerald-900 font-extrabold cursor-pointer">✕</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#e2f5cf] text-[#0b281a] flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Total Registered Agents</p>
            <p className="text-2xl font-extrabold text-slate-900">{agents.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Verified Active Agents</p>
            <p className="text-2xl font-extrabold text-slate-900">
              {agents.filter((a) => a.isEmailVerified).length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Pending Verification</p>
            <p className="text-2xl font-extrabold text-slate-900">
              {agents.filter((a) => !a.isEmailVerified).length}
            </p>
          </div>
        </div>
      </div>

      {/* Control Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/60 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
          {[
            { id: "", label: "ALL AGENTS" },
            { id: "VERIFIED", label: "VERIFIED" },
            { id: "UNVERIFIED", label: "UNVERIFIED" },
          ].map((st) => (
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
              placeholder="Search agent name or email..."
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
            <span className="hidden sm:inline">Provision Agent</span>
          </button>
        </div>
      </div>

      {/* Agents List Display */}
      {loading ? (
        <div className="p-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0b281a]" />
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 text-slate-500 font-semibold text-xs">
          No agent accounts found matching your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0b281a] text-emerald-400 font-extrabold flex items-center justify-center text-sm">
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{agent.name}</h4>
                      <span className="font-mono text-[10px] font-bold text-slate-400">{agent.agentCode}</span>
                    </div>
                  </div>

                  {agent.isEmailVerified ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold whitespace-nowrap">
                      VERIFIED
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold whitespace-nowrap">
                      UNVERIFIED
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Email Address</span>
                    <span className="font-bold text-slate-900 truncate max-w-[180px]">{agent.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">System Role</span>
                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md text-[10px]">
                      {agent.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Policies Deals</span>
                    <span className="font-extrabold text-slate-900">{agent.policiesDeals} Policies</span>
                  </div>
                </div>
              </div>

              {/* Admin Control Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  disabled={actionLoadingId === agent.id}
                  onClick={() => handleToggleVerify(agent.id)}
                  className={`flex-1 h-9 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                    agent.isEmailVerified
                      ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                  title={agent.isEmailVerified ? "Unverify Agent" : "Verify Agent"}
                >
                  {agent.isEmailVerified ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{agent.isEmailVerified ? "Unverify" : "Verify"}</span>
                </button>

                <button
                  disabled={actionLoadingId === agent.id}
                  onClick={() => handleResendCredentials(agent.id)}
                  className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  title="Resend Credentials Email"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Email Creds</span>
                </button>

                <button
                  disabled={actionLoadingId === agent.id}
                  onClick={() => handleDeleteAgent(agent.id)}
                  className="h-9 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center cursor-pointer"
                  title="Delete Agent Account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Provision New Agent Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-slate-900">Provision New Agent Account</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Create an Agent account. Login credentials will be automatically dispatched to the agent's email address.
            </p>

            <form onSubmit={handleCreateAgent} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Agent Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Sophia Mitchell"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Agent Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="sophia.agent@havenix.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Initial Password *</label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Credentials email will be automatically sent to the Agent & Admin.</span>
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
                  {saving ? "Provisioning..." : "Provision Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
