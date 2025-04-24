import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Plus, Clock, BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle, CardFooter, CardHeader } from "@/components/ui/card";

interface Test {
  id: number;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  timeLimit: number;
  passingScore: number;
  questionCount: number;
  totalPoints: number;
}

interface TestAttempt {
  id: number;
  testId: number;
  userId: number;
  completed: boolean;
  score: number;
  completedAt: string;
  passed: boolean;
}

export default function Tests() {
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  
  // Fetch tests data
  const { data: tests, isLoading: testsLoading } = useQuery<Test[]>({
    queryKey: ['/api/tests'],
  });
  
  // Fetch user test attempts
  const { data: testAttempts, isLoading: attemptsLoading } = useQuery<TestAttempt[]>({
    queryKey: ['/api/user-test-attempts'],
  });
  
  // Filter tests based on search query and selected filters
  const filterTests = (tests: Test[] = []) => {
    return tests.filter(test => {
      // Search filter
      const matchesSearch = 
        searchQuery === "" || 
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Language filter
      const matchesLanguage = selectedLanguage === "all" || test.language === selectedLanguage;
      
      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === "all" || test.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesLanguage && matchesDifficulty;
    });
  };
  
  // Get available languages from tests
  const getAvailableLanguages = () => {
    if (!tests) return [];
    const languages = new Set(tests.map(test => test.language));
    return Array.from(languages);
  };
  
  // Check if test was completed
  const isTestCompleted = (testId: number) => {
    if (!testAttempts) return false;
    return testAttempts.some(attempt => attempt.testId === testId && attempt.completed);
  };
  
  // Check if test was passed
  const isTestPassed = (testId: number) => {
    if (!testAttempts) return false;
    return testAttempts.some(attempt => attempt.testId === testId && attempt.passed);
  };
  
  // Get test score
  const getTestScore = (testId: number) => {
    if (!testAttempts) return null;
    const attempt = testAttempts.find(attempt => attempt.testId === testId && attempt.completed);
    return attempt ? attempt.score : null;
  };
  
  // Get completed tests
  const getCompletedTests = () => {
    if (!tests || !testAttempts) return [];
    return tests.filter(test => isTestCompleted(test.id));
  };
  
  // Format language for display
  const formatLanguage = (language: string): string => {
    return language.charAt(0).toUpperCase() + language.slice(1);
  };
  
  // Format difficulty for display and get color
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-purple-100 text-purple-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Programming Tests</h1>
              <p className="text-neutral-600">
                Test your knowledge with comprehensive tests
              </p>
            </div>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setLocation("/tests/create")}
            >
              <Plus className="h-4 w-4" />
              Create Test
            </Button>
          </div>
          
          {/* Search and Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search tests..."
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
                    {formatLanguage(language)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Tests Tabs */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList>
              <TabsTrigger value="all">All Tests</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {testsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : tests && tests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterTests(tests).map(test => (
                    <Card key={test.id} className={isTestCompleted(test.id) ? "border-green-300" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-sm px-2 py-1 bg-primary bg-opacity-10 text-primary rounded-full">
                            {formatLanguage(test.language)}
                          </div>
                          <Badge className={getDifficultyColor(test.difficulty)}>
                            {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-2">{test.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                          {test.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-neutral-600">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{test.questionCount} questions</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{test.timeLimit} minutes</span>
                          </div>
                          <div>
                            <span>Passing score: {test.passingScore}%</span>
                          </div>
                          <div>
                            <span>Total: {test.totalPoints} points</span>
                          </div>
                        </div>
                        
                        {isTestCompleted(test.id) && (
                          <div className="mt-3 pt-3 border-t border-neutral-200">
                            <div className={`flex items-center gap-1 text-sm ${isTestPassed(test.id) ? 'text-green-600' : 'text-red-600'}`}>
                              <span className="font-medium">
                                {isTestPassed(test.id) ? 'Passed' : 'Failed'} with score: {getTestScore(test.id)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Link href={`/tests/${test.id}`}>
                          <Button variant="outline" className="w-full">
                            {isTestCompleted(test.id) ? 'Retake Test' : 'Start Test'}
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-500 mb-4">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium">No tests found</h3>
                  <p className="text-neutral-600">
                    No tests match your current filters or no tests have been created yet
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setLocation("/tests/create")}
                  >
                    Create Your First Test
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-4">
              {testsLoading || attemptsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : getCompletedTests().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterTests(getCompletedTests()).map(test => (
                    <Card key={test.id} className="border-green-300">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-sm px-2 py-1 bg-primary bg-opacity-10 text-primary rounded-full">
                            {formatLanguage(test.language)}
                          </div>
                          <Badge className={getDifficultyColor(test.difficulty)}>
                            {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-2">{test.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                          {test.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-neutral-600">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{test.questionCount} questions</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{test.timeLimit} minutes</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-neutral-200">
                          <div className={`flex items-center gap-1 text-sm ${isTestPassed(test.id) ? 'text-green-600' : 'text-red-600'}`}>
                            <span className="font-medium">
                              {isTestPassed(test.id) ? 'Passed' : 'Failed'} with score: {getTestScore(test.id)}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Link href={`/tests/${test.id}`}>
                          <Button variant="outline" className="w-full">
                            Retake Test
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-500 mb-4">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium">No tests completed</h3>
                  <p className="text-neutral-600">
                    You haven't completed any tests yet
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setLocation("/tests")}
                  >
                    View All Tests
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}