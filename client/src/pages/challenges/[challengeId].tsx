import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import CodeEditor from "@/components/learning/CodeEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const difficultyColors = {
  easy: { bg: "bg-green-100", text: "text-green-800" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-800" },
  hard: { bg: "bg-red-100", text: "text-red-800" }
};

export default function ChallengeDetail() {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, params] = useRoute("/challenges/:challengeId");
  const challengeId = params?.challengeId ? parseInt(params.challengeId) : null;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const { data: challenge, isLoading } = useQuery({
    queryKey: [`/api/challenges/${challengeId}`],
    enabled: !!challengeId,
  });

  const { data: userProgress } = useQuery({
    queryKey: ['/api/user-progress'],
  });

  // Check if this challenge was previously completed
  const isChallengeCompleted = () => {
    if (!userProgress || !challengeId) return false;
    return userProgress.some(p => 
      p.challengeId === challengeId && p.completed
    );
  };

  // Mutation for recording progress
  const progressMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/user-progress", data);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/user-progress'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error saving progress",
        description: error.message || "An error occurred while saving your progress",
      });
    }
  });

  // Handle challenge submission
  const handleSubmission = async (code: string, executionResult: any, feedback: any) => {
    setIsSubmitted(true);
    setSubmissionResult({
      code,
      executionResult,
      feedback
    });
    
    // Calculate score based on feedback
    const isCorrect = executionResult.success && 
      feedback.correctness >= 7; // Consider it correct if score is 7 or higher
    
    // Record progress
    progressMutation.mutate({
      challengeId,
      completed: isCorrect,
      score: feedback.correctness * 10,
      codeSubmission: code
    });
  };

  if (!challengeId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Invalid Challenge ID</h2>
          <p className="text-neutral-600 mt-2">The challenge ID is missing or invalid.</p>
          <Button asChild className="mt-4">
            <a href="/challenges">Back to Challenges</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 font-sans text-neutral-800 flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : challenge ? (
            <div>
              <div className="mb-6">
                <Breadcrumb className="mb-2">
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/challenges">Challenges</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/challenges/${challengeId}`}>{challenge.title}</BreadcrumbLink>
                  </BreadcrumbItem>
                </Breadcrumb>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <h1 className="text-2xl font-semibold">{challenge.title}</h1>
                      <Badge 
                        variant="outline"
                        className={`ml-3 ${difficultyColors[challenge.difficulty.toLowerCase()]?.bg || 'bg-gray-100'} ${difficultyColors[challenge.difficulty.toLowerCase()]?.text || 'text-gray-800'} border-0 text-xs font-medium px-2.5 py-0.5`}
                      >
                        {challenge.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex mt-4 md:mt-0 space-x-2">
                    <div className="text-sm bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full">
                      <span className="capitalize">{challenge.language}</span>
                    </div>
                    <div className="text-sm bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full">
                      <i className="far fa-clock mr-1"></i>
                      <span>{challenge.estimatedMinutes || 20} min</span>
                    </div>
                    {isChallengeCompleted() && (
                      <div className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        <i className="fas fa-check-circle mr-1"></i>
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Challenge description */}
                <Card className="lg:col-span-1">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-medium mb-4">Challenge Description</h2>
                    <div className="prose max-w-none mb-6">
                      <p>{challenge.description}</p>
                    </div>
                    
                    {challenge.expectedOutput && (
                      <div className="mb-6">
                        <h3 className="text-md font-medium mb-2">Expected Output</h3>
                        <div className="bg-neutral-100 p-3 rounded-md font-mono text-sm">
                          <pre>{challenge.expectedOutput}</pre>
                        </div>
                      </div>
                    )}
                    
                    {Array.isArray(challenge.testCases) && challenge.testCases.length > 0 && (
                      <div>
                        <h3 className="text-md font-medium mb-2">Test Cases</h3>
                        <div className="space-y-2">
                          {challenge.testCases.map((testCase, index) => (
                            <div key={index} className="bg-neutral-100 p-3 rounded-md">
                              <div className="text-sm font-medium mb-1">Input:</div>
                              <div className="font-mono text-sm mb-2">{testCase.input}</div>
                              <div className="text-sm font-medium mb-1">Expected:</div>
                              <div className="font-mono text-sm">{testCase.expected}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Code editor */}
                <Card className="lg:col-span-2">
                  <CardContent className="p-6">
                    <div className="h-[calc(100vh-280px)]">
                      <CodeEditor
                        initialCode={challenge.initialCode || "// Your solution here"}
                        language={challenge.language}
                        challenge={{
                          id: challenge.id,
                          title: challenge.title,
                          description: challenge.description,
                          expectedOutput: challenge.expectedOutput
                        }}
                        onSubmit={handleSubmission}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Challenge Not Found</h2>
                <p className="text-neutral-600 mt-2">The challenge you're looking for doesn't exist.</p>
                <Button asChild className="mt-4">
                  <a href="/challenges">Back to Challenges</a>
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
