// pages/manager/team/[employeeId].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api from "../../../api/axios";

interface TeamEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  status: string;
  department?: string;
  position?: string;
  dateOfHire?: string;
  workEmail?: string;
  personalEmail?: string;
}

export default function TeamEmployeePage() {
  const router = useRouter();
  const { employeeId } = router.query;

  const [emp, setEmp] = useState<TeamEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) return;

    async function load() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const token = localStorage.getItem("token");
        const managerId = localStorage.getItem("userId");

        if (!token || !managerId) {
          router.push("/login");
          return;
        }

        const res = await api.get(
          `/employee-profile/manager/team/${managerId}/employee/${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setEmp(res.data);
      } catch (err: any) {
        console.error("❌ Error loading team employee:", err);
        setErrorMsg(
          err.response?.data?.message || "Failed to load employee summary ❌"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [employeeId, router]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 text-center text-white">
        <h2 className="text-xl font-semibold">Loading employee summary...</h2>
      </div>
    );
  }

  if (!emp) {
    return (
      <div className="max-w-3xl mx-auto mt-10 text-center text-white">
        <h2 className="text-xl font-semibold">Employee not found ❌</h2>
        {errorMsg && <p className="mt-2 text-red-400">{errorMsg}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 text-white">
      <button
        onClick={() => router.back()}
        className="mb-4 px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
      >
        ⬅ Back
      </button>

      <div className="bg-gray-900 rounded-lg shadow p-6 border border-gray-700">
        <h1 className="text-2xl font-bold mb-2">
          {emp.firstName} {emp.lastName}
        </h1>
        <p className="text-gray-300 mb-4">
          Employee #{emp.employeeNumber} • {emp.position || "Position —"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <span className="font-semibold">Status:</span> {emp.status}
            </p>
            <p>
              <span className="font-semibold">Department:</span>{" "}
              {emp.department || "—"}
            </p>
            <p>
              <span className="font-semibold">Date of Hire:</span>{" "}
              {emp.dateOfHire
                ? new Date(emp.dateOfHire).toLocaleDateString()
                : "—"}
            </p>
          </div>

          <div>
            <p>
              <span className="font-semibold">Work Email:</span>{" "}
              {emp.workEmail || "—"}
            </p>
            <p>
              <span className="font-semibold">Personal Email:</span>{" "}
              {emp.personalEmail || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
