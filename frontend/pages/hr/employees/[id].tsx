import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api from "../../../api/axios";

export default function HREditEmployeePage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [employee, setEmployee] = useState<any>(null);

  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    role: "",
    status: "",
  });

  // ============================
  // LOAD EMPLOYEE + BASE DATA
  // ============================
  useEffect(() => {
    if (!id) return;

    async function loadAll() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const [empRes, depRes, posRes] = await Promise.all([
          api.get(`/employee-profile/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/organization-structure/departments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/organization-structure/positions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const emp = empRes.data;
        setEmployee(emp);

        setDepartments(depRes.data?.items || depRes.data || []);
        setPositions(posRes.data?.items || posRes.data || []);

        setForm({
          firstName: emp.firstName || "",
          lastName: emp.lastName || "",
          role: emp.role || "",
          status: emp.status || "",
        });

        const deptId =
          emp.primaryDepartmentId && typeof emp.primaryDepartmentId === "object"
            ? emp.primaryDepartmentId._id
            : emp.primaryDepartmentId || "";

        const posId =
          emp.primaryPositionId && typeof emp.primaryPositionId === "object"
            ? emp.primaryPositionId._id
            : emp.primaryPositionId || "";

        setSelectedDepartmentId(deptId);
        setSelectedPositionId(posId);

        if (deptId) {
          loadManagersByDepartment(deptId);
        }
      } catch (err) {
        alert("Failed to load employee ❌");
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [id, router]);

  // ============================
  // LOAD MANAGERS (SAME AS CREATE)
  // ============================
  async function loadManagersByDepartment(departmentId: string) {
    const token = localStorage.getItem("token");

    try {
      const res = await api.get(
        `/employee-profile/department/${departmentId}/managers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setManagers(res.data || []);
      setSelectedManagerId("");
    } catch (err) {
      console.error(err);
      setManagers([]);
    }
  }

  // ============================
  // UPDATE BASIC FIELDS
  // ============================
  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ============================
  // SAVE BASIC INFO
  // ============================
  async function save() {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      await api.patch(
        `/employee-profile/${id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Employee updated ✅");
      router.push("/hr/employees");
    } catch {
      alert("Update failed ❌");
    } finally {
      setSaving(false);
    }
  }

  // ============================
  // TOGGLE STATUS
  // ============================
  async function toggleStatus() {
    const token = localStorage.getItem("token");
    const newStatus = form.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    await api.patch(
      `/employee-profile/${id}`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setForm((prev) => ({ ...prev, status: newStatus }));
  }

  // ============================
  // ASSIGN DEPARTMENT
  // ============================
  async function assignDepartment() {
    const token = localStorage.getItem("token");

    await api.patch(
      `/employee-profile/${id}`,
      { primaryDepartmentId: selectedDepartmentId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    loadManagersByDepartment(selectedDepartmentId);
    alert("Department assigned ✅");
  }

  // ============================
  // ASSIGN POSITION
  // ============================
  async function assignPosition() {
    const token = localStorage.getItem("token");

    await api.patch(
      `/employee-profile/${id}`,
      { primaryPositionId: selectedPositionId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Position assigned ✅");
  }

  // ============================
  // ASSIGN MANAGER
  // ============================
  async function assignManager() {
    const token = localStorage.getItem("token");

    if (!selectedManagerId) {
      alert("Select manager first ❌");
      return;
    }

    await api.patch(
      `/employee-profile/assign-manager`,
      {
        employeeId: id,
        managerId: selectedManagerId,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Manager assigned ✅");
  }

  if (loading) return <p className="text-white">Loading…</p>;
  if (!employee) return <p className="text-red-400">Employee not found</p>;

  // ============================
  // UI
  // ============================
  return (
    <div className="max-w-4xl mx-auto mt-10 text-white space-y-4">
      <h1 className="text-4xl font-bold">Edit Employee</h1>

      <input className="input" value={form.firstName}
        onChange={(e) => updateField("firstName", e.target.value)} />

      <input className="input" value={form.lastName}
        onChange={(e) => updateField("lastName", e.target.value)} />

      <select className="input" value={form.role}
        onChange={(e) => updateField("role", e.target.value)}>
        <option value="">Select Role</option>
        <option value="DEPARTMENT_EMPLOYEE">Employee</option>
        <option value="DEPARTMENT_HEAD">Department Head</option>
        <option value="HR_EMPLOYEE">HR Employee</option>
        <option value="HR_MANAGER">HR Manager</option>
        <option value="SYSTEM_ADMIN">System Admin</option>
      </select>

      <div>
        Status: {form.status}
        <button onClick={toggleStatus} className="ml-4">
          {form.status === "ACTIVE" ? "Deactivate" : "Activate"}
        </button>
      </div>

      <select className="input" value={selectedDepartmentId}
        onChange={(e) => {
          setSelectedDepartmentId(e.target.value);
          loadManagersByDepartment(e.target.value);
        }}>
        <option value="">Select Department</option>
        {departments.map(d => (
          <option key={d._id} value={d._id}>{d.name}</option>
        ))}
      </select>
      <button onClick={assignDepartment}>Assign Department</button>

      <select className="input" value={selectedPositionId}
        onChange={(e) => setSelectedPositionId(e.target.value)}>
        <option value="">Select Position</option>
        {positions.map(p => (
          <option key={p._id} value={p._id}>{p.title || p.name}</option>
        ))}
      </select>
      <button onClick={assignPosition}>Assign Position</button>

      <select className="input" value={selectedManagerId}
        onChange={(e) => setSelectedManagerId(e.target.value)}>
        <option value="">Select Manager</option>
        {managers.map(m => (
          <option key={m._id} value={m._id}>
            {m.firstName} {m.lastName}
          </option>
        ))}
      </select>
      <button onClick={assignManager}>Assign Manager</button>

      <button onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
