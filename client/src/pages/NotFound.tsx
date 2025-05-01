import React from "react";
import { Button } from "@/ui/button";
import { ArrowBigLeft } from "lucide-react";

interface NotFoundProps {
  className?: string;
}

export default function NotFound({ className }: NotFoundProps): JSX.Element {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center space-y-6 h-screen ${
        className || ""
      }`}
    >
      <h1 className="text-4xl font-bold text-foreground">
        404: Page not found
      </h1>
      <p className="text-lg text-gray-500">
        The page you are looking for does not exist.
      </p>
      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="flex items-center space-x-2"
      >
        <ArrowBigLeft className="w-4 h-4" />
        <span>Go Back</span>
      </Button>
    </div>
  );
}
