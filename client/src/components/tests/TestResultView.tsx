import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Info } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TestResultViewProps {
  test: any;
  testResult: any;
  answers: any;
  onRetake: () => void;
  onBack: () => void;
}

export const TestResultView: React.FC<TestResultViewProps> = ({ test, testResult, answers, onRetake, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl">Test Results</CardTitle>
            {testResult.passed ? (
              <Badge className="bg-green-100 text-green-800">Passed</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">Failed</Badge>
            )}
          </div>
          <CardDescription>{test.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Overall Score</h3>
                <span className={`font-semibold ${testResult.passed ? "text-green-600" : "text-red-600"}`}>
                  {testResult.score}%
                </span>
              </div>
              <Progress value={testResult.score} className={`h-3 ${testResult.passed ? "bg-green-100" : "bg-red-100"}`} />
              <p className="text-sm text-neutral-600">
                You earned {testResult.earnedPoints} out of {testResult.totalPoints} points. Passing score required: {test.passingScore}%.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">Question Results</h3>
              {test.questions.map((question: any, index: number) => {
                const result = testResult.questionResults?.find((r: any) => r.questionId === question.id);
                const answer = answers[question.id];
                return (
                  <Card key={question.id} className={`overflow-hidden border-l-4 ${result?.correct ? "border-l-green-500" : "border-l-red-500"}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium mb-2">Question {index + 1}</h4>
                        <div className="flex items-center gap-1">
                          {result?.correct ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-600">{result.earnedPoints}/{question.points} points</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-600">{result?.earnedPoints || 0}/{question.points} points</span>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="mb-3">{question.question}</p>
                      {question.type === "code-mcq" && (
                        <div className="border rounded-md overflow-hidden mb-4">
                          <Editor
                            height="150px"
                            language={question.language}
                            value={question.code}
                            options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 14 }}
                          />
                        </div>
                      )}
                      <div className="space-y-2 mb-3">
                        {question.type === "multi-select" ? (
                          <div className="space-y-2">
                            {question.options.map((option: string, optIndex: number) => {
                              const isCorrect = question.correctAnswers.includes(optIndex);
                              const isSelected = answer?.selectedOptions?.includes(optIndex);
                              return (
                                <div key={optIndex} className={`flex items-center p-2 rounded-md ${isCorrect && isSelected ? "bg-green-100" : isCorrect && !isSelected ? "bg-green-50 border border-green-200" : !isCorrect && isSelected ? "bg-red-100" : ""}` }>
                                  <Checkbox checked={isSelected} disabled className={`mr-2 ${isCorrect && isSelected ? "border-green-500 text-green-500" : !isCorrect && isSelected ? "border-red-500 text-red-500" : ""}`} />
                                  <Label className="flex-1">{option}{isCorrect && (<span className="ml-2 text-xs text-green-600">(correct)</span>)}</Label>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {question.options.map((option: string, optIndex: number) => {
                              const isCorrect = (question.type === "mcq" || question.type === "code-mcq") ? question.correctAnswer === optIndex : false;
                              const isSelected = answer?.selectedOption === optIndex;
                              return (
                                <div key={optIndex} className={`flex items-center p-2 rounded-md ${isCorrect && isSelected ? "bg-green-100" : isCorrect && !isSelected ? "bg-green-50 border border-green-200" : !isCorrect && isSelected ? "bg-red-100" : ""}` }>
                                  <input type="radio" checked={isSelected} disabled className={`mr-2 ${isCorrect && isSelected ? "border-green-500 text-green-500" : !isCorrect && isSelected ? "border-red-500 text-red-500" : ""}`} />
                                  <Label className="flex-1">{option}{isCorrect && (<span className="ml-2 text-xs text-green-600">(correct)</span>)}</Label>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {question.explanation && (
                        <div className="bg-blue-50 p-3 rounded-md text-sm">
                          <div className="flex items-center gap-1 font-medium text-blue-700 mb-1">
                            <Info className="h-4 w-4" />
                            <span>Explanation</span>
                          </div>
                          <p className="text-blue-800">{question.explanation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>Back to Tests</Button>
          <Button onClick={onRetake}>Retake Test</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
