import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../../api/axios";

interface EmployeeProfile {
  _id: string;
  firstName: string;
  lastName: string;
  employeeNumber?: string;
  status?: string;
  dateOfHire?: string;
  workEmail?: string;
  personalEmail?: string;

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

export default function ManagerEmployeeSummaryPage() {
  const router = useRouter();
  const { employeeId } = router.query;

  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) return;

    async function loadEmployee() {
      try {
        const token = localStorage.getItem("token");
        const managerId = localStorage.getItem("userId");

        if (!token || !managerId) {
          router.push("/login");
          return;
        }

        const res = await api.get(
          `/employee-profile/manager/team/${managerId}/employee/${employeeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setEmployee(res.data);
      } catch (err) {
        console.error("❌ Failed to load employee", err);
      } finally {
        setLoading(false);
      }
    }

    loadEmployee();
  }, [employeeId, router]);

  if (loading) {
    return <p className="text-white text-center mt-10">Loading…</p>;
  }

  if (!employee) {
    return <p className="text-red-400 text-center mt-10">Employee not found</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 text-white">
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-bold mb-6">
        {employee.firstName} {employee.lastName}
      </h1>

      <div className="space-y-3 text-lg">
        <p>
          <strong>Employee #:</strong>{" "}
          {employee.employeeNumber || "—"}
        </p>

        <p>
          <strong>Position:</strong>{" "}
          {employee.primaryPositionId?.title ||
            employee.primaryPositionId?.name ||
            "—"}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {employee.status || "—"}
        </p>

        <p>
          <strong>Department:</strong>{" "}
          {employee.primaryDepartmentId?.name || "—"}
        </p>

        <p>
          <strong>Date of Hire:</strong>{" "}
          {employee.dateOfHire
            ? new Date(employee.dateOfHire).toLocaleDateString()
            : "—"}
        </p>

        <p>
          <strong>Work Email:</strong>{" "}
          {employee.workEmail || "—"}
        </p>

        <p>
          <strong>Personal Email:</strong>{" "}
          {employee.personalEmail || "—"}
        </p>
      </div>
    </div>
  );
}
