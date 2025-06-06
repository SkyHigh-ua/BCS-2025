import React, { useState } from "react";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

const PersonalInfoForm: React.FC<{
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: {
    firstName: string;
    lastName: string;
    companyName: string;
  }) => void;
  initialData: { firstName: string; lastName: string; companyName: string };
}> = ({ onNext, onBack, onUpdate, initialData }) => {
  const [firstName, setFirstName] = useState(initialData.firstName);
  const [lastName, setLastName] = useState(initialData.lastName);
  const [companyName, setCompanyName] = useState(initialData.companyName);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});

  const handleNext = () => {
    // Reset errors
    setErrors({});
    const newErrors: { firstName?: string; lastName?: string } = {};

    // Validate first name
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    // Validate last name
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdate({ firstName, lastName, companyName });
    onNext();
  };

  return (
    <CardContent className="space-y-6">
      <h2 className="text-2xl font-semibold text-center">
        Personal Information
      </h2>
      <div className="space-y-4">
        <Label
          htmlFor="firstName"
          className="font-medium text-slate-900 text-sm leading-5"
        >
          First Name
        </Label>
        <Input
          id="firstName"
          placeholder="John"
          className={`w-full text-slate-400 placeholder:text-slate-400 text-black ${
            errors.firstName ? "border-red-500" : ""
          }`}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        {errors.firstName && (
          <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
        )}
        <Label
          htmlFor="lastName"
          className="font-medium text-slate-900 text-sm leading-5"
        >
          Last Name
        </Label>
        <Input
          id="lastName"
          placeholder="Doe"
          className={`w-full text-slate-400 placeholder:text-slate-400 text-black ${
            errors.lastName ? "border-red-500" : ""
          }`}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        {errors.lastName && (
          <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
        )}
        <Label
          htmlFor="CompanyName"
          className="font-medium text-slate-900 text-sm leading-5"
        >
          Company Name (Optional)
        </Label>
        <Input
          id="CompanyName"
          placeholder="Company Name"
          className="w-full text-slate-400 placeholder:text-slate-400 text-black"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
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

export default PersonalInfoForm;
