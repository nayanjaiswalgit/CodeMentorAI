import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface McqQuizProps {
  mcq: {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  };
  onComplete?: (result: boolean, mcqId: number) => void;
}

export default function McqQuiz({ mcq, onComplete }: McqQuizProps) {
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = async () => {
    if (selectedOption === null) {
      toast({
        title: "No option selected",
        description: "Please select an answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    const correct = selectedOption === mcq.correctAnswer;
    setIsCorrect(correct);
    setSubmitted(true);

    try {
      // Record progress
      await apiRequest("POST", "/api/user-progress", {
        mcqId: mcq.id,
        completed: true,
        score: correct ? 100 : 0
      });

      // Invalidate user progress queries
      queryClient.invalidateQueries({ queryKey: ['/api/user-progress'] });
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(correct, mcq.id);
      }
    } catch (error: any) {
      toast({
        title: "Failed to record progress",
        description: error.message || "An error occurred while saving your progress",
        variant: "destructive",
      });
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setSubmitted(false);
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-5">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">{mcq.question}</h3>
        </div>

        <RadioGroup 
          value={selectedOption?.toString()}
          onValueChange={(value) => setSelectedOption(parseInt(value))}
          disabled={submitted}
          className="space-y-3"
        >
          {mcq.options.map((option, index) => (
            <div 
              key={index} 
              className={`
                flex items-center space-x-2 p-3 rounded-md border 
                ${submitted && mcq.correctAnswer === index ? 'border-green-500 bg-green-50' : ''}
                ${submitted && selectedOption === index && mcq.correctAnswer !== index ? 'border-red-500 bg-red-50' : ''}
                ${!submitted ? 'hover:bg-neutral-50' : ''}
              `}
            >
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {option}
              </Label>
              {submitted && mcq.correctAnswer === index && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {submitted && selectedOption === index && mcq.correctAnswer !== index && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          ))}
        </RadioGroup>

        {submitted && mcq.explanation && (
          <Alert className="mt-4">
            <HelpCircle className="h-4 w-4" />
            <AlertDescription>{mcq.explanation}</AlertDescription>
          </Alert>
        )}

        <div className="mt-4 flex justify-between">
          {!submitted ? (
            <Button onClick={handleSubmit} className="ml-auto">Submit Answer</Button>
          ) : (
            <div className="flex w-full justify-between items-center">
              <div className="flex items-center">
                {isCorrect ? (
                  <span className="text-green-600 font-medium flex items-center">
                    <CheckCircle className="h-5 w-5 mr-1" /> Correct
                  </span>
                ) : (
                  <span className="text-red-600 font-medium flex items-center">
                    <XCircle className="h-5 w-5 mr-1" /> Incorrect
                  </span>
                )}
              </div>
              <Button onClick={handleNext}>Next Question</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
