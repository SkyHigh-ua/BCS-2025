import React from "react";
import { useParams } from "react-router-dom";

const SiteSettings: React.FC = () => {
  const { sitename } = useParams();

  return (
    <div>
      <h2 className="text-2xl font-semibold">Settings for {sitename}</h2>
      <p>Manage settings for the {sitename} site here.</p>
    </div>
  );
};

export default SiteSettings;
