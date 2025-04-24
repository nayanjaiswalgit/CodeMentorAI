import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ProgressOverview from "@/components/dashboard/ProgressOverview";
import CurrentCourse from "@/components/dashboard/CurrentCourse";
import RecommendedChallenges from "@/components/dashboard/RecommendedChallenges";
import LearningPaths from "@/components/dashboard/LearningPaths";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
  });

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
            <h1 className="text-2xl font-semibold mb-1">
              Welcome back, {user?.displayName?.split(' ')[0] || 'Learner'}!
            </h1>
            <p className="text-neutral-600">
              Pick up where you left off and continue your learning journey.
            </p>
          </div>
          
          <ProgressOverview />
          <CurrentCourse />
          <RecommendedChallenges />
          <LearningPaths />
        </main>
      </div>
    </div>
  );
}
