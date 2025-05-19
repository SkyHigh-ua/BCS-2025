import React, { useState, useEffect } from "react";
import { Button } from "@/ui/button";
import { CardContent } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Check } from "lucide-react";
import {
  assignPluginToSite,
  fetchDefaultPlugins,
} from "@/services/pluginService";
import { assignModules, fetchDefaultModules } from "@/services/moduleService";
import { createSite } from "@/services/siteService";
import { useNavigate } from "react-router-dom";

export default function AddSite(): JSX.Element {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    url: "",
    name: "",
    plugin: "none",
    selectedModules: [] as string[],
  });
  const [plugins, setPlugins] = useState<{ id: string; name: string }[]>([]);
  const [modules, setModules] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const loadDefaultPlugins = async () => {
      try {
        const pluginsData = await fetchDefaultPlugins();
        setPlugins(
          pluginsData.map((plugin: any) => ({
            id: plugin.id,
            name: plugin.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching default plugins:", error);
      }
    };

    const loadDefaultModules = async () => {
      try {
        const modulesData = await fetchDefaultModules();
        setModules(
          modulesData.map((module: any) => ({
            id: module.id,
            name: module.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching default modules:", error);
      }
    };

    loadDefaultPlugins();
    loadDefaultModules();
  }, []);

  const toggleModule = (moduleName: string) => {
    setFormState((prev) => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(moduleName)
        ? prev.selectedModules.filter((name) => name !== moduleName)
        : [...prev.selectedModules, moduleName],
    }));
  };

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const { url, name, plugin, selectedModules } = formState;
      const formData = {
        domain: url,
        name,
        monitoringType: plugin,
        selectedModules,
      };
      const newSite = await createSite({
        domain: formData.domain,
        name: formData.name,
        description: formData.name,
      });
      await assignPluginToSite(formData.monitoringType, newSite.id);
      await assignModules(newSite.id, formData.selectedModules);
      navigate(`/dashboard/${newSite.name}`);
    } catch (error) {
      console.error("Error creating site:", error);
    }
  };

  return (
    <CardContent className="space-y-6">
      <h2 className="text-2xl font-semibold text-center">Add Site</h2>
      <div className="space-y-4">
        <Label
          htmlFor="url"
          className="font-medium text-slate-900 text-sm leading-5"
        >
          Site URL
        </Label>
        <Input
          id="url"
          placeholder="https://example.com"
          className="w-full text-slate-400 placeholder:text-slate-400 text-black"
          value={formState.url}
          onChange={(e) => handleChange("url", e.target.value)}
        />
        <Label
          htmlFor="name"
          className="font-medium text-slate-900 text-sm leading-5"
        >
          Site Name
        </Label>
        <Input
          id="name"
          placeholder="Acme Inc"
          className="w-full text-slate-400 placeholder:text-slate-400 text-black"
          value={formState.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <Label
          htmlFor="monitoringType"
          className="font-medium text-slate-900 text-sm leading-5"
        >
          Monitoring Type
        </Label>
        <Select
          value={formState.plugin}
          onValueChange={(value) => handleChange("plugin", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a plugin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none" selected="true">
              Default
            </SelectItem>
            {plugins.map((plugin) => (
              <SelectItem key={plugin.id} value={plugin.name}>
                {plugin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-4">
        <p className="text-sm text-center text-shadcn-ui-app-muted-foreground font-text-sm-leading-5-normal">
          What do you want to monitor?
        </p>
        <div className="grid grid-cols-2 gap-4">
          {modules.map((module) => (
            <Button
              key={module.id}
              variant={
                formState.selectedModules.includes(module.name)
                  ? "default"
                  : "secondary"
              }
              className={`w-full gap-2 px-4 py-2 ${
                formState.selectedModules.includes(module.name)
                  ? "bg-slate-900"
                  : "bg-slate-400"
              }`}
              onClick={() => toggleModule(module.name)}
            >
              {formState.selectedModules.includes(module.name) && (
                <Check className="w-[22px] h-[22px] text-white" />
              )}
              <span className="font-medium text-white text-sm leading-6">
                {module.name}
              </span>
            </Button>
          ))}
        </div>
      </div>
      <Button className="w-full" onClick={handleSubmit}>
        Submit
      </Button>
    </CardContent>
  );
}
