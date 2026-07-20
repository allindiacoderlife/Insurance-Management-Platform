import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import api from "../api/axios";
import { FolderOpen, Upload, Download, Trash2, File, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const DocumentManager = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers?limit=100");
      setCustomers(res.data.data.customers);
      if (res.data.data.customers.length > 0) {
        setSelectedCustomerId(res.data.data.customers[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchDocuments(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedCustomerId) {
      alert("Please select a customer and choose a file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("customerId", selectedCustomerId);

    try {
      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      fetchDocuments(selectedCustomerId);
    } catch (err) {
      alert(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments(selectedCustomerId);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout title="Document Management" subtitle="Upload identity proofs, policy contracts, and supporting claim documents.">
      {/* Upload & Customer Selector Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#4A2B4B]" />
          Upload Customer Document
        </h3>

        <form onSubmit={handleUpload} className="flex flex-col md:flex-row items-center gap-4">
          <select
            required
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full md:w-72 h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-slate-50"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
            ))}
          </select>

          <input
            type="file"
            required
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full md:w-auto text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
          />

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full md:w-auto h-11 px-6 rounded-xl bg-[#4A2B4B] hover:bg-[#391e3a] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Upload File</span>
          </button>
        </form>
      </div>

      {/* Document Gallery */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Uploaded Customer Documents</h3>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#4A2B4B]" />
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 font-medium">
            No documents uploaded for this customer yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 hover:border-[#4A2B4B]/30 transition-all">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#4A2B4B] flex items-center justify-center shrink-0">
                    <File className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-900 text-xs truncate">{doc.fileName}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={`http://localhost:8000/api/v1/documents/download/${doc.id}`}
                    download
                    className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  {(user?.role === "ADMIN" || user?.role === "AGENT") && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                      title="Delete File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
