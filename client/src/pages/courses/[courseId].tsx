import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import CourseContent from "@/components/learning/CourseContent";
import LessonEditor from "@/components/learning/LessonEditor"; // Import the LessonEditor component
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Loader2 } from "lucide-react";

export default function CourseDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, params] = useRoute("/courses/:courseId");
  const courseId = params?.courseId ? parseInt(params.courseId) : null;

  const { data: course, isLoading } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  }) as { data: any; isLoading: boolean };

  if (!courseId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Invalid Course ID</h2>
          <p className="text-neutral-600 mt-2">The course ID is missing or invalid.</p>
          <Button asChild className="mt-4">
            <a href="/courses">Back to Courses</a>
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
          ) : course ? (
            <div>
              <div className="mb-6">
                <Breadcrumbs
                  className="mb-2"
                  items={[
                    { label: "Courses", href: "/courses" },
                    { label: course.title }
                  ]}
                />
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3">
                        {course.language === "javascript" && <i className="fab fa-js text-lg text-primary"></i>}
                        {course.language === "python" && <i className="fab fa-python text-lg text-primary"></i>}
                        {course.language === "cpp" && <i className="fas fa-code text-lg text-primary"></i>}
                      </div>
                      <h1 className="text-2xl font-semibold">{course.title}</h1>
                    </div>
                    <p className="text-neutral-600 ml-13">{course.description}</p>
                  </div>
                  <div className="flex mt-4 md:mt-0 space-x-2">
                    <div className="text-sm bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full">
                      <span className="capitalize">{course.language}</span>
                    </div>
                    <div className="text-sm bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full">
                      <span className="capitalize">{course.difficulty}</span>
                    </div>
                    <div className="text-sm bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full">
                      <i className="far fa-clock mr-1"></i>
                      <span>{course.estimatedHours || 10} hours</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Lesson Editor for adding/editing lessons */}
              <div className="mb-8">
                {/* Only show for course creators/admins; for demo, always show */}
                <div className="flex items-center mb-2">
                  <span className="font-semibold mr-4">Add or Edit Lesson</span>
                </div>
                <LessonEditor courseId={courseId} onSave={() => window.location.reload()} />
              </div>
              <CourseContent courseId={courseId} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Course Not Found</h2>
                <p className="text-neutral-600 mt-2">The course you're looking for doesn't exist.</p>
                <Button asChild className="mt-4">
                  <a href="/courses">Back to Courses</a>
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
