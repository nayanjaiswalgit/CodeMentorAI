import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Loader2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Courses() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['/api/courses'],
  });

  const { data: userProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['/api/user-progress'],
  });

  // Get user's progress for a specific course
  const getCourseProgress = (courseId: number) => {
    if (!userProgress) return 0;
    
    // Find all progress entries for this course
    const courseProgress = userProgress.filter(p => p.courseId === courseId);
    if (courseProgress.length === 0) return 0;
    
    // Count completed lessons
    const completedCount = new Set(
      courseProgress
        .filter(p => p.lessonId && p.completed)
        .map(p => p.lessonId)
    ).size;
    
    // Get total lessons for this course
    const course = courses?.find(c => c.id === courseId);
    const totalLessons = course?.lessons?.length || 0;
    
    if (totalLessons === 0) return 0;
    return Math.round((completedCount / totalLessons) * 100);
  };

  // Filter courses based on search query and selected filters
  const filterCourses = (courses = []) => {
    return courses.filter(course => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Language filter
      const matchesLanguage = selectedLanguage === "all" || 
        course.language === selectedLanguage;
      
      // Level filter
      const matchesLevel = selectedLevel === "all" || 
        course.difficulty === selectedLevel;
      
      return matchesSearch && matchesLanguage && matchesLevel;
    });
  };

  // Get in-progress courses
  const getInProgressCourses = () => {
    if (!courses || !userProgress) return [];
    
    // Find courses with any progress
    return courses.filter(course => {
      const hasProgress = userProgress.some(p => 
        p.courseId === course.id && p.lessonId && p.completed
      );
      
      // Only include if there's progress but not completed
      const progress = getCourseProgress(course.id);
      return hasProgress && progress < 100;
    });
  };

  // Get completed courses
  const getCompletedCourses = () => {
    if (!courses || !userProgress) return [];
    
    // Find courses with 100% progress
    return courses.filter(course => {
      const progress = getCourseProgress(course.id);
      return progress === 100;
    });
  };

  // Get languages from available courses
  const getAvailableLanguages = () => {
    if (!courses) return [];
    const languages = new Set(courses.map(course => course.language));
    return Array.from(languages);
  };

  // Get difficulty levels from available courses
  const getDifficultyLevels = () => {
    if (!courses) return [];
    const levels = new Set(courses.map(course => course.difficulty));
    return Array.from(levels);
  };

  const isLoading = isLoadingCourses || isLoadingProgress;

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
            <h1 className="text-2xl font-semibold mb-1">My Courses</h1>
            <p className="text-neutral-600">
              Browse our courses and continue your learning journey
            </p>
          </div>
          
          {/* Search and Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search courses..."
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
            
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {getDifficultyLevels().map(level => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Course Tabs */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList>
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            {/* All Courses Tab */}
            <TabsContent value="all" className="mt-4">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-neutral-200 rounded-full mb-4"></div>
                        <div className="h-6 bg-neutral-200 rounded mb-2 w-3/4"></div>
                        <div className="h-4 bg-neutral-200 rounded mb-1 w-full"></div>
                        <div className="h-4 bg-neutral-200 rounded mb-4 w-2/3"></div>
                        <div className="h-8 bg-neutral-200 rounded w-1/3 ml-auto"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : courses?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterCourses(courses).map(course => {
                    const progress = getCourseProgress(course.id);
                    return (
                      <Card key={course.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-4">
                              {course.language === "javascript" && <i className="fab fa-js text-xl text-primary"></i>}
                              {course.language === "python" && <i className="fab fa-python text-xl text-primary"></i>}
                              {course.language === "cpp" && <i className="fas fa-code text-xl text-primary"></i>}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <span className="text-xs font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full mr-2">
                                  {course.language.charAt(0).toUpperCase() + course.language.slice(1)}
                                </span>
                                <span className="text-xs font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">
                                  {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-medium mb-2">{course.title}</h3>
                          <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                            {course.description}
                          </p>
                          
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{progress > 0 ? 'In Progress' : 'Not Started'}</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} />
                          </div>
                          
                          <Button asChild className="w-full">
                            <Link href={`/courses/${course.id}`}>
                              <a>{progress > 0 ? 'Continue' : 'Start Course'}</a>
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-500 mb-4">
                    <i className="fas fa-book-open text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium">No courses found</h3>
                  <p className="text-neutral-600">
                    No courses match your current filters
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* In Progress Tab */}
            <TabsContent value="in-progress" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : getInProgressCourses().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterCourses(getInProgressCourses()).map(course => {
                    const progress = getCourseProgress(course.id);
                    return (
                      <Card key={course.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-4">
                              {course.language === "javascript" && <i className="fab fa-js text-xl text-primary"></i>}
                              {course.language === "python" && <i className="fab fa-python text-xl text-primary"></i>}
                              {course.language === "cpp" && <i className="fas fa-code text-xl text-primary"></i>}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <span className="text-xs font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full mr-2">
                                  {course.language.charAt(0).toUpperCase() + course.language.slice(1)}
                                </span>
                                <span className="text-xs font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">
                                  {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-medium mb-2">{course.title}</h3>
                          <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                            {course.description}
                          </p>
                          
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>In Progress</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} />
                          </div>
                          
                          <Button asChild className="w-full">
                            <Link href={`/courses/${course.id}`}>
                              <a>Continue</a>
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-500 mb-4">
                    <i className="fas fa-book-open text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium">No courses in progress</h3>
                  <p className="text-neutral-600">
                    Start a course to see it here
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* Completed Tab */}
            <TabsContent value="completed" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : getCompletedCourses().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterCourses(getCompletedCourses()).map(course => (
                    <Card key={course.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-4">
                            <i className="fas fa-check-circle text-xl"></i>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="text-xs font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full mr-2">
                                {course.language.charAt(0).toUpperCase() + course.language.slice(1)}
                              </span>
                              <span className="text-xs font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">
                                {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-medium mb-2">{course.title}</h3>
                        <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                          {course.description}
                        </p>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-green-600 font-medium">Completed</span>
                            <span className="font-medium">100%</span>
                          </div>
                          <Progress value={100} className="bg-green-100" />
                        </div>
                        
                        <Button asChild variant="outline" className="w-full">
                          <Link href={`/courses/${course.id}`}>
                            <a>Review Course</a>
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-500 mb-4">
                    <i className="fas fa-graduation-cap text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium">No completed courses</h3>
                  <p className="text-neutral-600">
                    Complete a course to see it here
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
