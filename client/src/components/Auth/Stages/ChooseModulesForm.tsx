import React, { useState, useEffect } from "react";
import { Button } from "@/ui/button";
import { CardContent } from "@/ui/card";
import { Check } from "lucide-react";
import { fetchDefaultModules } from "@/services/moduleService";

const ChooseModulesForm: React.FC<{
  onComplete: (data: string[]) => void;
  initialData: string[];
}> = ({ onComplete, initialData }) => {
  const [selectedModules, setSelectedModules] = useState(initialData);
  const [monitoringOptions, setMonitoringOptions] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    const loadDefaultModules = async () => {
      try {
        const modules = await fetchDefaultModules();
        setMonitoringOptions(
          modules.map((module: any) => ({ id: module.id, name: module.name }))
        );
      } catch (error) {
        console.error("Error fetching default modules:", error);
      }
    };
    loadDefaultModules();
  }, []);

  const toggleModule = (moduleName: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleName)
        ? prev.filter((name) => name !== moduleName)
        : [...prev, moduleName]
    );
  };

  const handleComplete = () => {
    onComplete(selectedModules);
  };

  return (
    <CardContent className="space-y-6 text-center">
      <h2 className="text-2xl font-semibold">Site added successfully</h2>
      <a
        href="#"
        className=" font-normal text-gray-600 text-xl text-center tracking-[0] leading-5 underline"
      >
        {"testsite.com"}
      </a>
      <p className="text-sm text-center text-shadcn-ui-app-muted-foreground font-text-sm-leading-5-normal">
        What do you want to monitor?
      </p>
      <div className="grid grid-cols-2 gap-4">
        {monitoringOptions.map((option) => (
          <Button
            key={option.id}
            variant={
              selectedModules.includes(option.name) ? "default" : "secondary"
            }
            className={`w-full gap-2 px-4 py-2 ${
              selectedModules.includes(option.name)
                ? "bg-slate-900"
                : "bg-slate-400"
            }`}
            onClick={() => toggleModule(option.name)}
          >
            {selectedModules.includes(option.name) && (
              <Check className="w-[22px] h-[22px] text-white" />
            )}
            <span className="font-medium text-white text-sm leading-6">
              {option.name}
            </span>
          </Button>
        ))}
      </div>
      <Button className="w-full" onClick={handleComplete}>
        Go to Dashboard
      </Button>
    </CardContent>
  );
};

export default ChooseModulesForm;
