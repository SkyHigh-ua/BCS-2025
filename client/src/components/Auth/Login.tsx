import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { login } from "@/services/authService";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      if (data) {
        localStorage.setItem("jwt", data);
      }
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password.");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Label
        htmlFor="email"
        className="font-medium text-slate-900 text-sm leading-5"
      >
        Email
      </Label>
      <Input
        type="email"
        placeholder="Email"
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
        type="password"
        placeholder="Password"
        className="w-full text-slate-400 placeholder:text-slate-400 text-black"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full font-body-medium" size="default">
        Log In
      </Button>
    </form>
  );
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Card className="w-full max-w-md shadow-none border-none">
      <CardHeader className="text-center space-y-3">
        <CardTitle className="text-2xl font-semibold font-text-2xl-leading-none-semibold tracking-[-0.6px] leading-none">
          Login
        </CardTitle>
        <CardDescription className="text-sm font-text-sm-leading-5-normal text-shadcn-ui-app-muted-foreground">
          Welcome back! Please log in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pb-6">
        <LoginForm />
      </CardContent>
      <div className="flex items-center gap-1.5">
        <div className="flex-1 border-t border-shadcn-ui-app-border"></div>
        <span className="text-xs text-shadcn-ui-app-muted-foreground whitespace-nowrap">
          DON'T HAVE AN ACCOUNT?
        </span>
        <div className="flex-1 border-t border-shadcn-ui-app-border"></div>
      </div>
      <CardContent className="space-y-6 pb-6">
        <Button
          variant="outline"
          className="w-full border-shadcn-ui-app-border bg-shadcn-ui-app-background text-foreground"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </Button>
      </CardContent>
    </Card>
  );
};

export default Login;
