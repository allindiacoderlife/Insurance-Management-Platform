import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import api from "../api/axios";
import { FolderOpen, Upload, Download, Trash2, File, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const DocumentManager = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const initCustomerSelection = async () => {
      if (user?.role === "ADMIN" || user?.role === "AGENT") {
        try {
          const res = await api.get("/customers?limit=100");
          const custs = res.data.data.customers;
          setCustomers(custs);
          if (custs.length > 0) {
            setSelectedCustomerId(custs[0].id);
          }
        } catch (err) {
          console.error(err);
        }
      } else if (user?.role === "CUSTOMER" && user?.customer?.id) {
        setSelectedCustomerId(user.customer.id);
      }
    };

    if (user) {
      initCustomerSelection();
    }
  }, [user]);

  const fetchDocuments = async (customerId) => {
    if (!customerId) return;
    setLoading(true);
    try {
      const res = await api.get(`/documents/customer/${customerId}`);
      setDocuments(res.data.data.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      fetchDocuments(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const targetCustId = selectedCustomerId || user?.customer?.id;

    if (!file || !targetCustId) {
      alert("Please select a valid customer and file to upload.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("customerId", targetCustId);

    try {
      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      // Reset file input value
      e.target.reset();
      fetchDocuments(targetCustId);
    } catch (err) {
      alert(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const response = await api.get(`/documents/download/${docId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download document.");
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await api.delete(`/documents/${docId}`);
      fetchDocuments(selectedCustomerId);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout title="Document Vault" subtitle="Upload, verify, and store KYC ID proofs & insurance policy forms.">
      {/* Upper Control Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Select Customer (For Admin / Agent) */}
          {(user?.role === "ADMIN" || user?.role === "AGENT") ? (
            <div className="w-full md:w-80">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Select Customer Vault</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-[#0b281a]"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-slate-400">Customer Vault Owner</p>
              <p className="text-sm font-extrabold text-slate-900">{user?.name}</p>
            </div>
          )}

          {/* Upload Form */}
          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-xl">
            <input
              type="file"
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
            <button
              type="submit"
              disabled={uploading}
              className="h-10 px-4 rounded-2xl bg-[#0b281a] hover:bg-[#061d12] text-white font-extrabold text-xs shadow-md shadow-[#0b281a]/20 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Document</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Documents List Grid */}
      {loading ? (
        <div className="p-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0b281a]" />
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 text-slate-500 font-semibold text-xs">
          No documents uploaded in this vault yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#e2f5cf] text-[#0b281a] flex items-center justify-center shrink-0">
                  <File className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-slate-900 truncate">{doc.fileName}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleDownload(doc.id, doc.fileName)}
                  className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>

                {(user?.role === "ADMIN" || user?.role === "AGENT") && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
