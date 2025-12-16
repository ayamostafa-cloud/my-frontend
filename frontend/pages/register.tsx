import React, { useState } from "react";
import { useRouter } from "next/router";
import api from "../api/axios";

type HRRole = "HR_ADMIN" | "HR_MANAGER" | "HR_EMPLOYEE" | "";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    employeeNumber: "",
    password: "",
    firstName: "",
    lastName: "",
    nationalId: "",
    dateOfHire: "",
    city: "",
    street: "",
    role: "" as HRRole,
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ===============================
  // ✅ VALIDATE EMPLOYEE NUMBER
  // ===============================
  function isValidHRNumber(employeeNumber: string, role: HRRole) {
    const n = employeeNumber.toUpperCase();
     
    if (role === "HR_ADMIN") return n.startsWith("HRADM");
    if (role === "HR_MANAGER")
      return n.startsWith("HRMAN") || n.startsWith("HRM");
    if (role === "HR_EMPLOYEE") return n.startsWith("HRE");

    return false;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!form.role) {
      setMsg("Please select HR role ❌");
      return;
    }

    if (!isValidHRNumber(form.employeeNumber, form.role)) {
      setMsg(
        `Employee number does NOT match selected role ❌`
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        employeeNumber: form.employeeNumber,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        nationalId: form.nationalId,
        dateOfHire: form.dateOfHire,
        role: form.role,
        address: {
          city: form.city,
          street: form.street,
        },
      });

      alert("HR account registered successfully ✅");
      router.push("/login");
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Registration failed ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="w-full max-w-md p-8 rounded bg-gray-900 border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-6">
          HR Registration
        </h1>

        <form onSubmit={handleRegister} className="space-y-3">
          <input
            className="input"
            placeholder="HR Number "
            value={form.employeeNumber}
            onChange={(e) =>
              update("employeeNumber", e.target.value)
            }
            required
          />

          
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
          />

          <input
            className="input"
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            required
          />

          <input
            className="input"
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            required
          />

          <input
            className="input"
            placeholder="National ID"
            value={form.nationalId}
            onChange={(e) => update("nationalId", e.target.value)}
            required
          />
           {/* ✅ HR ROLE ONLY */}
          <select
            className="input"
            value={form.role}
            onChange={(e) =>
              update("role", e.target.value)
            }
            required
          >
            <option value="">Select HR Role</option>
            <option value="HR_ADMIN">HR Admin</option>
            <option value="HR_MANAGER">HR Manager</option>
            <option value="HR_EMPLOYEE">HR Employee</option>
          </select>

          <input
            className="input"
            type="date"
            value={form.dateOfHire}
            onChange={(e) => update("dateOfHire", e.target.value)}
            required
          />

          <input
            className="input"
            placeholder="City"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />

          <input
            className="input"
            placeholder="Street"
            value={form.street}
            onChange={(e) => update("street", e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
             onClick={() => (window.location.href = "/login")}
            className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Registering..." : "Register HR"}
            
          </button>
        </form>

        {msg && (
          <p className="text-center mt-4 text-red-400">
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
