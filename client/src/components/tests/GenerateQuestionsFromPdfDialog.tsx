import { useState, useRef } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GenerateQuestionsFromPdfDialogProps {
  onQuestionsGenerated: (questions: any[]) => void;
}

export default function GenerateQuestionsFromPdfDialog({ onQuestionsGenerated }: GenerateQuestionsFromPdfDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pageStart, setPageStart] = useState("");
  const [pageEnd, setPageEnd] = useState("");
  const [keyword, setKeyword] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("");
  const [language, setLanguage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sectionPreview, setSectionPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePreviewSection() {
    if (!file) return;
    setSectionPreview("Loading preview...");
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("pageStart", pageStart);
    formData.append("pageEnd", pageEnd);
    formData.append("keyword", keyword);
    formData.append("numQuestions", "0"); // No questions, just preview
    try {
      const res = await fetch("/api/generate-questions-from-pdf", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Failed to preview section");
      const data = await res.json();
      if (data.questions && data.questions.length > 0 && data.questions[0].question) {
        setSectionPreview(data.questions[0].question.slice(0, 500) + (data.questions[0].question.length > 500 ? "..." : ""));
      } else {
        setSectionPreview("No preview available");
      }
    } catch (e: any) {
      setSectionPreview("Could not preview section");
    }
  }

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      if (!file) throw new Error("Please upload a PDF file");
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("pageStart", pageStart);
      formData.append("pageEnd", pageEnd);
      formData.append("keyword", keyword);
      formData.append("numQuestions", numQuestions.toString());
      formData.append("difficulty", difficulty);
      formData.append("language", language);
      const res = await fetch("/api/generate-questions-from-pdf", {
        method: "POST",
        body: formData
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSectionPreview("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Generate from PDF</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Questions from PDF</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="block w-full text-sm text-neutral-700 border border-neutral-300 rounded cursor-pointer focus:outline-none" />
          <div className="flex gap-2">
            <Input placeholder="Page Start" value={pageStart} onChange={e => setPageStart(e.target.value)} type="number" min={1} className="w-1/3" />
            <Input placeholder="Page End" value={pageEnd} onChange={e => setPageEnd(e.target.value)} type="number" min={1} className="w-1/3" />
          </div>
          <Input placeholder="Or Section Keyword (optional)" value={keyword} onChange={e => setKeyword(e.target.value)} />
          <Input type="number" min={1} max={20} placeholder="Number of Questions" value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} />
          <Input placeholder="Difficulty (optional)" value={difficulty} onChange={e => setDifficulty(e.target.value)} />
          <Input placeholder="Language (optional)" value={language} onChange={e => setLanguage(e.target.value)} />
          <Button variant="secondary" onClick={handlePreviewSection} disabled={!file || loading}>Preview Section</Button>
          {sectionPreview && <div className="bg-neutral-100 p-2 rounded text-xs max-h-32 overflow-y-auto">{sectionPreview}</div>}
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <DialogFooter>
          <Button onClick={handleGenerate} disabled={loading || !file}>
            {loading ? "Generating..." : "Generate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
