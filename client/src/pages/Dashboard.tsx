import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Main } from "@/components/Dashboard/Main";
import { Navbar } from "@/components/Dashboard/Navbar";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { getUserSites } from "@/services/siteService";
import { getUserData } from "@/services/userService";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<{
    user: { firstName: string; lastName: string; avatar: string } | null;
    sites: string[];
  }>({ user: null, sites: [] });

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      navigate("/");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [userData, userSites] = await Promise.all([
          getUserData(),
          getUserSites(),
        ]);
        setDashboardData({ user: userData, sites: userSites });
        if (userSites.length > 0) {
          navigate(`/dashboard/${userSites[0]}`);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  return (
    <div className="bg-white flex flex-col w-full min-h-screen">
      <Navbar user={dashboardData.user} />
      <div className="flex w-full flex-1">
        <Sidebar sites={dashboardData.sites} />
        <Main sites={dashboardData.sites} />
      </div>
    </div>
  );
};

export default Dashboard;
