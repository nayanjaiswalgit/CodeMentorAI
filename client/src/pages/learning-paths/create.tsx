import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const createLearningPath = async (data: { title: string; description: string }) => {
  const res = await fetch("/api/learning-paths", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create learning path");
  return res.json();
};

export default function CreateLearningPathPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const mutation = useMutation({
    mutationFn: createLearningPath,
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/learning-paths"]);
      setLocation("/learning-paths");
    },
    onError: (err: any) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate({ title, description });
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-2">
      <h1 className="text-2xl font-bold mb-6">Create Learning Path</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit" loading={mutation.isLoading}>
          Create
        </Button>
      </form>
    </div>
  );
}
