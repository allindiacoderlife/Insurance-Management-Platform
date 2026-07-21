import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import api from "../api/axios";
import { Search, Plus, Loader2, Phone, MapPin, Calendar, Trash2 } from "lucide-react";

export const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", dob: "" });
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?page=${page}&limit=8&search=${search}`);
      setCustomers(res.data.data.customers);
      setTotalPages(res.data.data.pagination.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post("/customers", formData);
      setShowModal(false);
      setFormData({ name: "", email: "", phone: "", address: "", dob: "" });
      fetchCustomers();
    } catch (err) {
      setError(err.message || "Failed to create customer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout title="Customer Management" subtitle="Register, view, and manage customer records and policy histories.">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/60 shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-2xl border border-slate-200/80 bg-slate-50 text-xs font-semibold focus:bg-white focus:border-[#0b281a] outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto h-10 px-4 rounded-2xl bg-[#0b281a] hover:bg-[#061d12] text-white font-extrabold text-xs shadow-md shadow-[#0b281a]/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Customer</span>
        </button>
      </div>

      {/* Customer Grid */}
      {loading ? (
        <div className="p-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0b281a]" />
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 text-slate-500 font-semibold text-xs">
          No customer records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {customers.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:border-[#0b281a]/40 transition-all space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{c.name}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold">{c.email}</p>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-600 font-medium">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{c.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 truncate" />
                  <span className="truncate">{c.address}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>DOB: {new Date(c.dob).toLocaleDateString()}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-extrabold text-slate-500">
                <span className="bg-[#e2f5cf] text-[#0b281a] px-2.5 py-0.5 rounded-full">Policies: {c._count?.policies || 0}</span>
                <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">Docs: {c._count?.documents || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-xl border border-slate-200/80 bg-white text-xs font-extrabold disabled:opacity-50 cursor-pointer"
          >
            Prev
          </button>
          <span className="px-4 py-2 text-xs font-extrabold text-slate-600">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-xl border border-slate-200/80 bg-white text-xs font-extrabold disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal for Registering Customer */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-slate-900">Register Customer</h3>
            {error && <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Full Name *"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
              />
              <input
                type="email"
                placeholder="Email Address *"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
              />
              <input
                type="text"
                placeholder="Phone Number *"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
              />
              <input
                type="text"
                placeholder="Address *"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
              />
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#0b281a]"
              />

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
                  {saving ? "Saving..." : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
