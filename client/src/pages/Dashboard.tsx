import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Main } from "@/components/Dashboard/Main";
import { Navbar } from "@/components/Dashboard/Navbar";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { getUserSites } from "@/services/siteService";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<string[]>([]);

  // useEffect(() => {
  //   const jwt = localStorage.getItem("jwt");
  //   if (!jwt) {
  //     navigate("/");
  //   }
  // }, [navigate]);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const userSites = await getUserSites();
        setSites(userSites);
        if (userSites.length > 0) {
          navigate(`/dashboard/${userSites[0]}`);
        }
      } catch (error) {
        console.error("Failed to fetch user sites:", error);
      }
    };

    fetchSites();
  }, [navigate]);

  return (
    <div className="bg-white flex flex-col w-full min-h-screen">
      <Navbar />
      <div className="flex w-full flex-1">
        <Sidebar sites={sites} />
        <Main />
      </div>
    </div>
  );
};

export default Dashboard;
