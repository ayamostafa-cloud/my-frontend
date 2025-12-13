import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../../api/axios";

interface ChangeRequest {
  _id: string;
  employeeProfileId: string;
  field: string;
  newValue: string;
  reason: string;
  status: string;
  dispute?: string;
  resolution?: string;
  createdAt: string;
}

export default function HRChangeRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    async function loadRequests() {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/employee-profile/change-requests/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRequests(res.data || []);
      } catch (err) {
        console.error("❌ Failed to load requests", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, []);

  async function approveRequest(id: string) {
    const token = localStorage.getItem("token");

    await api.patch(
      `/employee-profile/change-requests/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Request approved ✔");
    router.reload();
  }

  async function rejectRequest(id: string) {
    const token = localStorage.getItem("token");

    await api.patch(
      `/employee-profile/change-requests/${id}/reject`,
      { reason: rejectReason },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Request rejected ✔");
    router.reload();
  }

  if (loading) return <p className="text-white text-center mt-10">Loading…</p>;

  return (
    <div className="max-w-4xl mx-auto text-white mt-8">
      <h1 className="text-3xl font-bold mb-6">HR – Manage Change Requests</h1>

      {requests.length === 0 ? (
        <p>No change requests found.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-gray-800 p-5 rounded border border-gray-700 shadow"
            >
              <p><strong>Employee ID:</strong> {req.employeeProfileId}</p>
              <p><strong>Field:</strong> {req.field}</p>
              <p><strong>Requested Value:</strong> {req.newValue}</p>
              <p><strong>Reason:</strong> {req.reason}</p>

              {/* Status */}
              <p className="mt-2">
                <strong>Status:</strong>{" "}
                <span
                  className={
                    req.status === "APPROVED"
                      ? "text-green-400"
                      : req.status === "REJECTED"
                      ? "text-red-400"
                      : req.status === "PENDING"
                      ? "text-yellow-300"
                      : "text-gray-300"
                  }
                >
                  {req.status}
                </span>
              </p>

              {/* HR Action Buttons */}
              {req.status === "PENDING" && (
                <div className="flex gap-3 mt-4">
                  <button
                    className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => approveRequest(req._id)}
                  >
                    Approve
                  </button>

                  <button
                    className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                    onClick={() => {
                      const text = prompt("Enter rejection reason:");
                      if (text) {
                        setRejectReason(text);
                        rejectRequest(req._id);
                      }
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}

              {/* Dispute Section */}
              {req.dispute && (
                <div className="mt-4 bg-gray-700 p-3 rounded">
                  <p><strong>Employee Dispute:</strong> {req.dispute}</p>

                  {req.status !== "RESOLVED" && (
                    <button
                      className="mt-3 bg-blue-600 px-3 py-2 rounded hover:bg-blue-700"
                      onClick={async () => {
                        const resolution = prompt("HR Resolution:");
                        if (!resolution) return;

                        const token = localStorage.getItem("token");
                        await api.patch(
                          `/employee-profile/change-requests/${req._id}/resolve-dispute`,
                          { resolution },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );

                        alert("Dispute resolved ✔");
                        router.reload();
                      }}
                    >
                      Resolve Dispute
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => router.push("/dashboard")}
        className="mt-6 bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
