import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GenerateQuestionsDialogProps {
  onQuestionsGenerated: (questions: any[]) => void;
}

export default function GenerateQuestionsDialog({ onQuestionsGenerated }: GenerateQuestionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [language, setLanguage] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, language, numQuestions })
      });
      if (!res.ok) throw new Error("Failed to generate questions");
      const data = await res.json();
      onQuestionsGenerated(data.questions || []);
      setOpen(false);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Generate AI Questions</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate AI Test Questions</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Topic (e.g. JavaScript functions)" value={topic} onChange={e => setTopic(e.target.value)} />
          <Input placeholder="Difficulty (optional)" value={difficulty} onChange={e => setDifficulty(e.target.value)} />
          <Input placeholder="Language (optional)" value={language} onChange={e => setLanguage(e.target.value)} />
          <Input type="number" min={1} max={20} placeholder="Number of Questions" value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <DialogFooter>
          <Button onClick={handleGenerate} disabled={loading || !topic}>
            {loading ? "Generating..." : "Generate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
