import React, { useState } from "react";
import { Button } from "@/ui/button";
import { CardContent } from "@/ui/card";
import { Check } from "lucide-react";

const ChooseModulesForm: React.FC<{
  onComplete: (data: string[]) => void;
  initialData: string[];
}> = ({ onComplete, initialData }) => {
  const [selectedModules, setSelectedModules] = useState(initialData);

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

  // Define monitoring options data
  const monitoringOptions = [
    { id: 1, name: "Uptime", selected: true },
    { id: 2, name: "Performance", selected: false },
    { id: 3, name: "Security", selected: false },
    { id: 4, name: "SEO", selected: false },
  ];
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
