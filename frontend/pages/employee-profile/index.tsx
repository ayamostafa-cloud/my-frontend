// pages/employee-profile/index.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../api/axios";

interface Address {
  street?: string;
  city?: string;
  country?: string;
  streetAddress?: string;
}

interface EmployeeProfile {
  _id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  nationalId: string;
  employeeNumber: string;
  dateOfHire: string;
  status: string;
  workEmail?: string;
  personalEmail?: string;
  mobilePhone?: string;
  phone?: string;
  biography?: string;
  address?: Address;
  [key: string]: any;
}

export default function EmployeeProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    phone: "",
    personalEmail: "",
    workEmail: "",
    biography: "",
    address: {
      street: "",
      city: "",
      country: "",
    },
  });

  // ---------------- LOAD PROFILE ----------------
  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return router.push("/login");

        const res = await api.get("/employee-profile/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setProfile(data);

        setFormData({
          phone: data.phone || data.mobilePhone || "",
          personalEmail: data.personalEmail || "",
          workEmail: data.workEmail || "",
          biography: data.biography || "",
          address: {
            street: data.address?.street || data.address?.streetAddress || "",
            city: data.address?.city || "",
            country: data.address?.country || "",
          },
        });
      } catch (err: any) {
        console.error("❌ Error:", err);
        if (err.response?.status === 401) router.push("/login");
        setErrorMsg("Failed to load profile ❌");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // ---------------- INPUT HANDLER ----------------
  function handleChange(e: any) {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  // ---------------- SUBMIT UPDATE ----------------
  async function handleSelfUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const res = await api.patch("/employee-profile/self-update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(res.data);
      setSuccessMsg("Profile updated successfully ✅");
      setErrorMsg(null);
    } catch (err: any) {
      console.error("❌ Update error:", err);
      setErrorMsg("Could not update profile ❌");
    }
  }

  if (loading)
    return <p className="text-center mt-10 text-lg">Loading profile...</p>;
  if (!profile)
    return (
      <p className="text-center mt-10 text-red-500">Profile not found ❌</p>
    );

  const fullName =
    profile.fullName || `${profile.firstName} ${profile.lastName}`;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 text-white">
      <h1 className="text-3xl font-bold mb-3">Employee Profile</h1>
      <p className="text-lg">
        Welcome, <span className="font-semibold">{fullName}</span> 👋
      </p>

      {errorMsg && <p className="text-red-400 mt-3">{errorMsg}</p>}
      {successMsg && <p className="text-green-400 mt-3">{successMsg}</p>}

      {/* ---------------- BASIC INFO ---------------- */}
      <section className="bg-gray-800 p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-bold mb-3">Basic Information</h2>
        <p>
          <strong>Employee Number:</strong> {profile.employeeNumber}
        </p>
        <p>
          <strong>National ID:</strong> {profile.nationalId}
        </p>
        <p>
          <strong>Date of Hire:</strong>{" "}
          {new Date(profile.dateOfHire).toLocaleDateString()}
        </p>
        <p>
          <strong>Status:</strong> {profile.status}
        </p>
      </section>

      {/* ---------------- CONTACT INFO ---------------- */}
      <section className="bg-gray-800 p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-bold mb-3">Contact Information</h2>
        <p>
          <strong>Personal Email:</strong> {profile.personalEmail || "—"}
        </p>
        <p>
          <strong>Work Email:</strong> {profile.workEmail || "—"}
        </p>
        <p>
          <strong>Phone:</strong> {profile.phone || profile.mobilePhone || "—"}
        </p>
        <p>
          <strong>Address:</strong>{" "}
          {profile.address
            ? `${profile.address.street || ""}, ${
                profile.address.city || ""
              }, ${profile.address.country || ""}`
            : "—"}
        </p>
      </section>

      {/* ---------------- BIO ---------------- */}
      <section className="bg-gray-800 p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-bold mb-3">Biography</h2>
        <p>{profile.biography || "No biography added yet."}</p>
      </section>

      {/* ---------------- UPDATE FORM ---------------- */}
      <section className="bg-gray-900 p-6 rounded-lg shadow mt-6 border border-blue-500">
        <h2 className="text-xl font-bold mb-4">Update Your Contact Information</h2>

        <form onSubmit={handleSelfUpdate} className="space-y-4">
          <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
          <Input label="Personal Email" name="personalEmail" value={formData.personalEmail} onChange={handleChange} />
          <Input label="Work Email" name="workEmail" value={formData.workEmail} onChange={handleChange} />

          <div>
            <label className="block font-semibold mb-1">Biography</label>
            <textarea
              name="biography"
              rows={3}
              value={formData.biography}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
          </div>

          <h3 className="font-bold mt-4">Address</h3>
          <Input label="Street" name="address.street" value={formData.address.street} onChange={handleChange} />
          <Input label="City" name="address.city" value={formData.address.city} onChange={handleChange} />
          <Input label="Country" name="address.country" value={formData.address.country} onChange={handleChange} />

          <button className="mt-4 bg-blue-600 px-4 py-2 rounded shadow hover:bg-blue-700">
            Save Changes
          </button>
        </form>

        {/* ---------------- CHANGE REQUEST BUTTONS ---------------- */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            type="button"
            onClick={() =>
              router.push("/employee-profile/change-request/new")
            }
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
          >
            + Submit New Change Request
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/employee-profile/change-request")
            }
            className="w-full sm:w-auto bg-gray-600 text-white px-4 py-2 rounded-md shadow hover:bg-gray-700 transition"
          >
            View My Change Requests
          </button>
        </div>
      </section>
    </div>
  );
}

/* ---------------- REUSABLE INPUT COMPONENT ---------------- */
function Input({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="block font-semibold mb-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 rounded bg-gray-800 border border-gray-600"
      />
    </div>
  );
}
