import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Main } from "@/components/Dashboard/Main";
import { Navbar } from "@/components/Dashboard/Navbar";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { getUserSites } from "@/services/siteService";
import { getUserData } from "@/services/userService";
import { User } from "@/models/User";
import { Site } from "@/models/Site";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { siteName } = useParams();
  const [user, setUser] = useState<User>(() => ({} as User));
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      navigate("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem("jwt");
        navigate("/");
        return;
      }
    } catch (error) {
      console.error("Invalid JWT:", error);
      localStorage.removeItem("jwt");
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

        const currentPath = window.location.pathname;
        const pathParts = currentPath.split("/").filter(Boolean);

        if (pathParts[0] === "dashboard") {
          const pathSiteName = pathParts[1];
          if (pathSiteName && userSites.length > 0) {
            const matchingSite = userSites.find(
              (site) => site.name === pathSiteName
            );

            if (matchingSite) {
              setSelectedSite(matchingSite);
            }
          } else if (
            pathParts.length === 1 ||
            (pathParts.length === 2 && pathParts[1] === "")
          ) {
            if (userSites.length > 0) {
              setSelectedSite(userSites[0]);
              navigate(`/dashboard/${userSites[0].name}`);
            } else {
              navigate("/dashboard/add-site");
            }
          }
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
        {sites && (
          <Sidebar
            sites={sites}
            selectedSite={selectedSite}
            setSelectedSite={setSelectedSite}
          />
        )}
        <Main
          user={user}
          setUser={setUser}
          sites={sites}
          setSites={setSites}
          setSelectedSite={setSelectedSite}
        />
      </div>
    </div>
  );
};

export default Dashboard;
