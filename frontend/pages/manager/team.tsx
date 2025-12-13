// pages/manager/team.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../api/axios";

interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  status: string;
  department?: string;
  position?: string;
  dateOfHire?: string;
}

export default function ManagerTeamPage() {
  const router = useRouter();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const token = localStorage.getItem("token");
        const managerId = localStorage.getItem("userId"); // from login payload

        if (!token || !managerId) {
          router.push("/login");
          return;
        }

        const res = await api.get(
          `/employee-profile/manager/team/${managerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTeam(res.data || []);
      } catch (err: any) {
        console.error("❌ Error loading team:", err);
        setErrorMsg(
          err.response?.data?.message || "Failed to load your team ❌"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-10 text-center text-white">
        <h2 className="text-xl font-semibold">Loading your team...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Team</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-sm"
        >
          ⬅ Back to Dashboard
        </button>
      </div>

      {errorMsg && (
        <p className="mb-4 text-red-400 font-medium">{errorMsg}</p>
      )}

      {team.length === 0 ? (
        <p>No team members found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800 text-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Employee</th>
                <th className="px-4 py-2 text-left">Employee #</th>
                <th className="px-4 py-2 text-left">Department</th>
                <th className="px-4 py-2 text-left">Position</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date of Hire</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900">
              {team.map((emp) => (
                <tr
                  key={emp._id}
                  className="border-t border-gray-800 hover:bg-gray-800/60"
                >
                  <td className="px-4 py-2">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-4 py-2">{emp.employeeNumber}</td>
                  <td className="px-4 py-2">{emp.department || "—"}</td>
                  <td className="px-4 py-2">{emp.position || "—"}</td>
                  <td className="px-4 py-2">{emp.status}</td>
                  <td className="px-4 py-2">
                    {emp.dateOfHire
                      ? new Date(emp.dateOfHire).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() =>
                        router.push(`/manager/team/${emp._id}`)
                      }
                      className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-xs"
                    >
                      View Summary
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
