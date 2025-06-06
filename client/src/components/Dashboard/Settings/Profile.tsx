import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";
import { getUserData, updateUser } from "@/services/userService";
import { User } from "@/models/User";

export default function Profile({
  user,
  setUser,
}: {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}): JSX.Element {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState<{
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserData();
        setUser(userData);
        setFormData({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          pfp: userData.pfp,
          password: "",
          confirmPassword: "",
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateProfile = async () => {
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: "Passwords do not match" });
      return;
    }

    try {
      const filteredFormData = Object.fromEntries(
        Object.entries(formData).filter(
          ([_, value]) => value !== "" && value !== undefined
        )
      );
      const updatedUser = await updateUser(user.id, filteredFormData);
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage({ text: "Failed to update profile" });
    }
  };

  return (
    <Card className="flex flex-col gap-6 w-full overflow-hidden border-none shadow-none">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Manage your profile settings and set e-mail preferences.
        </CardDescription>
      </CardHeader>

      <Separator className="w-full" />

      {message && <div className={"p-4 text-red-800"}>{message.text}</div>}

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            placeholder="Enter your first name"
            value={formData.first_name}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            placeholder="Enter your last name"
            value={formData.last_name}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="************"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="************"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pfp">Profile Picture (optional)</Label>
          <Input
            id="pfp"
            type="url"
            placeholder="Enter a URL for your profile picture"
            value={formData.pfp}
            onChange={handleInputChange}
          />
        </div>
        <Button className="mt-4" onClick={handleUpdateProfile}>
          Update Profile
        </Button>
      </CardContent>
    </Card>
  );
}
