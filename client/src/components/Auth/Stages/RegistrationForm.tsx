import React, { useState } from "react";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

const RegistrationForm: React.FC<{
  onNext: () => void;
  onUpdate: (data: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
  initialData: { email: string; password: string; confirmPassword: string };
}> = ({ onNext, onUpdate, initialData }) => {
  const [email, setEmail] = useState(initialData.email);
  const [password, setPassword] = useState(initialData.password);
  const [confirmPassword, setConfirmPassword] = useState(
    initialData.confirmPassword
  );

  const handleNext = () => {
    onUpdate({ email, password, confirmPassword });
    onNext();
  };

  return (
    <div>
      <CardContent className="pt-0">
        <h2 className="text-2xl font-semibold text-center">Registration</h2>
      </CardContent>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-start gap-1.5 w-full">
          <Label
            htmlFor="email"
            className="font-medium text-slate-900 text-sm leading-5"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            className="w-full text-slate-400 placeholder:text-slate-400 text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Label
            htmlFor="password"
            className="font-medium text-slate-900 text-sm leading-5"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            className="w-full text-slate-400 placeholder:text-slate-400 text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Label
            htmlFor="password"
            className="font-medium text-slate-900 text-sm leading-5"
          >
            Password Confirmation
          </Label>
          <Input
            id="passwordConfirmation"
            type="password"
            placeholder="********"
            className="w-full text-slate-400 placeholder:text-slate-400 text-black"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button className="w-full" onClick={handleNext}>
          Continue
        </Button>
      </CardContent>
    </div>
  );
};

export default RegistrationForm;
