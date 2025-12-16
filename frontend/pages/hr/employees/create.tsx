import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../../api/axios";

export default function CreateEmployeePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");

  const [form, setForm] = useState<any>({
    firstName: "",
    lastName: "",
    nationalId: "",
    employeeNumber: "",
    password: "",
    phone: "",
    personalEmail: "",
    dateOfHire: "",
    role: "",
    contractType: undefined,
    workType: undefined,
    status: "ACTIVE",
    primaryDepartmentId: "",
    primaryPositionId: "",
    address: {
      street: "",
      city: "",
      country: "",
    },
  });

  // ===============================
  // LOAD DEPARTMENTS & POSITIONS
  // ===============================
  useEffect(() => {
    async function loadBaseData() {
      const token = localStorage.getItem("token");

      try {
        const [d, p] = await Promise.all([
          api.get("/organization-structure/departments", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/organization-structure/positions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setDepartments(d.data?.items || d.data || []);
        setPositions(p.data?.items || p.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load departments or positions ❌");
      }
    }

    loadBaseData();
  }, []);

  // ===============================
  // LOAD MANAGERS BY DEPARTMENT
  // ===============================
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
      console.error("Failed to load managers", err);
      setManagers([]);
      alert("Failed to load managers ❌");
    }
  }

  // ===============================
  // HELPERS
  // ===============================
  function updateField(field: string, value: any) {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  }

  function updateAddress(field: string, value: string) {
    setForm((prev: any) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  }

  function cleanPayload(data: any) {
    const cleaned = JSON.parse(JSON.stringify(data));

    Object.keys(cleaned).forEach((k) => {
      if (cleaned[k] === "") cleaned[k] = undefined;

      if (
        typeof cleaned[k] === "object" &&
        cleaned[k] !== null
      ) {
        Object.keys(cleaned[k]).forEach((x) => {
          if (cleaned[k][x] === "") cleaned[k][x] = undefined;
        });
      }
    });

    return cleaned;
  }

  // ===============================
  // SUBMIT
  // ===============================
  async function submit() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const payload = cleanPayload(form);

      // 1️⃣ CREATE EMPLOYEE
      const res = await api.post("/employee-profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const employeeId = res.data._id;

      // 2️⃣ ASSIGN MANAGER (OPTIONAL)
      if (selectedManagerId) {
        await api.patch(
          "/employee-profile/assign-manager",
          {
            employeeId,
            managerId: selectedManagerId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert("Employee created successfully ✅");
      router.push("/hr/employees");
    } catch (e: any) {
      console.error(e?.response?.data || e);
      alert("Create employee failed ❌");
    } finally {
      setLoading(false);
    }
  }

  // ===============================
  // UI
  // ===============================
  return (
    <div className="max-w-3xl mx-auto mt-10 text-white">
      <h1 className="text-4xl font-bold mb-6">Create Employee</h1>

      <div className="space-y-4">
        <input className="input" placeholder="First Name"
          value={form.firstName}
          onChange={(e) => updateField("firstName", e.target.value)} />

        <input className="input" placeholder="Last Name"
          value={form.lastName}
          onChange={(e) => updateField("lastName", e.target.value)} />

        <input className="input" placeholder="National ID"
          value={form.nationalId}
          onChange={(e) => updateField("nationalId", e.target.value)} />

        <input className="input" placeholder="Employee Number"
          value={form.employeeNumber}
          onChange={(e) => updateField("employeeNumber", e.target.value)} />

        <input className="input" type="password" placeholder="Password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)} />

        <input className="input" placeholder="Phone"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)} />

        <input className="input" placeholder="Personal Email"
          value={form.personalEmail}
          onChange={(e) => updateField("personalEmail", e.target.value)} />

        <input className="input" type="date"
          value={form.dateOfHire}
          onChange={(e) => updateField("dateOfHire", e.target.value)} />

        {/* ROLE */}
        <select
          className="input"
          value={form.role}
          onChange={(e) => updateField("role", e.target.value)}
        >
          <option value="">Select Role</option>
          <option value="DEPARTMENT_EMPLOYEE">Department Employee</option>
          <option value="DEPARTMENT_HEAD">Department Head (Manager)</option>
          <option value="HR_EMPLOYEE">HR Employee</option>
          <option value="HR_MANAGER">HR Manager</option>
          <option value="SYSTEM_ADMIN">System Admin</option>
        </select>

        {/* DEPARTMENT */}
        <select
          className="input"
          value={form.primaryDepartmentId}
          onChange={(e) => {
            const deptId = e.target.value;
            updateField("primaryDepartmentId", deptId);

            if (deptId) {
              loadManagersByDepartment(deptId);
            } else {
              setManagers([]);
            }
          }}
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

        {/* POSITION */}
        <select
          className="input"
          value={form.primaryPositionId}
          onChange={(e) => updateField("primaryPositionId", e.target.value)}
        >
          <option value="">Select Position</option>
          {positions.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title || p.name}
            </option>
          ))}
        </select>

        {/* ASSIGN MANAGER */}
        <select
          className="input"
          value={selectedManagerId}
          onChange={(e) => setSelectedManagerId(e.target.value)}
        >
          <option value="">Assign Manager (Optional)</option>
          {managers.map((m) => (
            <option key={m._id} value={m._id}>
              {m.firstName} {m.lastName} ({m.employeeNumber})
            </option>
          ))}
        </select>

        {/* ADDRESS */}
        <input className="input" placeholder="Street"
          value={form.address.street}
          onChange={(e) => updateAddress("street", e.target.value)} />

        <input className="input" placeholder="City"
          value={form.address.city}
          onChange={(e) => updateAddress("city", e.target.value)} />

        <input className="input" placeholder="Country"
          value={form.address.country}
          onChange={(e) => updateAddress("country", e.target.value)} />

        <button
          onClick={submit}
          disabled={loading}
          className="bg-green-600 px-6 py-3 rounded w-full hover:bg-green-700"
        >
          {loading ? "Creating..." : "Create Employee"}
        </button>
      </div>
      <button
            type="button"
            onClick={() => router.push("/hr/employees")}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
            Back
          </button>
    </div>
  );
}
