import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ChallengeCard from "@/components/learning/ChallengeCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  // Filter challenges based on search query and selected filters
  const filterChallenges = (challenges = []) => {
    return challenges.filter(challenge => {
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

  // Get completed challenges
  const getCompletedChallenges = () => {
    if (!challenges || !userProgress) return [];
    return challenges.filter(challenge => isChallengeCompleted(challenge.id));
  };

  // Get available languages from challenges
  const getAvailableLanguages = () => {
    if (!challenges) return [];
    const languages = new Set(challenges.map(challenge => challenge.language));
    return Array.from(languages);
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
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">Coding Challenges</h1>
            <p className="text-neutral-600">
              Test your skills with our collection of coding challenges
            </p>
          </div>
          
          {/* Search and Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search challenges..."
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
            
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Challenge Tabs */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList>
              <TabsTrigger value="all">All Challenges</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            {/* All Challenges Tab */}
            <TabsContent value="all" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : challenges?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterChallenges(challenges).map(challenge => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-500 mb-4">
                    <i className="fas fa-code text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium">No challenges found</h3>
                  <p className="text-neutral-600">
                    No challenges match your current filters
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* Completed Challenges Tab */}
            <TabsContent value="completed" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : getCompletedChallenges().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterChallenges(getCompletedChallenges()).map(challenge => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-500 mb-4">
                    <i className="fas fa-trophy text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium">No completed challenges</h3>
                  <p className="text-neutral-600">
                    Complete challenges to see them here
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
