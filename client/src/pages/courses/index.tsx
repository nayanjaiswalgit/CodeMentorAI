import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SearchAndFilters from "@/components/common/SearchAndFilters";
import ResourceTabs from "@/components/common/ResourceTabs";
import EmptyState from "@/components/common/EmptyState";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { getUniqueValues, capitalize } from "@/lib/resourceUtils";
import { Progress } from "@/components/ui/progress";
import { Loader2, Search } from "lucide-react";
import type { Course } from "@shared/schema";

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

  // Typed filter function
  const filterCourses = (courses: Course[] = []): Course[] => {
    return courses.filter((course) => {
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

  // Typed progress helpers
  const getInProgressCourses = (): Course[] => {
    if (!courses) return [];
    return courses.filter((course) => {
      const progress = getCourseProgress(course.id);
      return progress > 0 && progress < 100;
    });
  };

  const getCompletedCourses = (): Course[] => {
    if (!courses) return [];
    return courses.filter((course) => getCourseProgress(course.id) === 100);
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

  const languageOptions = [
    { value: "all", label: "All Languages" },
    ...getUniqueValues(courses || [], "language").map(l => ({ value: l, label: capitalize(l) })),
  ];

  // Fix: Ensure difficultyOptions is always an array of correct type
  const difficultyOptions = [
    { value: "all", label: "All Levels" },
    ...Array.isArray(courses)
      ? getUniqueValues(courses, "difficulty").map((d: string) => ({ value: d, label: capitalize(d) }))
      : [],
  ];

  // Tabs config
  const tabs = [
    {
      value: "all",
      label: "All Courses",
      render: () =>
        filterCourses(Array.isArray(courses) ? courses : []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterCourses(Array.isArray(courses) ? courses : []).map(course => {
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
                            {capitalize(course.language)}
                          </span>
                          <span className="text-xs font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">
                            {capitalize(course.difficulty)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium mb-2">{course.title}</h3>
                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{course.description}</p>
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
        ) : null,
      empty: {
        icon: <i className="fas fa-book-open text-2xl"></i>,
        title: "No courses found",
        message: "No courses match your current filters",
      },
    },
    {
      value: "in-progress",
      label: "In Progress",
      render: () =>
        filterCourses(Array.isArray(getInProgressCourses()) ? getInProgressCourses() : []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterCourses(Array.isArray(getInProgressCourses()) ? getInProgressCourses() : []).map(course => {
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
                            {capitalize(course.language)}
                          </span>
                          <span className="text-xs font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">
                            {capitalize(course.difficulty)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium mb-2">{course.title}</h3>
                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{course.description}</p>
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
        ) : null,
      empty: {
        icon: <i className="fas fa-book-open text-2xl"></i>,
        title: "No courses in progress",
        message: "Start a course to see it here",
      },
    },
    {
      value: "completed",
      label: "Completed",
      render: () =>
        filterCourses(Array.isArray(getCompletedCourses()) ? getCompletedCourses() : []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterCourses(Array.isArray(getCompletedCourses()) ? getCompletedCourses() : []).map(course => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-4">
                      <i className="fas fa-check-circle text-xl"></i>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="text-xs font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full mr-2">
                          {capitalize(course.language)}
                        </span>
                        <span className="text-xs font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">
                          {capitalize(course.difficulty)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">{course.title}</h3>
                  <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{course.description}</p>
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
        ) : null,
      empty: {
        icon: <i className="fas fa-graduation-cap text-2xl"></i>,
        title: "No completed courses",
        message: "Complete a course to see it here",
      },
    },
  ];

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
          <SearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={[
              {
                label: "Language",
                value: selectedLanguage,
                onChange: setSelectedLanguage,
                options: languageOptions,
                placeholder: "Filter by language",
              },
              {
                label: "Level",
                value: selectedLevel,
                onChange: setSelectedLevel,
                options: difficultyOptions,
                placeholder: "Filter by level",
              },
            ]}
            className="mb-6"
          />
          {/* Tabs for All/In Progress/Completed */}
          <ResourceTabs
            tabs={tabs}
            defaultValue="all"
            isLoading={isLoading}
          />
        </main>
      </div>
    </div>
  );
}
