import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function ProgressOverview() {
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  const { data: skills, isLoading: isLoadingSkills } = useQuery({
    queryKey: ['/api/user-skills'],
    enabled: !!user,
  });

  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  
  // Create an array of the last 7 days with today at the end
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = (today - 6 + i + 7) % 7;
    return dayOfWeek[day];
  });

  // Generate activity levels for each day (would normally come from the API)
  const activityLevels = [10, 40, 20, 80, 60, 30, 5];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Weekly Progress Card */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Weekly Progress</h3>
            <span className="text-success-dark font-medium text-sm">
              <i className="fas fa-arrow-up mr-1"></i> 15%
            </span>
          </div>
          <div className="h-20 flex items-end justify-between gap-1">
            {activityLevels.map((level, index) => (
              <div 
                key={index}
                className={`h-${Math.max(1, Math.round(level / 5))} w-8 rounded-t-sm ${
                  index === 6 ? "bg-neutral-200" : 
                  index === 3 ? "bg-primary" :
                  `bg-primary bg-opacity-${Math.min(100, level + 20)}`
                }`}
                style={{ height: `${level}%` }}
              ></div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-neutral-500 mt-2">
            {days.map((day, index) => (
              <span key={index}>{day}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills Overview Card */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Skills Overview</h3>
            <span className="text-xs text-neutral-500">Last Updated: Today</span>
          </div>
          <div className="space-y-3">
            {isLoadingSkills ? (
              <>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
              </>
            ) : skills ? (
              Object.entries(skills).map(([language, percentage]) => (
                <div key={language}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{language}</span>
                    <span className="font-medium">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))
            ) : (
              <div className="text-sm text-neutral-500">No skills data available</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Learning Streak Card */}
      <Card>
        <CardContent className="pt-5">
          <h3 className="font-medium mb-3">Learning Streak</h3>
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-4">
              <span className="text-2xl font-semibold text-primary">
                {isLoadingUser ? <Skeleton className="h-6 w-6" /> : user?.streak || 0}
              </span>
            </div>
            <div>
              <p className="font-medium">
                {isLoadingUser ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  user?.streak ? "Great streak!" : "Start your streak!"
                )}
              </p>
              <p className="text-sm text-neutral-600">
                {isLoadingUser ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  user?.streak ? 
                    `You've been learning consistently for ${user.streak} days` : 
                    "Learn something today to start your streak"
                )}
              </p>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-neutral-500">
            {Array.from({ length: 5 }).map((_, index) => {
              const day = dayOfWeek[(today - 4 + index + 7) % 7];
              const isToday = index === 4;
              const isPast = index < 4;
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full ${
                      isToday ? "bg-primary" : 
                      isPast ? "bg-primary" : 
                      "bg-neutral-200"
                    } flex items-center justify-center mb-1`}>
                    {isToday ? (
                      <span className="text-white text-xs font-medium">Today</span>
                    ) : (
                      <i className={`fas fa-check text-white text-xs ${isPast ? "" : "opacity-0"}`}></i>
                    )}
                  </div>
                  <span>{day}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
