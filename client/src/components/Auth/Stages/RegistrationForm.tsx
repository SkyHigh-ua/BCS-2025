import React, { useState } from "react";
import { Button } from "@/ui/button";
import { CardContent } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { verifyEmail } from "@/services/authService";

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
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNext = async () => {
    // Reset errors
    setErrors({});
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    // Validate email
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate password
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check if email already exists
    setIsLoading(true);
    try {
      const emailExists = await verifyEmail(email);
      if (emailExists.status) {
        setErrors({ email: "This email is already registered" });
        setIsLoading(false);
        return;
      }

      onUpdate({ email, password, confirmPassword });
      onNext();
    } catch (error) {
      console.error("Error checking email:", error);
      setErrors({ email: "Error checking email availability" });
    } finally {
      setIsLoading(false);
    }
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
            className={`w-full text-slate-400 placeholder:text-slate-400 text-black ${
              errors.email ? "border-red-500" : ""
            }`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
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
            className={`w-full text-slate-400 placeholder:text-slate-400 text-black ${
              errors.password ? "border-red-500" : ""
            }`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
          <Label
            htmlFor="confirmPassword"
            className="font-medium text-slate-900 text-sm leading-5"
          >
            Password Confirmation
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="********"
            className={`w-full text-slate-400 placeholder:text-slate-400 text-black ${
              errors.confirmPassword ? "border-red-500" : ""
            }`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>
        <Button className="w-full" onClick={handleNext} disabled={isLoading}>
          {isLoading ? "Checking..." : "Continue"}
        </Button>
      </CardContent>
    </div>
  );
};

export default RegistrationForm;
