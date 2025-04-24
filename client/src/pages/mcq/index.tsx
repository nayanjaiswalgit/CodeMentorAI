import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import McqQuiz from "@/components/learning/McqQuiz";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Mcq, UserProgress } from "@shared/schema";

export default function McqQuizzes() {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedTab, setSelectedTab] = useState("all");

  const { data: mcqs, isLoading } = useQuery<Mcq[]>({
    queryKey: ['/api/mcqs'],
  });

  const { data: userProgress } = useQuery<UserProgress[]>({
    queryKey: ['/api/user-progress'],
  });

  // Check if an MCQ was completed
  const isMcqCompleted = (mcqId: number) => {
    if (!userProgress) return false;
    return userProgress.some((p: UserProgress) => 
      p.mcqId === mcqId && p.completed
    );
  };

  // Filter MCQs based on search query and selected filters
  const filterMcqs = (mcqs: Mcq[] = []) => {
    if (!mcqs || mcqs.length === 0) return [];
    
    return mcqs.filter(mcq => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        mcq.question.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Language filter
      const matchesLanguage = selectedLanguage === "all" || 
        mcq.language === selectedLanguage;
      
      // Tab filter
      if (selectedTab === "completed") {
        return matchesSearch && matchesLanguage && isMcqCompleted(mcq.id);
      } else if (selectedTab === "pending") {
        return matchesSearch && matchesLanguage && !isMcqCompleted(mcq.id);
      }
      
      return matchesSearch && matchesLanguage;
    });
  };

  // Get completed MCQs
  const getCompletedMcqs = (): Mcq[] => {
    if (!mcqs || !userProgress) return [];
    return mcqs.filter(mcq => isMcqCompleted(mcq.id));
  };

  // Get available languages from MCQs
  const getAvailableLanguages = (): string[] => {
    if (!mcqs) return [];
    const languages = new Set(mcqs.map(mcq => mcq.language || ""));
    return Array.from(languages).filter(lang => lang !== "");
  };
  
  // Format language for display
  const formatLanguage = (language: string | null): string => {
    if (!language) return "General";
    return language.charAt(0).toUpperCase() + language.slice(1);
  };

  // Handle MCQ completion
  const handleMcqComplete = async (result: boolean, mcqId: number) => {
    try {
      await apiRequest("POST", "/api/user-progress", {
        mcqId,
        completed: result,
        score: result ? 100 : 0
      });
      
      // Invalidate progress data
      queryClient.invalidateQueries({ queryKey: ['/api/user-progress'] });
      
      toast({
        title: result ? "Correct answer!" : "Incorrect answer",
        description: result 
          ? "Great job! Your answer was correct." 
          : "Your answer was incorrect. Review the explanation and try again.",
        variant: result ? "default" : "destructive"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save progress",
        description: error.message || "An error occurred while saving your progress"
      });
    }
  };

  return (
    <div className="bg-neutral-50 font-sans text-neutral-800 flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">Multiple Choice Quizzes</h1>
            <p className="text-neutral-600">
              Test your knowledge with our collection of multiple choice quizzes
            </p>
          </div>
          
          {/* Search and Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search quizzes..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {getAvailableLanguages().map(language => (
                  <SelectItem key={language} value={language}>
                    {language.charAt(0).toUpperCase() + language.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* MCQ Tabs */}
          <Tabs 
            defaultValue="all" 
            className="mb-8"
            onValueChange={(value) => setSelectedTab(value)}
          >
            <TabsList>
              <TabsTrigger value="all">All Quizzes</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : mcqs && mcqs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filterMcqs(mcqs).map(mcq => (
                    <Card key={mcq.id} className={isMcqCompleted(mcq.id) ? "border-green-300" : ""}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm px-2 py-1 bg-primary bg-opacity-10 text-primary rounded-full">
                            {formatLanguage(mcq.language)}
                          </div>
                          {isMcqCompleted(mcq.id) && (
                            <div className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              <i className="fas fa-check-circle mr-1"></i>
                              Completed
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-lg mt-2">{mcq.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <McqQuiz 
                          mcq={{
                            id: mcq.id,
                            question: mcq.question,
                            options: Array.isArray(mcq.options) ? mcq.options : [],
                            correctAnswer: mcq.correctAnswer,
                            explanation: mcq.explanation || undefined
                          }} 
                          onComplete={(result, mcqId) => handleMcqComplete(result, mcqId)} 
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-500 mb-4">
                    <i className="fas fa-question text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium">No quizzes found</h3>
                  <p className="text-neutral-600">
                    No quizzes match your current filters
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* Pending Quizzes Tab */}
            <TabsContent value="pending" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filterMcqs(mcqs).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filterMcqs(mcqs).map(mcq => (
                    <Card key={mcq.id}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm px-2 py-1 bg-primary bg-opacity-10 text-primary rounded-full">
                            {formatLanguage(mcq.language)}
                          </div>
                        </div>
                        <CardTitle className="text-lg mt-2">{mcq.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <McqQuiz 
                          mcq={{
                            id: mcq.id,
                            question: mcq.question,
                            options: Array.isArray(mcq.options) ? mcq.options : [],
                            correctAnswer: mcq.correctAnswer,
                            explanation: mcq.explanation || undefined
                          }} 
                          onComplete={(result, mcqId) => handleMcqComplete(result, mcqId)} 
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-500 mb-4">
                    <i className="fas fa-check-circle text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium">All quizzes completed!</h3>
                  <p className="text-neutral-600">
                    You've completed all available quizzes in this category
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* Completed Quizzes Tab */}
            <TabsContent value="completed" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : getCompletedMcqs().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filterMcqs(getCompletedMcqs()).map(mcq => (
                    <Card key={mcq.id} className="border-green-300">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm px-2 py-1 bg-primary bg-opacity-10 text-primary rounded-full">
                            {formatLanguage(mcq.language)}
                          </div>
                          <div className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            <i className="fas fa-check-circle mr-1"></i>
                            Completed
                          </div>
                        </div>
                        <CardTitle className="text-lg mt-2">{mcq.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <McqQuiz 
                          mcq={{
                            id: mcq.id,
                            question: mcq.question,
                            options: Array.isArray(mcq.options) ? mcq.options : [],
                            correctAnswer: mcq.correctAnswer,
                            explanation: mcq.explanation || undefined
                          }} 
                          onComplete={(result, mcqId) => handleMcqComplete(result, mcqId)} 
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-500 mb-4">
                    <i className="fas fa-question-circle text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium">No completed quizzes</h3>
                  <p className="text-neutral-600">
                    Complete quizzes to see them here
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}