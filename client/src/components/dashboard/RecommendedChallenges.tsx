import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const difficultyColors = {
  easy: { bg: "bg-green-100", text: "text-green-800" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-800" },
  hard: { bg: "bg-red-100", text: "text-red-800" }
};

const languageIcons = {
  javascript: "fab fa-js",
  python: "fab fa-python",
  cpp: "fas fa-code"
};

export default function RecommendedChallenges() {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['/api/recommendations'],
  });

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recommended Challenges</h2>
        <Link href="/challenges">
          <a className="text-primary hover:text-primary-light text-sm font-medium">View All</a>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Skeleton loaders while loading
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-5">
                <div className="flex justify-between items-start mb-3">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : recommendations?.recommendedChallenges ? (
          // Actual challenges
          recommendations.recommendedChallenges.map(challenge => (
            <Card key={challenge.id}>
              <CardContent className="pt-5">
                <div className="flex justify-between items-start mb-3">
                  <div className={`rounded-md bg-${challenge.language === 'python' ? 'primary' : challenge.language === 'javascript' ? 'secondary' : 'success'}-light bg-opacity-20 p-2`}>
                    <i className={`${languageIcons[challenge.language] || 'fas fa-code'} text-${challenge.language === 'python' ? 'primary' : challenge.language === 'javascript' ? 'secondary' : 'success'}-dark`}></i>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`${difficultyColors[challenge.difficulty.toLowerCase()]?.bg || 'bg-gray-100'} ${difficultyColors[challenge.difficulty.toLowerCase()]?.text || 'text-gray-800'} border-0 text-xs font-medium px-2.5 py-0.5 rounded-full`}
                  >
                    {challenge.difficulty}
                  </Badge>
                </div>
                <h3 className="font-medium text-lg mb-2">{challenge.title}</h3>
                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                  {challenge.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">
                    Estimated: {challenge.estimatedMinutes || 20} min
                  </span>
                  <Link href={`/challenges/${challenge.id}`}>
                    <a className="text-primary hover:text-primary-light text-sm font-medium">
                      Start Challenge
                    </a>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <p className="text-neutral-500">No challenges recommended at this time</p>
          </div>
        )}
      </div>
    </div>
  );
}
