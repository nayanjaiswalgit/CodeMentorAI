import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CodeEditor from "./CodeEditor";
import McqQuiz from "./McqQuiz";

interface CourseContentProps {
  courseId: number;
}

export default function CourseContent({ courseId }: CourseContentProps) {
  const { toast } = useToast();
  const [activeLesson, setActiveLesson] = useState<number | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
  });

  const { data: userProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: [`/api/user-progress/courses/${courseId}`],
    onSuccess: (data) => {
      // Set initial completed lessons
      const completed = data
        .filter(p => p.lessonId && p.completed)
        .map(p => p.lessonId!);
      
      setCompletedLessons(completed);
      
      // Set active lesson to first incomplete lesson or first lesson
      if (course?.lessons) {
        const firstIncomplete = course.lessons.find(l => !completed.includes(l.id));
        if (firstIncomplete) {
          setActiveLesson(firstIncomplete.id);
        } else if (course.lessons.length > 0) {
          setActiveLesson(course.lessons[0].id);
        }
      }
    }
  });

  // Get lesson by ID
  const getLesson = (lessonId: number) => {
    return course?.lessons?.find(l => l.id === lessonId);
  };

  // Check if lesson is completed
  const isLessonCompleted = (lessonId: number) => {
    return completedLessons.includes(lessonId);
  };

  // Mark lesson as completed
  const markLessonCompleted = async (lessonId: number) => {
    try {
      await apiRequest("POST", "/api/user-progress", {
        courseId,
        lessonId,
        completed: true,
        score: 100
      });
      
      // Update local state
      if (!completedLessons.includes(lessonId)) {
        setCompletedLessons([...completedLessons, lessonId]);
      }
      
      // Invalidate user progress queries
      queryClient.invalidateQueries({ queryKey: [`/api/user-progress/courses/${courseId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-progress'] });
      
      toast({
        title: "Progress Updated",
        description: "Lesson marked as completed",
      });
      
      // Auto-advance to next lesson if available
      if (course?.lessons) {
        const currentIndex = course.lessons.findIndex(l => l.id === lessonId);
        if (currentIndex < course.lessons.length - 1) {
          setActiveLesson(course.lessons[currentIndex + 1].id);
        }
      }
    } catch (error) {
      toast({
        title: "Failed to update progress",
        description: error.message || "An error occurred while saving your progress",
        variant: "destructive",
      });
    }
  };

  // Calculate overall progress
  const calculateProgress = () => {
    if (!course?.lessons) return 0;
    return Math.round((completedLessons.length / course.lessons.length) * 100);
  };

  if (isLoadingCourse || isLoadingProgress) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center p-12">
        <h3 className="text-lg font-medium text-neutral-700">Course not found</h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Sidebar: Lessons list */}
      <div className="md:col-span-1">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">Course Content</h3>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span className="font-medium">{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} />
            </div>
            
            <Accordion type="single" collapsible>
              {course.lessons?.map((lesson, index) => (
                <AccordionItem value={`lesson-${lesson.id}`} key={lesson.id}>
                  <AccordionTrigger className="py-3">
                    <div className="flex items-center text-left">
                      <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center text-xs font-medium
                        ${isLessonCompleted(lesson.id) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-neutral-100 text-neutral-600'
                        }`}>
                        {isLessonCompleted(lesson.id) ? (
                          <i className="fas fa-check"></i>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className="font-medium">{lesson.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-9 text-sm text-neutral-600 space-y-2">
                      <p>Estimated time: {lesson.estimatedMinutes || 30} min</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary-dark hover:bg-primary-light/10"
                        onClick={() => setActiveLesson(lesson.id)}
                      >
                        {isLessonCompleted(lesson.id) ? 'Review Lesson' : 'Start Lesson'}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content: Active lesson */}
      <div className="md:col-span-2">
        {activeLesson ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-2">
                  {getLesson(activeLesson)?.title}
                </h2>
                
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: getLesson(activeLesson)?.content || "" }} />
                </div>
                
                {/* Some lessons might have code examples */}
                {getLesson(activeLesson)?.content?.includes('```') && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Example Code</h3>
                    <CodeEditor
                      initialCode={getLesson(activeLesson)?.content
                        ?.split('```')
                        ?.filter((_, i) => i % 2 === 1)
                        ?.join('\n') || "// Example code"}
                      language={course.language}
                      readOnly={true}
                    />
                  </div>
                )}
                
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentIndex = course.lessons.findIndex(l => l.id === activeLesson);
                      if (currentIndex > 0) {
                        setActiveLesson(course.lessons[currentIndex - 1].id);
                      }
                    }}
                    disabled={course.lessons.findIndex(l => l.id === activeLesson) === 0}
                  >
                    Previous Lesson
                  </Button>
                  
                  {isLessonCompleted(activeLesson) ? (
                    <Button
                      onClick={() => {
                        const currentIndex = course.lessons.findIndex(l => l.id === activeLesson);
                        if (currentIndex < course.lessons.length - 1) {
                          setActiveLesson(course.lessons[currentIndex + 1].id);
                        }
                      }}
                      disabled={course.lessons.findIndex(l => l.id === activeLesson) === course.lessons.length - 1}
                    >
                      Next Lesson
                    </Button>
                  ) : (
                    <Button onClick={() => markLessonCompleted(activeLesson)}>
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Practice exercises could be added here */}
            {/* <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-3">Practice Exercise</h3>
                <CodeEditor
                  initialCode="// Your code here"
                  language={course.language}
                />
              </CardContent>
            </Card> */}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-medium mb-2">No lesson selected</h3>
              <p className="text-neutral-600 mb-4">Select a lesson from the sidebar to start learning</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
