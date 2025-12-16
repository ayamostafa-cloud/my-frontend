import React, { useState } from "react";
import api from "../api/axios";

export default function LoginPage() {
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setMsg("");

  try {
    const res = await api.post("/auth/login", {
      employeeNumber,
      password,
    });

    const { access_token, payload, isAdmin } = res.data;

    localStorage.setItem("token", access_token);
    localStorage.setItem("role", payload.role);
    localStorage.setItem("userId", payload.id);
    localStorage.setItem("username", payload.username);

    // ✅ ONLY BOOLEAN CHECK
    if (isAdmin) {
      window.location.href = "organization-structure";
    } else {
      window.location.href = "/dashboard";
    }

  } catch (err: any) {
    setMsg(err.response?.data?.message || "Login failed ❌");
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="input"
            placeholder="Employee Number"
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value)}
            required
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn-primary w-full">
            Login
          </button>
        </form>

        {/* MESSAGE */}
        {msg && (
          <p className="text-center mt-4 text-red-400">
            {msg}
          </p>
        )}

        {/* SIGN UP LINK */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm mb-2">
            Don&apos;t have an account?
          </p>

          <button
            type="button"
            onClick={() => (window.location.href = "/register")}
            className="text-blue-400 hover:text-blue-300 underline text-sm"
          >
            Sign up
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = "/")}
            className="text-blue-400 hover:text-blue-300 underline text-sm"
          >
            back
          </button>
        </div>
      </div>
    </div>
  );
}
