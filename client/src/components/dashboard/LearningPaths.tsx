import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function LearningPaths() {
  const { data: learningPaths, isLoading } = useQuery({
    queryKey: ['/api/learning-paths'],
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Suggested Learning Paths</h2>
        <Link href="/learning-paths">
          <a className="text-primary hover:text-primary-light text-sm font-medium">
            Explore All Paths
          </a>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          // Skeleton loaders while loading
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-md mr-3" />
                    <div>
                      <Skeleton className="h-6 w-48 mb-1" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-neutral-600 mb-4">
                  <Skeleton className="h-4 w-24 mr-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-4/5 mb-4" />
                
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-7 w-7 rounded-full" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : learningPaths?.length > 0 ? (
          // Actual learning paths
          learningPaths.slice(0, 2).map(path => (
            <Card key={path.id}>
              <CardContent className="pt-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className={`rounded-md bg-${path.category === 'web development' ? 'primary' : 'secondary'}-light bg-opacity-20 p-2 mr-3`}>
                      <i className={`fas fa-${path.imageIcon || 'graduation-cap'} text-${path.category === 'web development' ? 'primary' : 'secondary'}-dark`}></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{path.title}</h3>
                      <p className="text-sm text-neutral-600">{path.category}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-neutral-600 mb-4">
                  <span className="mr-4">
                    <i className="fas fa-book-open mr-1"></i> {Array.isArray(path.courses) ? path.courses.length : 0} Lessons
                  </span>
                  <span>
                    <i className="fas fa-code mr-1"></i> {Array.isArray(path.challenges) ? path.challenges.length : 0} Challenges
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                  {path.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white text-xs">
                      <i className="fas fa-user text-gray-500"></i>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white text-xs">
                      <i className="fas fa-user text-gray-500"></i>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white text-xs">
                      <i className="fas fa-user text-gray-500"></i>
                    </div>
                    <div className="flex items-center justify-center w-7 h-7 text-xs font-medium text-white bg-primary rounded-full border-2 border-white">
                      +{Math.floor(Math.random() * 9) + 1}k
                    </div>
                  </div>
                  <Button 
                    className={`bg-${path.category === 'web development' ? 'primary' : 'secondary'} hover:bg-${path.category === 'web development' ? 'primary' : 'secondary'}/90`}
                    asChild
                  >
                    <Link href={`/learning-paths/${path.id}`}>
                      <a>Start Path</a>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-8">
            <p className="text-neutral-500">No learning paths available</p>
          </div>
        )}
      </div>
    </div>
  );
}
