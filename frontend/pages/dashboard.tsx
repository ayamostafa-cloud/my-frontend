import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
export default function Dashboard() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("username");
    const savedRole = localStorage.getItem("role");

    if (!token) {
      router.push("/login");
      return;
    }

    setUsername(savedUser || "Unknown User");
    setRole(savedRole || "");
   

    setLoading(false);
  }, []);

  function handleLogout() {
    localStorage.clear();
    router.push("/login");
  }

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div style={{ maxWidth: 800, margin: "auto", paddingTop: 40 }}>
      <h1>Welcome to HR System Dashboard</h1>
      <h2>Hello, {username} 👋</h2>
      <p>Your Role: <strong>{role}</strong></p>

      <hr style={{ margin: "20px 0" }} />

      {/* ROLE BASED OPTIONS */}
      {role === "HR Employee" && (
        <div>
          <h3>HR Panel</h3>
          <ul>
            <li>✔ Manage Employees</li>
            <li>✔ Manage Departments</li>
            <li>✔ Approve Change Requests</li>
          </ul>
          {/* HR + Manager button */}
          <p>
            <button
              onClick={() => router.push("/hr/change-requests")}
              style={{
                marginTop: 10,
                padding: "10px 20px",
                cursor: "pointer",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 5,
              }}
            >
              Manage Change Requests
            </button>

            <button
      onClick={() => router.push("/hr/employees")}
      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
    >
      Manage Employees
    </button>
          </p>
        </div>
      )}

      {role === "department head" && (
        <div>
          <h3>Manager Panel</h3>
          <ul>
            <li>✔ View Team</li>
            <li>✔ Approve Employee Requests</li>
          </ul>
          {/* Manager Approval Button */}
          <p>
            <button
              onClick={() => router.push("/hr/change-requests")}
              style={{
                marginTop: 10,
                padding: "10px 20px",
                cursor: "pointer",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 5,
              }}
            >
              Review Change Requests
            </button>
            <button
      onClick={() => router.push("/manager/team")}
      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
    >
      View My Team
    </button>
          </p>
        </div>
      )}

      
{role === "department employee" && (
  <div>
    <h3>Employee Panel</h3>
    <ul>
      <li>✔ View My Profile</li>
      <li>✔ Submit Change Request</li>
      <li>✔ View My Department</li>
    </ul>

    <p>
      <Link href="/employee-profile">
        <button>Go to My Employee Profile</button>
      </Link>
    </p>
  </div>
)}


      <button
        onClick={handleLogout}
        style={{
          marginTop: 30,
          padding: "10px 20px",
          cursor: "pointer",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: 5,
        }}
      >
        Logout
        
      </button>
    </div>
  );
}
