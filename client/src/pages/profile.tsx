import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types/user";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserRole, Permission, hasPermission } from "@/constants/permissions";

export default function Profile() {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });

  const { data: userProgress, isLoading: isLoadingProgress } = useQuery<any[]>({
    queryKey: ['/api/user-progress'],
  });

  const { data: skills, isLoading: isLoadingSkills } = useQuery<Record<string, number>>({
    queryKey: ['/api/user-skills'],
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      // Remove token from localStorage
      localStorage.removeItem("authToken");
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      window.location.href = "/login";
      toast({
        title: "Logged out successfully",
      });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error instanceof Error ? error.message : "An error occurred during logout",
      });
      setIsLoggingOut(false);
    }
  };

  // Calculate learning stats
  const getLearningStats = () => {
    if (!userProgress) return { lessons: 0, challenges: 0, courses: 0 };
    
    const completedLessons = userProgress.filter((p: any) => p.lessonId && p.completed).length;
    const completedChallenges = userProgress.filter((p: any) => p.challengeId && p.completed).length;
    
    // Count unique course IDs with at least one completed lesson
    const courseIds = new Set(
      userProgress
        .filter((p: any) => p.courseId && p.lessonId && p.completed)
        .map((p: any) => p.courseId)
    );
    
    return {
      lessons: completedLessons,
      challenges: completedChallenges,
      courses: courseIds.size
    };
  };

  const stats = getLearningStats();
  const isLoading = isLoadingUser || isLoadingProgress || isLoadingSkills;

  const canEditProfile = user && hasPermission(user.role, Permission.EDIT_PROFILE);

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
          ) : user ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-primary bg-opacity-20 flex items-center justify-center text-2xl font-medium text-primary mb-3">
                      {user.displayName?.charAt(0) || user.username?.charAt(0) || "U"}
                    </div>
                    <h2 className="text-xl font-medium">{user.displayName || user.username}</h2>
                    <p className="text-neutral-600">@{user.username}</p>
                  </div>
                  <div className="mb-6 flex flex-col items-center">
                    {canEditProfile && (
                      <Button asChild variant="outline" className="mb-2 w-full">
                        <Link href="/settings">
                          <span><i className="fas fa-cog mr-2"></i>Edit Profile</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-neutral-100 p-3 rounded-md text-center">
                      <div className="text-xl font-medium">{user.streak || 0}</div>
                      <div className="text-sm text-neutral-600">Days Streak</div>
                    </div>
                    <div className="bg-neutral-100 p-3 rounded-md text-center">
                      <div className="text-xl font-medium capitalize">{user.skillLevel}</div>
                      <div className="text-sm text-neutral-600">Skill Level</div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-md font-medium mb-2">Learning Stats</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-neutral-100 p-2 rounded-md text-center">
                        <div className="text-lg font-medium">{stats.lessons}</div>
                        <div className="text-xs text-neutral-600">Lessons</div>
                      </div>
                      <div className="bg-neutral-100 p-2 rounded-md text-center">
                        <div className="text-lg font-medium">{stats.challenges}</div>
                        <div className="text-xs text-neutral-600">Challenges</div>
                      </div>
                      <div className="bg-neutral-100 p-2 rounded-md text-center">
                        <div className="text-lg font-medium">{stats.courses}</div>
                        <div className="text-xs text-neutral-600">Courses</div>
                      </div>
                    </div>
                  </div>
                  
                  {user.bio && (
                    <div className="mb-6">
                      <h3 className="text-md font-medium mb-2">Bio</h3>
                      <p className="text-neutral-600">{user.bio}</p>
                    </div>
                  )}
                  
                  <Button onClick={handleLogout} variant="outline" className="w-full" disabled={isLoggingOut}>
                    {isLoggingOut ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <i className="fas fa-sign-out-alt mr-2"></i>
                    )}
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
              
              {/* Skills and Progress */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills Progress</CardTitle>
                    <CardDescription>Your coding language proficiency</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {skills && Object.keys(skills).length > 0 ? (
                        Object.entries(skills).map(([language, percentage]) => (
                          <div key={language}>
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3 text-primary">
                                  {language === "javascript" && <i className="fab fa-js"></i>}
                                  {language === "python" && <i className="fab fa-python"></i>}
                                  {language === "cpp" && <i className="fas fa-code"></i>}
                                  {!["javascript", "python", "cpp"].includes(language) && <i className="fas fa-code"></i>}
                                </div>
                                <span className="font-medium capitalize">{language}</span>
                              </div>
                              <span className="font-medium">{percentage}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-neutral-500">
                          <i className="fas fa-code-branch text-2xl mb-2"></i>
                          <p>No skills data available yet</p>
                          <p className="text-sm">Complete courses to build your skills profile</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Activity</CardTitle>
                    <CardDescription>Your recent learning history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="all">
                      <TabsList className="mb-4">
                        <TabsTrigger value="all">All Activity</TabsTrigger>
                        <TabsTrigger value="courses">Courses</TabsTrigger>
                        <TabsTrigger value="challenges">Challenges</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="all">
                        {userProgress && userProgress.length > 0 ? (
                          <div className="space-y-3">
                            {userProgress
                              .sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime())
                              .slice(0, 5)
                              .map((progress, index) => (
                                <div key={index} className="flex items-center p-3 rounded-md bg-neutral-50">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-neutral-200 text-neutral-700">
                                    {progress.lessonId && <i className="fas fa-book-open"></i>}
                                    {progress.challengeId && <i className="fas fa-code"></i>}
                                    {progress.mcqId && <i className="fas fa-question"></i>}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {progress.lessonId && "Completed a lesson"}
                                      {progress.challengeId && "Attempted a challenge"}
                                      {progress.mcqId && "Answered a quiz question"}
                                    </div>
                                    <div className="text-sm text-neutral-600">
                                      {new Date(progress.attemptedAt).toLocaleString()}
                                    </div>
                                  </div>
                                  {progress.score !== null && (
                                    <div className="text-sm font-medium">
                                      Score: {progress.score}%
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-neutral-500">
                            <i className="fas fa-history text-2xl mb-2"></i>
                            <p>No learning activity yet</p>
                            <p className="text-sm">Start a course or challenge to see your activity</p>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="courses">
                        {userProgress && userProgress.filter(p => p.lessonId).length > 0 ? (
                          <div className="space-y-3">
                            {userProgress
                              .filter(p => p.lessonId)
                              .sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime())
                              .slice(0, 5)
                              .map((progress, index) => (
                                <div key={index} className="flex items-center p-3 rounded-md bg-neutral-50">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-neutral-200 text-neutral-700">
                                    <i className="fas fa-book-open"></i>
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      Completed a lesson
                                    </div>
                                    <div className="text-sm text-neutral-600">
                                      {new Date(progress.attemptedAt).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-neutral-500">
                            <i className="fas fa-book-open text-2xl mb-2"></i>
                            <p>No course activity yet</p>
                            <p className="text-sm">Start a course to see your activity</p>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="challenges">
                        {userProgress && userProgress.filter(p => p.challengeId).length > 0 ? (
                          <div className="space-y-3">
                            {userProgress
                              .filter(p => p.challengeId)
                              .sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime())
                              .slice(0, 5)
                              .map((progress, index) => (
                                <div key={index} className="flex items-center p-3 rounded-md bg-neutral-50">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-neutral-200 text-neutral-700">
                                    <i className="fas fa-code"></i>
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {progress.completed ? "Completed a challenge" : "Attempted a challenge"}
                                    </div>
                                    <div className="text-sm text-neutral-600">
                                      {new Date(progress.attemptedAt).toLocaleString()}
                                    </div>
                                  </div>
                                  {progress.score !== null && (
                                    <div className="text-sm font-medium">
                                      Score: {progress.score}%
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-neutral-500">
                            <i className="fas fa-code text-2xl mb-2"></i>
                            <p>No challenge activity yet</p>
                            <p className="text-sm">Try a coding challenge to see your activity</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Not Logged In</h2>
                <p className="text-neutral-600 mt-2">Please log in to view your profile.</p>
                <Button asChild className="mt-4">
                  <a href="/login">Login</a>
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
