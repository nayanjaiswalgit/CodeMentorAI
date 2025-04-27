import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import GenerateQuestionsFromPdfDialog from "@/components/tests/GenerateQuestionsFromPdfDialog";

export default function GenerateQuestionsPage() {
  const [activeTab, setActiveTab] = useState("ai");
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [taskStarted, setTaskStarted] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(false);

  // For AI generation
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [language, setLanguage] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);

  // For PDF generation
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

  const handleGenerateAI = async () => {
    setLoading(true);
    setError(null);
    setShowResult(false);
    setTaskStarted(true);
    setTaskCompleted(false);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, language, numQuestions }),
      });
      if (!res.ok) throw new Error("Failed to generate questions");
      const data = await res.json();
      setQuestions(data.questions || data);
      setShowResult(true);
      setTaskCompleted(true);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-50 font-sans text-neutral-800 flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-4xl font-bold text-primary mb-2">Generate Questions</h1>
                <p className="text-lg text-neutral-600">Create high-quality questions instantly using AI or from your own PDF notes.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActiveTab('ai')} className={activeTab === 'ai' ? 'border-primary text-primary' : ''}>AI Generator</Button>
                <Button variant="outline" onClick={() => setActiveTab('pdf')} className={activeTab === 'pdf' ? 'border-primary text-primary' : ''}>PDF Generator</Button>
              </div>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex justify-center mb-6 bg-neutral-100 rounded-lg p-1">
                <TabsTrigger value="ai" className="flex-1">By Topic/Prompt (AI)</TabsTrigger>
                <TabsTrigger value="pdf" className="flex-1">From PDF Content</TabsTrigger>
              </TabsList>
              <TabsContent value="ai">
                <Card className="shadow-md border-0">
                  <CardHeader className="bg-primary bg-opacity-10 rounded-t-lg">
                    <CardTitle className="text-2xl">AI Question Generator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!taskStarted && (
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          handleGenerateAI();
                        }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label className="font-semibold">Topic / Prompt</Label>
                            <Input value={topic} onChange={e => setTopic(e.target.value)} required placeholder="e.g. Binary Trees, Python Loops, etc." />
                          </div>
                          <div>
                            <Label className="font-semibold">Difficulty</Label>
                            <Input value={difficulty} onChange={e => setDifficulty(e.target.value)} placeholder="e.g. easy, medium, hard" />
                          </div>
                          <div>
                            <Label className="font-semibold">Language</Label>
                            <Input value={language} onChange={e => setLanguage(e.target.value)} placeholder="e.g. javascript, python" />
                          </div>
                          <div>
                            <Label className="font-semibold">Number of Questions</Label>
                            <Input
                              type="number"
                              min={1}
                              max={20}
                              value={numQuestions}
                              onChange={e => setNumQuestions(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full text-lg py-6 mt-2">
                          {loading ? "Generating..." : "Generate Questions"}
                        </Button>
                        {error && <Alert variant="destructive">{error}</Alert>}
                      </form>
                    )}
                    {taskStarted && !taskCompleted && (
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-opacity-40 mb-6"></div>
                        <p className="text-lg text-primary font-semibold mb-2">Generating your questions...</p>
                        <p className="text-neutral-500">This may take up to a minute depending on your topic and number of questions.</p>
                        <Button variant="ghost" className="mt-8" onClick={() => { setTaskStarted(false); setLoading(false); }}>Cancel</Button>
                      </div>
                    )}
                    {taskCompleted && showResult && (
                      <div className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4 text-primary">Generated Questions</h2>
                        <ul className="space-y-6">
                          {questions.map((q, idx) => (
                            <li key={idx} className="border rounded-xl p-6 bg-white shadow-sm">
                              <div className="font-medium text-lg mb-2">Q{idx + 1}: {q.question}</div>
                              {q.options && (
                                <ul className="list-disc ml-8 mb-2">
                                  {q.options.map((opt: string, i: number) => (
                                    <li key={i} className="text-neutral-700">{opt}</li>
                                  ))}
                                </ul>
                              )}
                              {q.answer && (
                                <div className="mt-1 text-green-700 font-semibold">Answer: {q.answer}</div>
                              )}
                              {q.explanation && (
                                <div className="text-sm text-gray-600 mt-2">Explanation: {q.explanation}</div>
                              )}
                            </li>
                          ))}
                        </ul>
                        <div className="flex justify-end mt-8">
                          <Button variant="outline" onClick={() => { setTaskStarted(false); setTaskCompleted(false); setShowResult(false); setQuestions([]); }}>Generate More</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="pdf">
                <Card className="shadow-md border-0">
                  <CardHeader className="bg-primary bg-opacity-10 rounded-t-lg">
                    <CardTitle className="text-2xl">Generate from PDF</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!taskStarted && (
                      <GenerateQuestionsFromPdfDialog
                        onQuestionsGenerated={questions => { setQuestions(questions); setTaskStarted(true); setTaskCompleted(true); setShowResult(true); }}
                      />
                    )}
                    {taskStarted && !taskCompleted && (
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-opacity-40 mb-6"></div>
                        <p className="text-lg text-primary font-semibold mb-2">Generating your questions from PDF...</p>
                        <p className="text-neutral-500">This may take up to a minute depending on your PDF content.</p>
                        <Button variant="ghost" className="mt-8" onClick={() => { setTaskStarted(false); setLoading(false); }}>Cancel</Button>
                      </div>
                    )}
                    {taskCompleted && questions.length > 0 && (
                      <div className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4 text-primary">Generated Questions</h2>
                        <ul className="space-y-6">
                          {questions.map((q, idx) => (
                            <li key={idx} className="border rounded-xl p-6 bg-white shadow-sm">
                              <div className="font-medium text-lg mb-2">Q{idx + 1}: {q.question}</div>
                              {q.options && (
                                <ul className="list-disc ml-8 mb-2">
                                  {q.options.map((opt: string, i: number) => (
                                    <li key={i} className="text-neutral-700">{opt}</li>
                                  ))}
                                </ul>
                              )}
                              {q.answer && (
                                <div className="mt-1 text-green-700 font-semibold">Answer: {q.answer}</div>
                              )}
                              {q.explanation && (
                                <div className="text-sm text-gray-600 mt-2">Explanation: {q.explanation}</div>
                              )}
                            </li>
                          ))}
                        </ul>
                        <div className="flex justify-end mt-8">
                          <Button variant="outline" onClick={() => { setTaskStarted(false); setTaskCompleted(false); setShowResult(false); setQuestions([]); }}>Generate More</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
