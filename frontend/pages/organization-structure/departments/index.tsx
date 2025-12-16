import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { useRouter } from "next/router";
interface Department {
  _id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const router = useRouter();

  // modal + form state
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadDepartments() {
    try {
      setError(null);
      const res = await api.get("/organization-structure/departments");
      setDepartments(res.data);
    } catch {
      setError("Failed to load departments ❌");
    } finally {
      setLoading(false);
    }
  }

  async function createDepartment() {
    if (!code || !name) return alert("All fields are required");

    try {
      setSaving(true);
      await api.post("/organization-structure/departments", { code, name });

      setCode("");
      setName("");
      setShowModal(false);
      loadDepartments();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Creation failed ❌");
    } finally {
      setSaving(false);
    }
  }

  async function deactivateDepartment(id: string) {
    if (!confirm("Deactivate this department?")) return;

    try {
      await api.patch(`/organization-structure/departments/deactivate/${id}`);
      loadDepartments();
    } catch {
      alert("Failed to deactivate ❌");
    }
  }

  async function activateDepartment(id: string) {
    if (!confirm("Activate this department?")) return;

    try {
      await api.patch(`/organization-structure/departments/activate/${id}`);
      loadDepartments();
    } catch {
      alert("Failed to activate ❌");
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
        Loading departments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-red-400">
        {error}
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-light">Departments</h1>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
          >
            + Create Department
          </button>
          <button
            type="button"
            onClick={() => router.push("/organization-structure")}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
            Back
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dep) => (
                <tr
                  key={dep._id}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="px-4 py-3">{dep.code}</td>
                  <td className="px-4 py-3">{dep.name}</td>
                  <td className="px-4 py-3">
                    {dep.isActive ? (
                      <span className="text-green-400">Active</span>
                    ) : (
                      <span className="text-red-400">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    {dep.isActive ? (
                      <button
                        onClick={() => deactivateDepartment(dep._id)}
                        className="px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-700"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => activateDepartment(dep._id)}
                        className="px-3 py-1 text-sm rounded bg-green-600 hover:bg-green-700"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {departments.length === 0 && (
            <div className="p-6 text-center text-white/60">
              No departments found
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-white/10">
            <h2 className="text-xl mb-4">Create Department</h2>

            <div className="space-y-3">
              <input
                placeholder="Department Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded bg-white/10 border border-white/10 outline-none"
              />

              <input
                placeholder="Department Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-white/10 border border-white/10 outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                onClick={createDepartment}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
              >
                {saving ? "Saving..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
