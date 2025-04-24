import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Editor } from "@monaco-editor/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Loader2,
  Clock,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Flag,
} from "lucide-react";
import { MultiSelectOptions } from "@/components/tests/MultiSelectOptions";
import { McqOptions } from "@/components/tests/McqOptions";
import { CodeBlock } from "@/components/tests/CodeBlock";
import { SubmitTestDialog } from "@/components/tests/SubmitTestDialog";
import { TestIntro } from "@/components/tests/TestIntro";
import { TestResultView } from "@/components/tests/TestResultView";
import { TestNotFound } from "@/components/tests/TestNotFound";
import { TestInProgress } from "@/components/tests/TestInProgress";

// Question types
type QuestionType = "mcq" | "code-mcq" | "multi-select";

// Basic question interface
interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  points: number;
}

// MCQ question type
interface McqQuestion extends BaseQuestion {
  type: "mcq";
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// Code MCQ question type
interface CodeMcqQuestion extends BaseQuestion {
  type: "code-mcq";
  code: string;
  language: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// Multiple selection question type
interface MultiSelectQuestion extends BaseQuestion {
  type: "multi-select";
  options: string[];
  correctAnswers: number[];
  explanation?: string;
}

// Union type for all question types
type Question = McqQuestion | CodeMcqQuestion | MultiSelectQuestion;

// Test interface
interface Test {
  id: number;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  timeLimit: number;
  passingScore: number;
  questions: Question[];
}

// User answer interfaces
interface McqAnswer {
  questionId: string;
  selectedOption: number | null;
}

interface MultiSelectAnswer {
  questionId: string;
  selectedOptions: number[];
}

type Answer = McqAnswer | MultiSelectAnswer;

// Test result interface
interface TestResult {
  testId: number;
  completed: boolean;
  score: number;
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
  questionResults: {
    questionId: string;
    correct: boolean;
    points: number;
    earnedPoints: number;
  }[];
}

export default function TestDetail() {
  const { testId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Test state
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, McqAnswer | MultiSelectAnswer>
  >({});
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);

  // Fetch test data for this testId only
  const {
    data: test,
    isLoading,
    error,
  } = useQuery<Test>({
    queryKey: ["/api/tests", testId],
    queryFn: async () => {
      const res = await fetch(`/api/tests/${testId}`);
      if (!res.ok) throw new Error("Failed to fetch test");
      return res.json();
    },
    enabled: !!testId,
  });

  console.log(test);
  // Handle timer effect
  useEffect(() => {
    if (!timerActive || !test) return;

    const timer = setInterval(() => {
      if (timerSeconds > 0) {
        setTimerSeconds(timerSeconds - 1);
      } else if (timerMinutes > 0) {
        setTimerMinutes(timerMinutes - 1);
        setTimerSeconds(59);
      } else {
        clearInterval(timer);
        handleTestSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timerMinutes, timerSeconds, timerActive]);

  // Initialize timer when test starts
  useEffect(() => {
    if (started && test && !timerActive) {
      setTimerMinutes(test.timeLimit);
      setTimerSeconds(0);
      setTimerActive(true);
    }
  }, [started, test, timerActive]);

  // Format time display
  const formatTime = () => {
    const minutes = timerMinutes < 10 ? `0${timerMinutes}` : timerMinutes;
    const seconds = timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds;
    return `${minutes}:${seconds}`;
  };

  // Get current question
  const getCurrentQuestion = (): Question | null => {
    if (!test || !test.questions.length) return null;
    return test.questions[currentQuestionIndex];
  };

  // Initialize answer for a question if not already set
  const initializeAnswer = useCallback(
    (question: Question) => {
      if (answers[question.id]) return;

      if (question.type === "mcq" || question.type === "code-mcq") {
        setAnswers((prev) => ({
          ...prev,
          [question.id]: {
            questionId: question.id,
            selectedOption: null,
          } as McqAnswer,
        }));
      } else if (question.type === "multi-select") {
        setAnswers((prev) => ({
          ...prev,
          [question.id]: {
            questionId: question.id,
            selectedOptions: [],
          } as MultiSelectAnswer,
        }));
      }
    },
    [answers],
  );

  // Initialize answers when questions load
  useEffect(() => {
    if (test && test.questions.length && started) {
      test.questions.forEach((q) => initializeAnswer(q));
    }
  }, [test, started, initializeAnswer]);

  // Get current answer
  const getCurrentAnswer = () => {
    const question = getCurrentQuestion();
    if (!question) return null;
    return answers[question.id] || null;
  };

  // Handle MCQ option selection
  const handleSelectMcqOption = (optionIndex: number) => {
    const question = getCurrentQuestion();
    if (!question) return;

    setAnswers((prev) => ({
      ...prev,
      [question.id]: {
        questionId: question.id,
        selectedOption: optionIndex,
      } as McqAnswer,
    }));
  };

  // Handle multi-select option selection
  const handleToggleMultiSelectOption = (optionIndex: number) => {
    const question = getCurrentQuestion();
    if (!question || question.type !== "multi-select") return;

    const currentAnswer = answers[question.id] as MultiSelectAnswer | undefined;
    const selectedOptions = currentAnswer?.selectedOptions || [];

    const newSelectedOptions = selectedOptions.includes(optionIndex)
      ? selectedOptions.filter((idx) => idx !== optionIndex)
      : [...selectedOptions, optionIndex];

    setAnswers((prev) => ({
      ...prev,
      [question.id]: {
        questionId: question.id,
        selectedOptions: newSelectedOptions,
      } as MultiSelectAnswer,
    }));
  };

  // Check if multi-select option is selected
  const isMultiSelectOptionSelected = (optionIndex: number) => {
    const answer = getCurrentAnswer() as MultiSelectAnswer | null;
    if (!answer) return false;
    return answer.selectedOptions.includes(optionIndex);
  };

  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Navigate to next question
  const goToNextQuestion = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Toggle flag on current question
  const toggleFlagQuestion = () => {
    const question = getCurrentQuestion();
    if (!question) return;

    if (flaggedQuestions.includes(question.id)) {
      setFlaggedQuestions(flaggedQuestions.filter((id) => id !== question.id));
    } else {
      setFlaggedQuestions([...flaggedQuestions, question.id]);
    }
  };

  // Check if current question is flagged
  const isCurrentQuestionFlagged = () => {
    const question = getCurrentQuestion();
    if (!question) return false;
    return flaggedQuestions.includes(question.id);
  };

  // Check if all questions have answers
  const areAllQuestionsAnswered = () => {
    if (!test) return false;

    return test.questions.every((question) => {
      const answer = answers[question.id];
      if (!answer) return false;

      if (
        (question.type === "mcq" || question.type === "code-mcq") &&
        (answer as McqAnswer).selectedOption === null
      ) {
        return false;
      }

      if (
        question.type === "multi-select" &&
        (answer as MultiSelectAnswer).selectedOptions.length === 0
      ) {
        return false;
      }

      return true;
    });
  };

  // Handle test submission
  const handleTestSubmit = async () => {
    if (!test) return;

    try {
      const result = await apiRequest("POST", `/api/tests/${test.id}/submit`, {
        answers,
      });

      // Invalidate test attempts cache
      queryClient.invalidateQueries({ queryKey: ["/api/user-test-attempts"] });

      setTestResult(result);
      setShowResult(true);
      setTimerActive(false);

      // Display toast based on result
      if (result.passed) {
        toast({
          title: "Test passed!",
          description: `You scored ${result.score}% on the test.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Test not passed",
          description: `You scored ${result.score}%, but needed ${test.passingScore}% to pass.`,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to submit test",
        description:
          error.message || "An error occurred while submitting your test",
      });
    }
  };

  // Handle test start
  const handleStartTest = () => {
    setStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setFlaggedQuestions([]);
    setTestResult(null);
    setShowResult(false);
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!test) return 0;
    const totalQuestions = test.questions.length;
    const answeredQuestions = Object.values(answers).filter((answer) => {
      if ((answer as McqAnswer).selectedOption !== undefined) {
        return (answer as McqAnswer).selectedOption !== null;
      }
      return (answer as MultiSelectAnswer).selectedOptions.length > 0;
    }).length;

    return (answeredQuestions / totalQuestions) * 100;
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !test) {
    return <TestNotFound onBack={() => setLocation("/tests")} />;
  }

  // If showing results
  if (showResult && testResult) {
    return (
      <div className="bg-neutral-50 font-sans text-neutral-800 flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6">
            <TestResultView
              test={test}
              testResult={testResult}
              answers={answers}
              onRetake={handleStartTest}
              onBack={() => setLocation("/tests")}
            />
          </main>
        </div>
      </div>
    );
  }

  // If not started yet, show the test info
  if (!started) {
    return (
      <div className="bg-neutral-50 font-sans text-neutral-800 flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
              <TestIntro
                title={test.title}
                description={test.description}
                language={test.language}
                difficulty={test.difficulty}
                timeLimit={test.timeLimit}
                passingScore={test.passingScore}
                questionsCount={test.questions.length}
                onStart={handleStartTest}
                totalPoints={test.questions.reduce((sum, q) => sum + q.points, 0)}
              />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Test in progress UI
  const currentQuestion = getCurrentQuestion();
  if (!currentQuestion) return null;

  return (
    <TestInProgress
      test={test}
      currentQuestionIndex={currentQuestionIndex}
      currentQuestion={currentQuestion}
      answers={answers}
      flaggedQuestions={flaggedQuestions}
      timer={formatTime()}
      progress={calculateProgress()}
      onSelectMcqOption={handleSelectMcqOption}
      onToggleMultiSelectOption={handleToggleMultiSelectOption}
      onPrevious={goToPreviousQuestion}
      onNext={goToNextQuestion}
      onFlag={toggleFlagQuestion}
      onQuestionNav={setCurrentQuestionIndex}
      onSubmit={handleTestSubmit}
      onOpenSubmitDialog={() => setShowSubmitDialog(true)}
      showSubmitDialog={showSubmitDialog}
      setShowSubmitDialog={setShowSubmitDialog}
      areAllQuestionsAnswered={areAllQuestionsAnswered()}
    />
  );
}
