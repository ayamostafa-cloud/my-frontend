import React, { useState } from "react";
import api from "../api/axios";

export default function LoginPage() {
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(""); // clear old messages

    console.log("➡️ Sending login request to backend...");

    try {
      const res = await api.post("/auth/login", {
        employeeNumber,
        password,
      });

      console.log("✅ Backend responded:", res.data);

      const data = res.data;

      // Store user data
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", String(data.payload.role));

      localStorage.setItem("userId", data.payload.id);
      localStorage.setItem("username", data.payload.username);

      setMsg("Login successful 🎉");

      const role = data.payload.role;


      // Redirect based on systemRole
      // FIX: match expected role names
      if (role === "DEPARTMENT_EMPLOYEE") {
        window.location.href = "/dashboard";
      } else if (role === "MANAGER" || role === "HEAD") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/dashboard";
      }


    } catch (err: any) {
      console.error("❌ LOGIN ERROR:", err);

      // If backend responded with an error message
      if (err.response) {
        console.error("❌ BACKEND ERROR RESPONSE:", err.response.data);
        setMsg(err.response.data.message || "Login failed ❌");
      } 
      // If request didn't reach backend at all (CORS / URL wrong)
      else {
        console.error("❌ No backend response. Possible CORS or wrong URL.");
        setMsg("Cannot reach server ❌");
      }
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto", paddingTop: 50 }}>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Employee Number"
          value={employeeNumber}
          onChange={(e) => setEmployeeNumber(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}
