import React, { useState } from "react";
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

const AddSiteForm: React.FC<{
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: {
    url: string;
    name: string;
    monitoringType: string;
  }) => void;
  initialData: { url: string; name: string; monitoringType: string };
}> = ({ onNext, onBack, onUpdate, initialData }) => {
  const [url, setUrl] = useState(initialData.url);
  const [name, setName] = useState(initialData.name);
  const [monitoringType, setMonitoringType] = useState(
    initialData.monitoringType
  );

  const handleNext = () => {
    onUpdate({ url, name, monitoringType });
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
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="uptime">Uptime</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="seo">SEO</SelectItem>
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
