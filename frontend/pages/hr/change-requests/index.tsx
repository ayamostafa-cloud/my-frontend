// pages/hr/change-requests/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../../api/axios";

export default function HRChangeRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // LOAD ALL CHANGE REQUESTS (HR)
  // ===============================
  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return router.push("/login");

        const res = await api.get(
          "/employee-profile/change-requests/all",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRequests(res.data || []);
      } catch (e) {
        router.push("/login");
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

  function getField(req: any): string {
    if (req.field) return req.field;

    if (req.requestDescription?.startsWith("{")) {
      try {
        return JSON.parse(req.requestDescription).field || "—";
      } catch {
        return "—";
      }
    }

    if (isDispute(req)) {
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
      } catch {
        return "—";
      }
    }

    if (isDispute(req)) {
      const originalId = req.requestDescription.replace("disputeFor:", "").trim();
      const original = requests.find(
        (r) => r._id === originalId || r.requestId === originalId
      );
      if (original) return getNewValue(original);
    }

    return "—";
  }

  // ===============================
  // ACTIONS
  // ===============================
  async function approve(id: string) {
    const token = localStorage.getItem("token");
    await api.patch(
      `/employee-profile/change-requests/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    router.reload();
  }

  async function reject(id: string) {
    const reason = prompt("Rejection reason:");
    if (!reason) return;

    const token = localStorage.getItem("token");
    await api.patch(
      `/employee-profile/change-requests/${id}/reject`,
      { reason },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    router.reload();
  }

  async function approveDispute(id: string) {
    const resolution = prompt("Approval comment:");
    if (!resolution) return;

    const token = localStorage.getItem("token");
    await api.patch(
      `/employee-profile/change-requests/${id}/approve-dispute`,
      { resolution },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    router.reload();
  }

  async function resolveDispute(id: string) {
    const resolution = prompt("Resolution comment:");
    if (!resolution) return;

    const token = localStorage.getItem("token");
    await api.patch(
      `/employee-profile/change-requests/${id}/resolve-dispute`,
      { resolution },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    router.reload();
  }

  // ===============================
  // UI
  // ===============================
  if (loading) return <p className="text-white mt-10">Loading…</p>;

  return (
    <div className="max-w-5xl mx-auto text-white mt-10">
      <h1 className="text-3xl font-bold mb-6">
        HR – Manage Change Requests
      </h1>
      <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
            Back
          </button>
      {requests.length === 0 && (
        <p className="text-gray-400">No change requests found.</p>
      )}

      {requests.map((req) => (
        <div key={req._id} className="bg-gray-800 p-5 mb-4 rounded">
          <p><b>Employee:</b> {req.employeeProfileId}</p>
          <p><b>Field:</b> {getField(req)}</p>
          <p><b>New Value:</b> {getNewValue(req)}</p>

          <p className="mt-2">
            <b>Status:</b>{" "}
            <span
              className={
                req.status === "APPROVED"
                  ? "text-green-400"
                  : req.status === "REJECTED"
                  ? "text-red-400"
                  : "text-yellow-300"
              }
            >
              {isDispute(req)
                ? req.status === "PENDING"
                  ? "DISPUTE PENDING"
                  : req.status === "APPROVED"
                  ? "DISPUTE APPROVED"
                  : "DISPUTE RESOLVED"
                : req.status}
            </span>
          </p>

          <p><b>HR Comment:</b> {req.reason || "—"}</p>

          {/* NORMAL REQUEST */}
          {req.status === "PENDING" && !isDispute(req) && (
            <div className="mt-3 flex gap-3">
              <button
                className="bg-green-600 px-4 py-1 rounded"
                onClick={() => approve(req._id)}
              >
                Approve
              </button>
              <button
                className="bg-red-600 px-4 py-1 rounded"
                onClick={() => reject(req._id)}
              >
                Reject
              </button>
            </div>
          )}

          {/* DISPUTE */}
          {isDispute(req) && req.status === "PENDING" && (
            <div className="mt-3 flex gap-3">
              <button
                className="bg-green-600 px-4 py-1 rounded"
                onClick={() => approveDispute(req._id)}
              >
                Approve Dispute
              </button>
              <button
                className="bg-yellow-600 px-4 py-1 rounded"
                onClick={() => resolveDispute(req._id)}
              >
                Resolve Dispute
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
