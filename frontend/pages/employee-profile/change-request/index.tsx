import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../../api/axios";

export default function EmployeeChangeRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // LOAD MY CHANGE REQUESTS
  // ===============================
  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        router.push("/login");
        return;
      }

      try {
        const res = await api.get(
          `/employee-profile/change-requests/by-employee/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRequests(res.data || []);
      } catch {
        alert("Failed to load requests ❌");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  // ===============================
  // HELPERS
  // ===============================
  function isDispute(req: any) {
    return req.requestDescription?.startsWith("disputeFor:");
  }

  function isWithdrawn(req: any) {
    return (
      req.reason?.toLowerCase().includes("withdraw") ||
      req.reason?.toLowerCase().includes("withdrawn")
    );
  }

  function getField(req: any): string {
    if (req.field) return req.field;

    if (req.requestDescription?.startsWith("{")) {
      try {
        return JSON.parse(req.requestDescription).field || "—";
      } catch {}
    }

    if (req.requestDescription?.startsWith("disputeFor:")) {
      const originalId = req.requestDescription.replace("disputeFor:", "").trim();
      const original = requests.find(
        (r) => r._id === originalId || r.requestId === originalId
      );

      if (original) return getField(original);
    }

    return "—";
  }

  function getNewValue(req: any): string {
    if (req.newValue) return req.newValue;

    if (req.requestDescription?.startsWith("{")) {
      try {
        return JSON.parse(req.requestDescription).newValue || "—";
      } catch {}
    }

    if (req.requestDescription?.startsWith("disputeFor:")) {
      const originalId = req.requestDescription.replace("disputeFor:", "").trim();
      const original = requests.find(
        (r) => r._id === originalId || r.requestId === originalId
      );

      if (original) return getNewValue(original);
    }

    return "—";
  }

  // ===============================
  // EMPLOYEE REASON
  // ===============================
  function getEmployeeReason(req: any): string {
    if (isDispute(req)) {
      return req.status === "PENDING" ? req.reason || "—" : "—";
    }

    if (req.requestDescription?.startsWith("{")) {
      try {
        return JSON.parse(req.requestDescription).reason || "—";
      } catch {}
    }

    return req.status === "PENDING" ? req.reason || "—" : "—";
  }

  // ===============================
  // HR COMMENT
  // ===============================
  function getHrComment(req: any): string {
    return req.status === "PENDING" ? "—" : req.reason || "—";
  }

  // ===============================
  // WITHDRAW
  // ===============================
  async function withdraw(id: string) {
    if (!confirm("Withdraw request?")) return;

    const token = localStorage.getItem("token");

    await api.patch(
      `/employee-profile/change-requests/${id}/withdraw`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    router.reload();
  }

  // ===============================
  // SUBMIT DISPUTE
  // ===============================
  async function submitDispute(originalRequestId: string) {
    const dispute = prompt("Explain why you disagree:");
    if (!dispute) return;

    const token = localStorage.getItem("token");
    const employeeProfileId = localStorage.getItem("userId");

    await api.post(
      `/employee-profile/change-requests/${originalRequestId}/dispute`,
      { employeeProfileId, dispute },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Dispute submitted ✅");
    router.reload();
  }

  // ===============================
  // UI
  // ===============================
  if (loading) return <p className="text-center mt-10">Loading…</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 text-white">
      <h1 className="text-3xl font-bold mb-6">My Change Requests</h1>

      <button
        className="mb-4 bg-blue-600 px-4 py-2 rounded"
        onClick={() => router.push("/employee-profile/change-request/new")}
      >
        + New Change Request
      </button>


      <table className="w-full border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 border">Field</th>
            <th className="p-2 border">New Value</th>
            <th className="p-2 border">Reason</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">HR Comment</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((req) => (
            <tr key={req._id} className="text-center">
              <td className="border p-2">{getField(req)}</td>
              <td className="border p-2">{getNewValue(req)}</td>
              <td className="border p-2">{getEmployeeReason(req)}</td>

              <td className="border p-2">
                <span
                  className={
                    req.status === "APPROVED"
                      ? "text-green-400"
                      : req.status === "REJECTED"
                      ? "text-red-400"
                      : "text-yellow-300"
                  }
                >
                  {req.status}
                </span>
              </td>

              <td className="border p-2">{getHrComment(req)}</td>

              <td className="border p-2">
                {req.status === "PENDING" && (
                  <button
                    className="bg-red-600 px-3 py-1 rounded"
                    onClick={() => withdraw(req._id)}
                  >
                    Withdraw
                  </button>
                )}

                {req.status === "REJECTED" &&
                  !isDispute(req) &&
                  !isWithdrawn(req) && (
                    <button
                      className="bg-blue-600 px-3 py-1 rounded ml-2"
                      onClick={() => submitDispute(req._id)}
                    >
                      Dispute
                    </button>
                  )}

                {(req.status === "APPROVED" ||
                  (req.status === "REJECTED" &&
                    (isWithdrawn(req) || isDispute(req)))) && (
                  <span className="text-gray-400">No action</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
            type="button"
            onClick={() => (window.location.href = "/employee-profile")}
            className="text-blue-400 hover:text-blue-300 underline text-sm"
          >
            back
          </button>
    </div>
  );
}
