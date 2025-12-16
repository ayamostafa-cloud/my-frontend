// pages/employee-profile/update.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../api/axios";

export default function UpdateProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<any>({
    phone: "",
    personalEmail: "",
    workEmail: "",
    biography: "",
    address: { street: "", city: "", country: "" },
  });

  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await api.get("/employee-profile/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const d = res.data;
      setFormData({
        phone: d.phone || "",
        personalEmail: d.personalEmail || "",
        workEmail: d.workEmail || "",
        biography: d.biography || "",
        address: d.address || { street: "", city: "", country: "" },
      });
    }

    load();
  }, []);

  function handleChange(e: any) {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData((p: any) => ({
        ...p,
        address: { ...p.address, [key]: value },
      }));
    } else {
      setFormData((p: any) => ({ ...p, [name]: value }));
    }
  }

  async function submit(e: any) {
    e.preventDefault();
    const token = localStorage.getItem("token");

    await api.patch("/employee-profile/self-update", formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setMsg("Profile updated successfully ✅");
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Update Profile</h1>

      {msg && <p className="text-green-400 mb-3">{msg}</p>}

      <form onSubmit={submit} className="space-y-4 bg-gray-800 p-6 rounded">
        <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
        <Input label="Personal Email" name="personalEmail" value={formData.personalEmail} onChange={handleChange} />
        <Input label="Work Email" name="workEmail" value={formData.workEmail} onChange={handleChange} />

        <label className="block font-semibold">Biography</label>
        <textarea
          name="biography"
          value={formData.biography}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700"
        />

        <Input label="Street" name="address.street" value={formData.address.street} onChange={handleChange} />
        <Input label="City" name="address.city" value={formData.address.city} onChange={handleChange} />
        <Input label="Country" name="address.country" value={formData.address.country} onChange={handleChange} />

        <div className="flex gap-4 mt-4">
          <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
            Save
          </button>

          <button
            type="button"
            onClick={() => router.push("/employee-profile")}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="block font-semibold mb-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 rounded bg-gray-700"
      />
    </div>
  );
}
