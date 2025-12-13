// pages/hr/employees/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api from "../../../api/axios";

interface EmployeeDetail {
  _id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  nationalId: string;
  status: string;
  department?: string;
  position?: string;
  reportingManager?: string;
  dateOfHire?: string;
  [key: string]: any;
}

export default function HrEmployeeDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [emp, setEmp] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const isHr =
          role === "HR Employee" ||
          role === "HR Manager" ||
          role === "HR Admin";

        if (!token || !isHr) {
          router.push("/login");
          return;
        }

        const res = await api.get(`/employee-profile/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEmp(res.data);
      } catch (err: any) {
        console.error("❌ Error loading employee:", err);
        setErrorMsg(
          err.response?.data?.message || "Failed to load employee ❌"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!emp) return;

    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const token = localStorage.getItem("token");

      const body = {
        firstName: emp.firstName,
        lastName: emp.lastName,
        employeeNumber: emp.employeeNumber,
        nationalId: emp.nationalId,
        status: emp.status,
        department: emp.department,
        position: emp.position,
        reportingManager: emp.reportingManager,
        dateOfHire: emp.dateOfHire,
      };

      const res = await api.patch(`/employee-profile/${emp._id}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEmp(res.data);
      setSuccessMsg("Employee profile updated successfully ✅");
    } catch (err: any) {
      console.error("❌ Save error:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Could not update employee profile ❌"
      );
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof EmployeeDetail, value: any) {
    setEmp((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 text-center text-white">
        <h2 className="text-xl font-semibold">Loading employee...</h2>
      </div>
    );
  }

  if (!emp) {
    return (
      <div className="max-w-3xl mx-auto mt-10 text-center text-white">
        <h2 className="text-xl font-semibold">Employee not found ❌</h2>
        {errorMsg && <p className="mt-2 text-red-400">{errorMsg}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 text-white">
      <button
        onClick={() => router.back()}
        className="mb-4 px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
      >
        ⬅ Back
      </button>

      <div className="bg-gray-900 rounded-lg shadow p-6 border border-gray-700">
        <h1 className="text-2xl font-bold mb-4">
          Edit Employee – {emp.firstName} {emp.lastName}
        </h1>

        {errorMsg && <p className="mb-2 text-red-400">{errorMsg}</p>}
        {successMsg && <p className="mb-2 text-green-400">{successMsg}</p>}

        <form onSubmit={handleSave} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="First Name"
              value={emp.firstName}
              onChange={(v) => updateField("firstName", v)}
            />
            <Field
              label="Last Name"
              value={emp.lastName}
              onChange={(v) => updateField("lastName", v)}
            />
            <Field
              label="Employee Number"
              value={emp.employeeNumber}
              onChange={(v) => updateField("employeeNumber", v)}
            />
            <Field
              label="National ID"
              value={emp.nationalId}
              onChange={(v) => updateField("nationalId", v)}
            />

            <Field
              label="Department"
              value={emp.department || ""}
              onChange={(v) => updateField("department", v)}
            />
            <Field
              label="Position"
              value={emp.position || ""}
              onChange={(v) => updateField("position", v)}
            />

            <Field
              label="Reporting Manager (ID)"
              value={emp.reportingManager || ""}
              onChange={(v) => updateField("reportingManager", v)}
            />

            <Field
              label="Status"
              value={emp.status}
              onChange={(v) => updateField("status", v)}
              placeholder="ACTIVE / INACTIVE / ON_LEAVE ..."
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Date of Hire</label>
            <input
              type="date"
              value={
                emp.dateOfHire
                  ? new Date(emp.dateOfHire).toISOString().substring(0, 10)
                  : ""
              }
              onChange={(e) => updateField("dateOfHire", e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-semibold mb-1">{label}</label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 rounded bg-gray-800 border border-gray-600"
      />
    </div>
  );
}
