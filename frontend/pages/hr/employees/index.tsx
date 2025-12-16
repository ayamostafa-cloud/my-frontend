import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../../api/axios";

export default function HREmployeesPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ===============================
     LOAD EMPLOYEES
  =============================== */
  async function loadEmployees() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await api.get(
        "/employee-profile?page=1&limit=200",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEmployees(res.data?.items || res.data || []);
    } catch (err) {
      console.error("❌ Load employees error", err);
      alert("Failed to load employees ❌");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  /* ===============================
     ACTIVATE / DEACTIVATE
  =============================== */
  async function deactivateEmployee(id: string) {
    if (!confirm("Deactivate this employee?")) return;

    const token = localStorage.getItem("token");

    await api.delete(`/employee-profile/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    loadEmployees();
  }

  async function activateEmployee(id: string) {
    if (!confirm("Activate this employee?")) return;

    const token = localStorage.getItem("token");

    await api.patch(
      `/employee-profile/${id}`,
      { status: "ACTIVE" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    loadEmployees();
  }

  if (loading) {
    return (
      <p className="text-white text-center mt-10">
        Loading…
      </p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 text-white">
      <h1 className="text-4xl font-bold mb-6">
        HR – Employees
      </h1>
     <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
            Back
          </button>
      <button
        type="button"
        className="mb-6 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => router.push("/hr/employees/create")}
      >
        + Create Employee
      </button>

      <table className="w-full border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Department</th>
            <th className="p-2 border">Position</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((e) => {
            /* ===== ROLE (ARRAY) ===== */
            const role =
  Array.isArray(e.roles) && e.roles.length > 0
    ? e.roles.join(", ")
    : "—";



            /* ===== DEPARTMENT ===== */
            const department =
              e.primaryDepartmentId &&
              typeof e.primaryDepartmentId === "object"
                ? e.primaryDepartmentId.name
                : "—";

            /* ===== POSITION ===== */
            const position =
              e.primaryPositionId &&
              typeof e.primaryPositionId === "object"
                ? e.primaryPositionId.title ||
                  e.primaryPositionId.name
                : "—";

            return (
              <tr key={e._id} className="text-center">
                <td className="border p-2">
                  {e.firstName} {e.lastName}
                </td>

                <td className="border p-2">
                  {e.role }
                </td>

                <td className="border p-2">
                  {department}
                </td>

                <td className="border p-2">
                  {position}
                </td>

                <td className="border p-2">
                  <span
                    className={
                      e.status === "ACTIVE"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {e.status}
                  </span>
                </td>

                <td className="border p-2 space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/hr/employees/${e._id}`)
                    }
                    className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>

                  {e.status === "ACTIVE" ? (
                    <button
                      type="button"
                      onClick={() =>
                        deactivateEmployee(e._id)
                      }
                      className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        activateEmployee(e._id)
                      }
                      className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                    >
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            );
          })}

          {employees.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="p-4 text-center text-gray-400"
              >
                No employees found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      
    </div>
  );
}
