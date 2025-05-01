import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Main } from "@/components/Dashboard/Main";
import { Navbar } from "@/components/Dashboard/Navbar";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { getUserSites } from "@/services/siteService";
import { getUserData } from "@/services/userService";
import { User } from "@/models/User";
import { Site } from "@/models/Site";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [sites, setSites] = useState<Site[]>([]);

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
        setUser(userData);
        setSites(userSites);
        if (userSites.length > 0) {
          navigate(`/dashboard/${userSites[0]}`);
        } else {
          navigate("/dashboard/add-site");
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  return (
    <div className="bg-white flex flex-col w-full min-h-screen">
      <Navbar user={user} />
      <div className="flex w-full flex-1">
        <Sidebar user={user} setUser={setUser} sites={sites} />
        <Main sites={sites} />
      </div>
    </div>
  );
};

export default Dashboard;
