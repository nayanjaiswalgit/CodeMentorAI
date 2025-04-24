import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TestIntroProps {
  title: string;
  description: string;
  language: string;
  difficulty: string;
  timeLimit: number;
  passingScore: number;
  questionsCount: number;
  totalPoints: number;
  onStart: () => void;
  onBack: () => void;
}

export function TestIntro({ title, description, language, difficulty, timeLimit, passingScore, questionsCount, totalPoints, onStart, onBack }: TestIntroProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-500">Language</h3>
              <p>{language.charAt(0).toUpperCase() + language.slice(1)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-500">Difficulty</h3>
              <p>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-500">Time Limit</h3>
              <p>{timeLimit} minutes</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-500">Passing Score</h3>
              <p>{passingScore}%</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-500">Questions</h3>
              <p>{questionsCount} questions</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-500">Total Points</h3>
              <p>{totalPoints} points</p>
            </div>
          </div>
          <div className="bg-neutral-100 p-4 rounded-md">
            <h3 className="font-medium mb-2">Instructions</h3>
            <ul className="space-y-2 text-sm">
              <li>You have <strong>{timeLimit} minutes</strong> to complete the test.</li>
              <li>You must score at least <strong>{passingScore}%</strong> to pass.</li>
              <li>You can flag questions to review later.</li>
              <li>Once you submit the test, you cannot change your answers.</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back to Tests</Button>
        <Button onClick={onStart}>Start Test</Button>
      </CardFooter>
    </Card>
  );
}
