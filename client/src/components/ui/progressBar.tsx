import React from "react";
import { Check } from "lucide-react";

// StepSymbol component to replace the imported one
const StepSymbol = ({ className }: { className?: string }) => {
  return (
    <div
      className={`w-8 h-8 bg-black rounded-full border-2 border-solid border-black flex items-center justify-center ${className}`}
    >
      <Check className="h-5 w-5 text-white" />
    </div>
  );
};

interface Step {
  id: number;
  label: string;
  completed: boolean;
}

interface ProgressBarProps {
  steps: Step[];
}

export default function ProgressBar({ steps }: ProgressBarProps): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex w-[366px] items-start">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step indicator */}
            <div className="inline-flex flex-col items-center gap-2.5">
              {step.completed ? (
                <StepSymbol className="w-8 h-8" />
              ) : (
                <div className="w-8 h-8">
                  <div className="h-8 bg-light rounded-2xl overflow-hidden border-2 border-solid border-gray-400 flex items-center justify-center">
                    <div className="[font-family: 'Inter-Medium', Helvetica] font-medium text-dark text-[13px] text-center tracking-[0] leading-[normal]">
                      {step.label}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Connector line (except after the last step) */}
            {index < steps.length - 1 && (
              <div className="w-20 relative h-8">
                <div
                  className={`relative h-0.5 top-[15px] ${
                    steps[index + 1]?.completed ? "bg-black" : "bg-gray-400"
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
