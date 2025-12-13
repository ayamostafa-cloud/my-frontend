import React, { useState } from "react";
import api from "../api/axios";

export default function RegisterPage() {
  const [form, setForm] = useState({
    employeeNumber: "",
    password: "",
    firstName: "",
    lastName: "",
    nationalId: "",
    dateOfHire: "",
    role: "HR Employee",
    city: "",
    street: "",
  });

  const [msg, setMsg] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const res = await api.post("/auth/register", {
        employeeNumber: form.employeeNumber,
        password: form.password,
        role: form.role,
        firstName: form.firstName,
        lastName: form.lastName,
        nationalId: form.nationalId,
        dateOfHire: form.dateOfHire,
        address: { city: form.city, street: form.street },
      });

      setMsg("Employee registered successfully 🎉");

    } catch (err: any) {
      setMsg(err.response?.data?.message || "Registration failed ❌");
    }
     window.location.href = "/login";
  }

  return (
    <div style={{ maxWidth: 450, margin: "auto", paddingTop: 50 }}>
      <h1>Register Employee</h1>

      <form onSubmit={handleRegister}>
        <input placeholder="Employee Number"
               value={form.employeeNumber}
               onChange={(e) => update("employeeNumber", e.target.value)}
               required />

        <input placeholder="Password" type="password"
               value={form.password}
               onChange={(e) => update("password", e.target.value)}
               required />

        <input placeholder="First Name"
               value={form.firstName}
               onChange={(e) => update("firstName", e.target.value)}
               required />

        <input placeholder="Last Name"
               value={form.lastName}
               onChange={(e) => update("lastName", e.target.value)}
               required />

        <input placeholder="National ID"
               value={form.nationalId}
               onChange={(e) => update("nationalId", e.target.value)}
               required />

        <label>Date of Hire</label>
        <input type="date"
               value={form.dateOfHire}
               onChange={(e) => update("dateOfHire", e.target.value)}
               required />

        <label>Role</label>
        <select value={form.role}
                onChange={(e) => update("role", e.target.value)}>
          <option>department employee</option>
          <option>department head</option>
          <option>HR Manager</option>
          <option>HR Employee</option>
          <option>Payroll Specialist</option>
          <option>Payroll Manager</option>
          <option>System Admin</option>
          <option>Legal & Policy Admin</option>
          <option>Recruiter</option>
          <option>Finance Staff</option>
          <option>Job Candidate</option>
          <option>HR Admin</option>
        </select>

        <input placeholder="City"
               value={form.city}
               onChange={(e) => update("city", e.target.value)}
               required />

        <input placeholder="Street"
               value={form.street}
               onChange={(e) => update("street", e.target.value)}
               required />

        <button type="submit">Register</button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}
