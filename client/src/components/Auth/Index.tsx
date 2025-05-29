import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Separator } from "@/ui/separator";

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-md shadow-none border-none">
      <CardHeader className="text-center space-y-3">
        <CardTitle className="text-2xl font-semibold font-text-2xl-leading-none-semibold tracking-[-0.6px] leading-none">
          Site Monitor
        </CardTitle>
        <CardDescription className="text-sm font-text-sm-leading-5-normal text-shadcn-ui-app-muted-foreground">
          Your site is monitored 24/7
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pb-6">
        <Button
          className="w-full font-body-medium"
          size="default"
          onClick={() => navigate("/signup")}
        >
          Start
        </Button>
        <div className="flex items-center gap-1.5">
          <Separator className="flex-1" />
          <span className="text-xs text-shadcn-ui-app-muted-foreground [font-family:'Inter-Regular',Helvetica]">
            ALREADY HAVE AN ACCOUNT?
          </span>
          <Separator className="flex-1" />
        </div>
        <Button
          variant="outline"
          className="w-full font-body-medium"
          onClick={() => navigate("/login")}
        >
          Log In
        </Button>
      </CardContent>
    </Card>
  );
};

export default Index;
