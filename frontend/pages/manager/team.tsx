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
  dateOfHire?: string;

  primaryDepartmentId?: {
    _id: string;
    name: string;
  };

  primaryPositionId?: {
    _id: string;
    title?: string;
    name?: string;
  };
}

export default function ManagerTeamPage() {
  const router = useRouter();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        const managerId = localStorage.getItem("userId");

        if (!token || !managerId) {
          router.push("/login");
          return;
        }

        const res = await api.get(
          `/employee-profile/manager/team/${managerId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTeam(res.data || []);
      } catch (err: any) {
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
    return <p className="text-center text-white mt-10">Loading...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4 text-white">
      <h1 className="text-3xl font-bold mb-6">My Team</h1>

      {errorMsg && <p className="text-red-400">{errorMsg}</p>}
      <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
            Back
          </button>
      <table className="w-full border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2">Employee</th>
            <th className="p-2">Employee #</th>
            <th className="p-2">Department</th>
            <th className="p-2">Position</th>
            <th className="p-2">Status</th>
            <th className="p-2">Date of Hire</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {team.map((emp) => (
            <tr key={emp._id} className="text-center border-t">
              <td>{emp.firstName} {emp.lastName}</td>
              <td>{emp.employeeNumber}</td>
              <td>{emp.primaryDepartmentId?.name || "—"}</td>
              <td>
                {emp.primaryPositionId?.title ||
                 emp.primaryPositionId?.name ||
                 "—"}
              </td>
              <td>{emp.status}</td>
              <td>
                {emp.dateOfHire
                  ? new Date(emp.dateOfHire).toLocaleDateString()
                  : "—"}
              </td>
              <td>
                <button
                  onClick={() => router.push(`/manager/team/${emp._id}`)}
                  className="bg-blue-600 px-3 py-1 rounded"
                >
                  View Summary
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>
  );
}
