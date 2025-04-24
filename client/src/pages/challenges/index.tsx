import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ChallengeCard from "@/components/learning/ChallengeCard";
import SearchAndFilters from "@/components/common/SearchAndFilters";
import ResourceTabs from "@/components/common/ResourceTabs";
import EmptyState from "@/components/common/EmptyState";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { getUniqueValues, capitalize } from "@/lib/resourceUtils";
import type { Challenge } from "@shared/schema";

export default function Challenges() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['/api/challenges'],
  });

  const { data: userProgress } = useQuery({
    queryKey: ['/api/user-progress'],
  });

  // Check if a challenge was completed
  const isChallengeCompleted = (challengeId: number) => {
    if (!userProgress) return false;
    return userProgress.some(p => 
      p.challengeId === challengeId && p.completed
    );
  };

  // Typed filter function
  const filterChallenges = (challenges: Challenge[] = []): Challenge[] => {
    return challenges.filter((challenge) => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Language filter
      const matchesLanguage = selectedLanguage === "all" || 
        challenge.language === selectedLanguage;
      
      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === "all" || 
        challenge.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
      
      return matchesSearch && matchesLanguage && matchesDifficulty;
    });
  };

  // Typed completed challenges
  const getCompletedChallenges = (): Challenge[] => {
    if (!challenges) return [];
    return challenges.filter((challenge) => isChallengeCompleted(challenge.id));
  };

  // Prepare filter options and handlers
  const languageOptions = [
    { value: "all", label: "All Languages" },
    ...getUniqueValues(challenges || [], "language").map(l => ({ value: l, label: capitalize(l) })),
  ];
  const difficultyOptions = [
    { value: "all", label: "All Difficulties" },
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  // Tabs config
  const tabs = [
    {
      value: "all",
      label: "All Challenges",
      render: () => {
        const filtered = filterChallenges(Array.isArray(challenges) ? challenges : []);
        return filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={{
                  ...challenge,
                  estimatedMinutes: challenge.estimatedMinutes === null ? undefined : challenge.estimatedMinutes,
                }}
              />
            ))}
          </div>
        ) : null;
      },
      empty: {
        icon: <i className="fas fa-code text-2xl"></i>,
        title: "No challenges found",
        message: "No challenges match your current filters",
      },
    },
    {
      value: "completed",
      label: "Completed",
      render: () => {
        const completed = filterChallenges(Array.isArray(getCompletedChallenges()) ? getCompletedChallenges() : []);
        return completed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completed.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={{
                  ...challenge,
                  estimatedMinutes: challenge.estimatedMinutes === null ? undefined : challenge.estimatedMinutes,
                }}
              />
            ))}
          </div>
        ) : null;
      },
      empty: {
        icon: <i className="fas fa-trophy text-2xl"></i>,
        title: "No completed challenges",
        message: "Complete challenges to see them here",
      },
    },
  ];

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
            <h1 className="text-2xl font-semibold mb-1">Coding Challenges</h1>
            <p className="text-neutral-600">
              Test your skills with our collection of coding challenges
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
                label: "Difficulty",
                value: selectedDifficulty,
                onChange: setSelectedDifficulty,
                options: difficultyOptions,
                placeholder: "Filter by difficulty",
              },
            ]}
            className="mb-6"
          />
          {/* Tabs for All/Completed */}
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
