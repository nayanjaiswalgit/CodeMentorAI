import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Progress } from "@/components/ui/progress";
import CourseCard from "@/components/learning/CourseContent";
import { useState } from "react";

export default function MyLearning() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: enrollments = [] } = useQuery({ queryKey: ["/api/enrollments"] });
  const { data: courses = [] } = useQuery({ queryKey: ["/api/courses"] });

  // Helper to get course details
  const getCourse = (courseId: number) => (Array.isArray(courses) ? courses.find((c: any) => c.id === courseId) : undefined);

  const enrollmentsList = Array.isArray(enrollments) ? enrollments : [];

  return (
    <div className="bg-neutral-50 font-sans text-neutral-800 flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <h1 className="text-2xl font-semibold mb-4">My Learning</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollmentsList.map((enrollment: any) => {
              const course = getCourse(enrollment.course);
              if (!course) return null;
              return (
                <div key={course.id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
                  <CourseCard courseId={course.id} />
                  <Progress value={enrollment.progress || 0} />
                  <button className="btn btn-primary mt-2">Resume</button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
