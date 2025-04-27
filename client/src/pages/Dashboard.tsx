import React, { useEffect } from "react";
import { Outlet, useNavigate, Route, Routes } from "react-router-dom";
import DashboardSettings from "@/components/Settings/DashboardSettings";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 bg-gray-800 text-white">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </header>
      <main className="flex-1 p-4">
        <Routes>
          <Route path="settings" element={<DashboardSettings />} />
        </Routes>
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
