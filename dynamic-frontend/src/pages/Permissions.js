// src/pages/Permissions.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Permissions = () => {
  const [permissions, setPermissions] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPermissions = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      try {
        const response = await axios.get(
          "http://localhost:5001/api/user/permissions",
          {
            headers: { "x-auth-token": token },
          }
        );
        setPermissions(response.data);
      } catch (err) {
        console.error(err);
        navigate("/");
      }
    };

    fetchPermissions();
  }, [navigate]);

  if (!permissions) return <div>Loading...</div>;

  return (
    <div>
      <h1>User Permissions</h1>
      <ul>
        <li>Can View: {permissions.canView ? "Yes" : "No"}</li>
        <li>Can Edit: {permissions.canEdit ? "Yes" : "No"}</li>
        <li>Can Delete: {permissions.canDelete ? "Yes" : "No"}</li>
      </ul>
    </div>
  );
};

export default Permissions;
