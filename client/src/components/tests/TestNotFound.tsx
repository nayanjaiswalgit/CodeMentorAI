import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface TestNotFoundProps {
  onBack: () => void;
}

export const TestNotFound: React.FC<TestNotFoundProps> = ({ onBack }) => (
  <div className="h-screen flex flex-col items-center justify-center">
    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
    <h1 className="text-2xl font-semibold mb-2">Test Not Found</h1>
    <p className="text-neutral-600 mb-4">
      The test you're looking for doesn't exist or you don't have access to it.
    </p>
    <Button onClick={onBack}>Back to Tests</Button>
  </div>
);
