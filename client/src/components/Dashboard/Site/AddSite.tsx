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
import { fetchDefaultPlugins } from "@/services/pluginService";
import { fetchDefaultModules } from "@/services/moduleService";

export default function AddSite(): JSX.Element {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [monitoringType, setMonitoringType] = useState("none");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [plugins, setPlugins] = useState<{ id: string; name: string }[]>([]);
  const [monitoringOptions, setMonitoringOptions] = useState<
    { id: string; name: string }[]
  >([]);

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
        const modules = await fetchDefaultModules();
        setMonitoringOptions(
          modules.map((module: any) => ({ id: module.id, name: module.name }))
        );
      } catch (error) {
        console.error("Error fetching default modules:", error);
      }
    };

    loadDefaultPlugins();
    loadDefaultModules();
  }, []);

  const toggleModule = (moduleName: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleName)
        ? prev.filter((name) => name !== moduleName)
        : [...prev, moduleName]
    );
  };

  const handleSubmit = () => {
    const formData = {
      url,
      name,
      monitoringType,
      selectedModules,
    };
    console.log("Form Data Submitted:", formData);
    // Add your submission logic here
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
          value={url}
          onChange={(e) => setUrl(e.target.value)}
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
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Label
          htmlFor="monitoringType"
          className="font-medium text-slate-900 text-sm leading-5"
        >
          Monitoring Type
        </Label>
        <Select
          value={monitoringType}
          onValueChange={(value) => setMonitoringType(value)}
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
      </div>
      <Button className="w-full" onClick={handleSubmit}>
        Submit
      </Button>
    </CardContent>
  );
}
