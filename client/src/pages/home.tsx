import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import CourseCard from "@/components/learning/CourseContent";
import { useState } from "react";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: courses } = useQuery({ queryKey: ["/api/courses"] });
  const { data: recommended } = useQuery({ queryKey: ["/api/courses?recommended=true"] });
  const { data: trending } = useQuery({ queryKey: ["/api/courses?trending=true"] });
  const { data: user } = useQuery({ queryKey: ["/api/auth/me"] });

  const userDisplayName = typeof user === 'object' && user !== null && 'displayName' in user ? user.displayName : 'Learner';

  return (
    <div className="bg-neutral-50 font-sans text-neutral-800 flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <h1 className="text-2xl font-semibold mb-4">Welcome, {userDisplayName}!</h1>
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-2">Continue Learning</h2>
            {/* TODO: Show current course(s) in progress */}
            {/* Placeholder: */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Map user's enrolled courses with progress <CourseCard ... /> */}
            </div>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-2">Recommended Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(recommended) && recommended.map((course: any) => (
                course.id ? <CourseCard key={course.id} courseId={course.id} /> : null
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-2">Trending Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(trending) && trending.map((course: any) => (
                course.id ? <CourseCard key={course.id} courseId={course.id} /> : null
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
