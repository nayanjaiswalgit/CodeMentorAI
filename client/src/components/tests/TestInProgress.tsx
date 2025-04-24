import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Flag, Clock } from "lucide-react";
import { MultiSelectOptions } from "@/components/tests/MultiSelectOptions";
import { McqOptions } from "@/components/tests/McqOptions";
import { CodeBlock } from "@/components/tests/CodeBlock";
import { SubmitTestDialog } from "@/components/tests/SubmitTestDialog";

interface TestInProgressProps {
  test: any;
  currentQuestionIndex: number;
  currentQuestion: any;
  answers: any;
  flaggedQuestions: string[];
  timer: string;
  progress: number;
  onSelectMcqOption: (optionIndex: number) => void;
  onToggleMultiSelectOption: (optionIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onFlag: () => void;
  onQuestionNav: (index: number) => void;
  onSubmit: () => void;
  onOpenSubmitDialog: () => void;
  showSubmitDialog: boolean;
  setShowSubmitDialog: (open: boolean) => void;
  areAllQuestionsAnswered: boolean;
}

export const TestInProgress: React.FC<TestInProgressProps> = ({
  test,
  currentQuestionIndex,
  currentQuestion,
  answers,
  flaggedQuestions,
  timer,
  progress,
  onSelectMcqOption,
  onToggleMultiSelectOption,
  onPrevious,
  onNext,
  onFlag,
  onQuestionNav,
  onSubmit,
  onOpenSubmitDialog,
  showSubmitDialog,
  setShowSubmitDialog,
  areAllQuestionsAnswered,
}) => {
  if (!currentQuestion) return null;
  const getCurrentAnswer = () => answers[currentQuestion.id] || null;
  return (
    <div className="bg-neutral-50 font-sans text-neutral-800 flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header for test */}
        <div className="border-b bg-white p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={onOpenSubmitDialog}>
              <Clock className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-medium truncate">{test.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-sm text-neutral-500">Progress:</span>
              <span className="text-sm">
                {Object.keys(answers).length} / {test.questions.length}
              </span>
            </div>
            <Progress value={progress} className="w-32 h-2" />
            <div className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-md">
              <Clock className="h-4 w-4" />
              <span className="font-medium text-sm">{timer}</span>
            </div>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-sm mb-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Question {currentQuestionIndex + 1} of {test.questions.length}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-sm text-neutral-600">
                    <span>Points: {currentQuestion.points}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onFlag}
                      className={flaggedQuestions.includes(currentQuestion.id) ? "text-amber-500" : ""}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {currentQuestion.type === "mcq"
                    ? "Multiple Choice Question"
                    : currentQuestion.type === "code-mcq"
                    ? "Code-based Multiple Choice"
                    : "Multiple Selection Question"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-lg">{currentQuestion.question}</p>
                  {currentQuestion.type === "code-mcq" && (
                    <CodeBlock
                      code={currentQuestion.code}
                      language={currentQuestion.language}
                      height="200px"
                    />
                  )}
                  <div className="pt-2">
                    {currentQuestion.type === "multi-select" ? (
                      <MultiSelectOptions
                        options={currentQuestion.options}
                        selectedOptions={getCurrentAnswer()?.selectedOptions || []}
                        onToggle={onToggleMultiSelectOption}
                      />
                    ) : (
                      <McqOptions
                        options={currentQuestion.options}
                        selectedOption={getCurrentAnswer()?.selectedOption ?? null}
                        onSelect={onSelectMcqOption}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={onPrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                {currentQuestionIndex < test.questions.length - 1 ? (
                  <Button onClick={onNext} className="flex items-center gap-1">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={onOpenSubmitDialog} className="bg-green-600 hover:bg-green-700">
                    Submit Test
                  </Button>
                )}
              </CardFooter>
            </Card>
            <div className="grid grid-cols-8 md:grid-cols-12 gap-2">
              {test.questions.map((q: any, i: number) => {
                const answer = answers[q.id];
                const hasAnswer =
                  answer &&
                  (q.type === "multi-select"
                    ? answer.selectedOptions.length > 0
                    : answer.selectedOption !== null);
                const isFlagged = flaggedQuestions.includes(q.id);
                return (
                  <Button
                    key={q.id}
                    variant={i === currentQuestionIndex ? "default" : "outline"}
                    size="sm"
                    className={`h-9 relative ${isFlagged ? "border-amber-500 text-amber-600" : ""} ${hasAnswer && i !== currentQuestionIndex ? "bg-neutral-100" : ""}`}
                    onClick={() => onQuestionNav(i)}
                  >
                    {i + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-amber-500 rounded-full" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </main>
      </div>
      {/* Submit test dialog */}
      <SubmitTestDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        areAllQuestionsAnswered={areAllQuestionsAnswered}
        onSubmit={onSubmit}
        onCancel={() => setShowSubmitDialog(false)}
      />
    </div>
  );
};
