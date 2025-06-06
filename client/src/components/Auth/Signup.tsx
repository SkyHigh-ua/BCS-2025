import React, { useState } from "react";
import { Card } from "@/ui/card";
import ProgressBar from "@/ui/progress-bar";
import RegistrationForm from "@/components/Auth/Stages/RegistrationForm";
import PersonalInfoForm from "@/components/Auth/Stages/PersonalInfoForm";
import AddSiteForm from "@/components/Auth/Stages/AddSiteForm";
import ChooseModulesForm from "@/components/Auth/Stages/ChooseModulesForm";
import { useNavigate } from "react-router-dom";
import { signup } from "@/services/authService";
import { createSite } from "@/services/siteService";
import { assignModules } from "@/services/moduleService";
import { assignPluginToSite } from "@/services/pluginService";

const Signup: React.FC = () => {
  const [stage, setStage] = useState(1);
  const navigate = useNavigate();
  const [siteId, setSiteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    registration: { email: "", password: "", confirmPassword: "" },
    personalInfo: { firstName: "", lastName: "", companyName: "" },
    siteInfo: { domain: "", name: "", pluginId: "" },
    modules: [],
  });

  const steps = [
    { id: 1, label: "01", completed: stage >= 1 },
    { id: 2, label: "02", completed: stage >= 2 },
    { id: 3, label: "03", completed: stage >= 3 },
    { id: 4, label: "04", completed: stage === 4 },
  ];

  const nextStage = async () => {
    if (stage === 3) {
      try {
        const { email, password } = formData.registration;
        const { firstName, lastName, companyName } = formData.personalInfo;
        const signupResponse = await signup(
          email,
          password,
          firstName,
          lastName,
          companyName
        );

        if (signupResponse.login_token) {
          localStorage.setItem("jwt", signupResponse.login_token);
        }

        const { domain, name, pluginId } = formData.siteInfo;
        const descrciption = `Site created by ${firstName} ${lastName}`;
        const siteResponse = await createSite({
          domain,
          name,
          descrciption,
        });
        setSiteId(siteResponse.id);
        if (pluginId) {
          const pluginResponse = await assignPluginToSite(
            pluginId,
            siteResponse.id
          );
        }
      } catch (error) {
        console.error("Error creating user or site:", error);
        return;
      }
    }
    setStage((prev) => Math.min(prev + 1, 4));
  };

  const prevStage = () => setStage((prev) => Math.max(prev - 1, 1));

  const updateFormData = (key: string, data: any) => {
    setFormData((prev) => ({ ...prev, [key]: data }));
  };

  const renderStage = () => {
    switch (stage) {
      case 1:
        return (
          <RegistrationForm
            onNext={nextStage}
            onUpdate={(data) => updateFormData("registration", data)}
            initialData={formData.registration}
          />
        );
      case 2:
        return (
          <PersonalInfoForm
            onNext={nextStage}
            onBack={prevStage}
            onUpdate={(data) => updateFormData("personalInfo", data)}
            initialData={formData.personalInfo}
          />
        );
      case 3:
        return (
          <AddSiteForm
            onNext={nextStage}
            onBack={prevStage}
            onUpdate={(data) => updateFormData("siteInfo", data)}
            initialData={formData.siteInfo}
          />
        );
      case 4:
        return (
          <ChooseModulesForm
            onComplete={async (data) => {
              updateFormData("modules", data);
              if (siteId) {
                try {
                  if (data.length > 0) {
                    await assignModules(siteId, data);
                  }
                  const siteName = formData.siteInfo.name;
                  navigate(`/dashboard/${siteName}`);
                } catch (error) {
                  console.error("Error assigning modules:", error);
                }
              }
            }}
            initialData={formData.modules}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-6 max-w-2x1 mx-auto min-h-screen">
      <div className="pt-20 pb-6 static">
        <ProgressBar steps={steps} />
      </div>
      <Card className="flex-1 shadow-none border-none overflow-y-auto w-full ">
        {renderStage()}
      </Card>
    </div>
  );
};

export default Signup;
