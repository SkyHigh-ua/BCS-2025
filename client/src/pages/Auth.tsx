import React from "react";
import Login from "@/components/Auth/Login";
import Signup from "@/components/Auth/Signup";
import Index from "@/components/Auth/Index";
import image from "../assets/images/auth.png";
import logo from "../assets/images/auth-logo.svg";

interface AuthPageProps {
  mode?: "login" | "signup";
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  let Content;
  switch (mode) {
    case "login":
      Content = <Login />;
      break;
    case "signup":
      Content = <Signup />;
      break;
    default:
      Content = <Index />;
  }

  return (
    <div className="flex h-screen w-full bg-white">
      {/* Left side with background image */}
      <div className="flex-1 relative bg-shadcn-ui-app-primary">
        <div
          className="h-full w-full flex flex-col p-10 pl-[60px] bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className="flex items-center gap-1.5">
            <img className="w-6 h-6" alt="Acme" src={logo} />
            <span className="font-medium text-xl text-white [font-family:'Inter-Medium',Helvetica]">
              Some Inc
            </span>
          </div>
        </div>
      </div>

      {/* Right side with dynamic content */}
      <div className="flex-1 flex items-center justify-center min-h-screen from-blue-50 to-indigo-100 bg-shadcn-ui-app-card p-6">
        {Content}
      </div>
    </div>
  );
};

export default AuthPage;
