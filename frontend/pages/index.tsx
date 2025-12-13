import { useEffect, useState } from "react";
import api from "../api/axios";

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function fetchProfile() {
    try {
      setErrorMsg(null);

      const userId = localStorage.getItem("userId");

      // Call correct endpoint
      const res = await api.get(`/employee-profile/${userId}`);

      setProfile(res.data);
    } catch (err: any) {
      console.error("Error loading profile:", err);
      setErrorMsg("Unable to load profile ❌ (Check token or endpoint)");
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  if (errorMsg) return <p>{errorMsg}</p>;
  if (!profile) return <p>Loading profile...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "auto", paddingTop: 40 }}>
      <h1>My Employee Profile</h1>
      <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
      <p><strong>Employee Number:</strong> {profile.employeeNumber}</p>
      <p><strong>Status:</strong> {profile.status}</p>
      <p><strong>Department:</strong> {profile.primaryDepartmentId}</p>
      <p><strong>Position:</strong> {profile.primaryPositionId}</p>
    </div>
  );
}
