import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../../api/axios";

interface ChangeRequest {
  _id: string;
  field: string;
  newValue: string;
  reason: string;
  status: string;
  hrComment?: string;
  createdAt: string;
}

export default function EmployeeChangeRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [employeeId, setEmployeeId] = useState("");

  // -----------------------------------------
  // Load employee ID + fetch change requests
  // -----------------------------------------
  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) {
      router.push("/login");
      return;
    }
    setEmployeeId(id);
    fetchRequests(id);
  }, [router]);

  async function fetchRequests(id: string) {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await api.get(
        `/employee-profile/change-requests/by-employee/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests(res.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to load change requests ❌");
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------
  // Withdraw request
  // -----------------------------------------
  async function handleWithdraw(id: string) {
    try {
      const token = localStorage.getItem("token");

      await api.patch(
        `/employee-profile/change-requests/${id}/withdraw`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMsg("Request withdrawn successfully ✔");
      fetchRequests(employeeId);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Could not withdraw request ❌");
    }
  }

  // -----------------------------------------
  // UI Rendering
  // -----------------------------------------

  if (loading) {
    return (
      <h2 className="text-center text-lg mt-10">Loading your requests...</h2>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">My Change Requests</h1>

      {errorMsg && <p className="text-red-600 text-center mb-4">{errorMsg}</p>}
      {successMsg && <p className="text-green-600 text-center mb-4">{successMsg}</p>}

      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => router.push("/employee-profile/change-request/new")}
        >
          + New Change Request
        </button>
      </div>

      {requests.length === 0 ? (
        <p className="text-gray-500 text-center">You have not submitted any requests yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3 border">Field</th>
              <th className="p-3 border">New Value</th>
              <th className="p-3 border">Reason</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">HR Comment</th>
              <th className="p-3 border text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((req) => (
              <tr key={req._id} className="hover:bg-gray-50">
                <td className="p-3 border">{req.field}</td>
                <td className="p-3 border">{req.newValue}</td>
                <td className="p-3 border">{req.reason}</td>

                <td
                  className={`p-3 border font-semibold ${
                    req.status === "APPROVED"
                      ? "text-green-600"
                      : req.status === "REJECTED"
                      ? "text-red-600"
                      : req.status === "CANCELED"
                      ? "text-gray-500"
                      : "text-yellow-600"
                  }`}
                >
                  {req.status}
                </td>

                <td className="p-3 border"> {req.hrComment ? req.hrComment : "—"}</td>

                <td className="p-3 border text-center">
                  {req.status === "PENDING" ? (
                    <button
                      onClick={() => handleWithdraw(req._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Withdraw
                    </button>
                  ) : (
                    <span className="text-gray-400">No Actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        className="w-full mt-6 bg-gray-300 py-2 rounded hover:bg-gray-400"
        onClick={() => router.push("/employee-profile")}
      >
        Back to Profile
      </button>
    </div>
  );
}
