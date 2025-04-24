import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

const fetchLearningPath = async (id: string) => {
  const res = await fetch(`/api/learning-paths/${id}`);
  if (!res.ok) throw new Error("Failed to fetch learning path");
  return res.json();
};

export default function LearningPathDetailPage() {
  const params = useParams<{ pathId: string }>();
  const pathId = params.pathId;

  const { data: path, isLoading, error } = useQuery({
    queryKey: ["/api/learning-paths", pathId],
    queryFn: () => fetchLearningPath(pathId),
    enabled: !!pathId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{(error as Error).message}</div>;
  if (!path) return <div>Not found</div>;

  return (
    <div className="max-w-2xl mx-auto py-10 px-2">
      <Card>
        <CardContent className="pt-5">
          <h1 className="text-2xl font-bold mb-2">{path.title}</h1>
          <p className="mb-4 text-neutral-700">{path.description}</p>
          {/* Optionally render lessons/modules here */}
        </CardContent>
      </Card>
    </div>
  );
}
