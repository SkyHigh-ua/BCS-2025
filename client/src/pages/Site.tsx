import React from "react";
import { useParams, Routes, Route } from "react-router-dom";
import SiteSettings from "@/components/Settings/SiteSettings";

const Site: React.FC = () => {
  const { sitename } = useParams();

  return (
    <div>
      <h2 className="text-2xl font-semibold">Site: {sitename}</h2>
      <p>Welcome to the {sitename} dashboard!</p>

      <Routes>
        <Route path="settings" element={<SiteSettings />} />
      </Routes>
    </div>
  );
};

export default Site;
