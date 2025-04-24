import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function CurrentCourse() {
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  const { data: userProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['/api/user-progress'],
    enabled: !!user,
  });

  const [currentCourse, setCurrentCourse] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [remainingTime, setRemainingTime] = useState("");

  useEffect(() => {
    if (userProgress) {
      // Group progress by courseId
      const courseProgress = {};
      userProgress.forEach(progress => {
        if (progress.courseId) {
          if (!courseProgress[progress.courseId]) {
            courseProgress[progress.courseId] = [];
          }
          courseProgress[progress.courseId].push(progress);
        }
      });

      // Find the course with the most recent activity
      let latestCourseId = null;
      let latestActivity = null;

      Object.entries(courseProgress).forEach(([courseId, progresses]) => {
        const latest = progresses.reduce((latest, current) => {
          return new Date(current.attemptedAt) > new Date(latest.attemptedAt) ? current : latest;
        });

        if (!latestActivity || new Date(latest.attemptedAt) > new Date(latestActivity.attemptedAt)) {
          latestCourseId = parseInt(courseId);
          latestActivity = latest;
        }
      });

      if (latestCourseId) {
        // Fetch the course details
        fetch(`/api/courses/${latestCourseId}`)
          .then(res => res.json())
          .then(course => {
            setCurrentCourse(course);
            
            // Calculate progress percentage
            const totalLessons = course.lessons?.length || 0;
            const completedLessons = courseProgress[latestCourseId].filter(p => p.completed).length;
            const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            setProgressPercentage(percentage);
            
            // Calculate remaining time
            const remainingLessons = totalLessons - completedLessons;
            const avgTimePerLesson = course.lessons?.reduce((sum, lesson) => sum + (lesson.estimatedMinutes || 30), 0) / totalLessons;
            const estRemainingMinutes = remainingLessons * avgTimePerLesson;
            
            if (estRemainingMinutes < 60) {
              setRemainingTime(`${Math.round(estRemainingMinutes)}min`);
            } else {
              const hours = Math.floor(estRemainingMinutes / 60);
              const minutes = Math.round(estRemainingMinutes % 60);
              setRemainingTime(`${hours}h ${minutes}min`);
            }
          });
      }
    }
  }, [userProgress]);

  if (isLoadingProgress) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Continue Learning</h2>
          <Link href="/courses">
            <a className="text-primary hover:text-primary-light text-sm font-medium">View All Courses</a>
          </Link>
        </div>
        
        <Card>
          <CardContent className="pt-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div className="flex items-center">
                <Skeleton className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 mt-4 md:mt-0" />
            </div>
            
            <Skeleton className="h-2.5 w-full mb-4" />
            
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Start Learning</h2>
          <Link href="/courses">
            <a className="text-primary hover:text-primary-light text-sm font-medium">View All Courses</a>
          </Link>
        </div>
        
        <Card>
          <CardContent className="pt-5 text-center py-10">
            <div className="mb-4">
              <i className="fas fa-book-open text-3xl text-neutral-400"></i>
            </div>
            <h3 className="text-lg font-medium mb-2">No courses in progress</h3>
            <p className="text-neutral-600 mb-4">Start a new course to begin your learning journey</p>
            <Button asChild>
              <Link href="/courses">
                <a>Browse Courses</a>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Continue Learning</h2>
        <Link href="/courses">
          <a className="text-primary hover:text-primary-light text-sm font-medium">View All Courses</a>
        </Link>
      </div>
      
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-4">
                {currentCourse.language === "javascript" && <i className="fab fa-js text-xl text-primary"></i>}
                {currentCourse.language === "python" && <i className="fab fa-python text-xl text-primary"></i>}
                {currentCourse.language === "cpp" && <i className="fas fa-code text-xl text-primary"></i>}
              </div>
              <div>
                <h3 className="font-medium text-lg">{currentCourse.title}</h3>
                <p className="text-sm text-neutral-600">
                  {currentCourse.lessons?.find(l => !userProgress.some(p => p.lessonId === l.id && p.completed))?.title || "Next lesson"}
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="bg-primary bg-opacity-10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                {progressPercentage}% Complete
              </span>
            </div>
          </div>
          
          <Progress value={progressPercentage} className="mb-4" />
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-neutral-600">
              <span>Estimated time: {remainingTime} remaining</span>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href={`/courses/${currentCourse.id}`}>
                <a className="flex items-center">
                  <span>Continue</span>
                  <i className="fas fa-arrow-right ml-2"></i>
                </a>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
