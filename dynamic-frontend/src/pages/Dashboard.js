// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [menuItems, setMenuItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenuItems = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      try {
        const response = await axios.get("https://unitres.vercel.app/api/menu", {
          headers: { "x-auth-token": token },
        });
        setMenuItems(response.data);
      } catch (err) {
        console.error(err);
        navigate("/");
      }
    };

    fetchMenuItems();
  }, [navigate]);

  return (
    <div>
      <h1>Dashboard</h1>
      <ul>
        {menuItems.map((item) => (
          <li key={item.id}>
            <a href={item.path}>{item.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
