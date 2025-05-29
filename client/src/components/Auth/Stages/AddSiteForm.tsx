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
import { fetchDefaultPlugins } from "@/services/pluginService";

const AddSiteForm: React.FC<{
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: {
    domain: string;
    name: string;
    monitoringType: string;
  }) => void;
  initialData: { domain: string; name: string; monitoringType: string };
}> = ({ onNext, onBack, onUpdate, initialData }) => {
  const [url, setUrl] = useState(initialData.domain);
  const [name, setName] = useState(initialData.name);
  const [monitoringType, setMonitoringType] = useState(
    initialData.monitoringType || "none"
  );
  const [plugins, setPlugins] = useState<{ id: string; name: string }[]>([]);
  const [errors, setErrors] = useState<{
    url?: string;
    name?: string;
  }>({});

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
    loadDefaultPlugins();
  }, []);

  const validateUrl = (value: string) => {
    try {
      if (!value.startsWith("http://") && !value.startsWith("https://")) {
        value = "https://" + value;
      }
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleNext = () => {
    // Reset errors
    setErrors({});
    const newErrors: { url?: string; name?: string } = {};

    // Validate URL
    if (!url.trim()) {
      newErrors.url = "Site URL is required";
    } else if (!validateUrl(url)) {
      newErrors.url = "Please enter a valid URL (e.g., https://example.com)";
    }

    // Validate site name
    if (!name.trim()) {
      newErrors.name = "Site name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdate({ domain: url, name, monitoringType });
    onNext();
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
          className={`w-full text-slate-400 placeholder:text-slate-400 text-black ${
            errors.url ? "border-red-500" : ""
          }`}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        {errors.url && (
          <p className="text-red-500 text-xs mt-1">{errors.url}</p>
        )}
        <Label
          htmlFor="name"
          className="font-medium text-slate-900 text-sm leading-5"
        >
          Site Name
        </Label>
        <Input
          id="name"
          placeholder="Acme Inc"
          className={`w-full text-slate-400 placeholder:text-slate-400 text-black ${
            errors.name ? "border-red-500" : ""
          }`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
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
            <SelectItem value="none">Default</SelectItem>
            {plugins.map((plugin) => (
              <SelectItem key={plugin.id} value={plugin.id}>
                {plugin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>Continue</Button>
      </div>
    </CardContent>
  );
};

export default AddSiteForm;
