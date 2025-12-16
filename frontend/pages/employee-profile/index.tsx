// pages/employee-profile/index.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../api/axios";

export default function EmployeeProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return router.push("/login");

        const res = await api.get("/employee-profile/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(res.data);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading…</p>;
  if (!profile) return <p>Profile not found ❌</p>;

  const fullName = `${profile.firstName} ${profile.lastName}`;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 text-white">
      <h1 className="text-3xl font-bold mb-2">Employee Profile</h1>
      <p className="text-lg mb-4">Welcome, {fullName} 👋</p>

      <section className="bg-gray-800 p-6 rounded mt-4">
        <h2 className="text-xl font-bold mb-2">Basic Information</h2>
        <p><strong>Employee Number:</strong> {profile.employeeNumber}</p>
        <p><strong>National ID:</strong> {profile.nationalId}</p>
        <p><strong>Date of Hire:</strong> {new Date(profile.dateOfHire).toLocaleDateString()}</p>
        <p><strong>Status:</strong> {profile.status}</p>
      </section>

      <section className="bg-gray-800 p-6 rounded mt-4">
        <h2 className="text-xl font-bold mb-2">Contact Information</h2>
        <p><strong>Personal Email:</strong> {profile.personalEmail || "—"}</p>
        <p><strong>Work Email:</strong> {profile.workEmail || "—"}</p>
        <p><strong>Phone:</strong> {profile.phone || "—"}</p>
        <p>
          <strong>Address:</strong>{" "}
          {profile.address
            ? `${profile.address.street}, ${profile.address.city}, ${profile.address.country}`
            : "—"}
        </p>
      </section>

      <section className="bg-gray-800 p-6 rounded mt-4">
        <h2 className="text-xl font-bold mb-2">Biography</h2>
        <p>{profile.biography || "—"}</p>
      </section>

      {/* ACTIONS */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => router.push("/employee-profile/update")}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Profile
        </button>

        <button
          onClick={() => router.push("/employee-profile/change-request")}
          className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
        >
          View Change Requests
        </button>
        <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
            Back
          </button>
      </div>
    </div>
  );
}
