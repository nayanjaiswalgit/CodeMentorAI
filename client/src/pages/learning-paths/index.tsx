import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const fetchLearningPaths = async () => {
  const res = await fetch("/api/learning-paths");
  if (!res.ok) throw new Error("Failed to fetch learning paths");
  return res.json();
};

export default function LearningPathsPage() {
  const { data: learningPaths, isLoading, error } = useQuery({
    queryKey: ["/api/learning-paths"],
    queryFn: fetchLearningPaths,
  });

  return (
    <div className="max-w-3xl mx-auto py-10 px-2">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Learning Paths</h1>
        <Button asChild>
          <Link href="/learning-paths/create">Create Path</Link>
        </Button>
      </div>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error.message}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {learningPaths && learningPaths.length > 0 ? (
          learningPaths.map((path: any) => (
            <Card key={path.id}>
              <CardContent className="pt-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-lg font-semibold">{path.title}</h2>
                    <p className="text-sm text-neutral-600">{path.description}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button asChild variant="outline">
                    <Link href={`/learning-paths/${path.id}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          !isLoading && <div>No learning paths found.</div>
        )}
      </div>
    </div>
  );
}
