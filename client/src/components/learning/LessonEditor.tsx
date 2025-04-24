import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CodeEditor from "./CodeEditor";

interface LessonEditorProps {
  courseId: number;
  lesson?: any; // Existing lesson (for edit mode)
  onSave?: () => void;
}

export default function LessonEditor({ courseId, lesson, onSave }: LessonEditorProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(lesson?.title || "");
  const [content, setContent] = useState(lesson?.content || ""); // MDX
  const [estimatedMinutes, setEstimatedMinutes] = useState(lesson?.estimatedMinutes || 30);
  const [codeExamples, setCodeExamples] = useState(lesson?.codeExamples || []);
  const [tests, setTests] = useState(lesson?.tests || []);
  const [saving, setSaving] = useState(false);

  // Add code example
  const addCodeExample = () => {
    setCodeExamples([
      ...codeExamples,
      { language: "javascript", code: "", explanation: "" }
    ]);
  };

  // Add test
  const addTest = () => {
    setTests([
      ...tests,
      { question: "", options: ["", "", "", ""], correctAnswer: 0, code: "", explanation: "" }
    ]);
  };

  // Save lesson (create or update)
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        courseId,
        title,
        content,
        estimatedMinutes,
        codeExamples,
        tests
      };
      if (lesson?.id) {
        await apiRequest("PUT", `/api/lessons/${lesson.id}`, payload);
      } else {
        await apiRequest("POST", "/api/lessons", payload);
      }
      toast({ title: "Lesson saved" });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
      if (onSave) onSave();
    } catch (error: any) {
      toast({
        title: "Failed to save lesson",
        description: error.message || "An error occurred while saving the lesson",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6 space-y-6">
        <div>
          <label className="block mb-1 font-medium">Lesson Title</label>
          <input
            className="input input-bordered w-full"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Lesson Content (MDX)</label>
          <textarea
            className="textarea textarea-bordered w-full min-h-[100px]"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Estimated Minutes</label>
          <input
            type="number"
            className="input input-bordered w-32"
            value={estimatedMinutes}
            onChange={e => setEstimatedMinutes(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Code Examples</label>
          {codeExamples.map((ex: any, idx: number) => (
            <div key={idx} className="mb-4 border rounded p-2 bg-neutral-50">
              <div className="mb-2">
                <label>Language</label>
                <input
                  className="input input-bordered ml-2 w-32"
                  value={ex.language}
                  onChange={e => {
                    const arr = [...codeExamples];
                    arr[idx].language = e.target.value;
                    setCodeExamples(arr);
                  }}
                />
              </div>
              <CodeEditor
                initialCode={ex.code}
                language={ex.language}
                readOnly={false}
                onSubmit={code => {
                  const arr = [...codeExamples];
                  arr[idx].code = code;
                  setCodeExamples(arr);
                }}
              />
              <div className="mt-2">
                <label>Explanation</label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={ex.explanation}
                  onChange={e => {
                    const arr = [...codeExamples];
                    arr[idx].explanation = e.target.value;
                    setCodeExamples(arr);
                  }}
                />
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addCodeExample} type="button">Add Code Example</Button>
        </div>
        <div>
          <label className="block mb-1 font-medium">Tests</label>
          {tests.map((test: any, idx: number) => (
            <div key={idx} className="mb-4 border rounded p-2 bg-neutral-50">
              <div className="mb-2">
                <label>Question</label>
                <input
                  className="input input-bordered w-full"
                  value={test.question}
                  onChange={e => {
                    const arr = [...tests];
                    arr[idx].question = e.target.value;
                    setTests(arr);
                  }}
                />
              </div>
              <div className="mb-2">
                <label>Options</label>
                {test.options.map((opt: any, oidx: number) => (
                  <input
                    key={oidx}
                    className="input input-bordered w-full mb-1"
                    value={opt}
                    onChange={e => {
                      const arr = [...tests];
                      arr[idx].options[oidx] = e.target.value;
                      setTests(arr);
                    }}
                  />
                ))}
              </div>
              <div className="mb-2">
                <label>Correct Answer (Index)</label>
                <input
                  type="number"
                  className="input input-bordered w-16"
                  value={test.correctAnswer}
                  onChange={e => {
                    const arr = [...tests];
                    arr[idx].correctAnswer = Number(e.target.value);
                    setTests(arr);
                  }}
                />
              </div>
              <div className="mb-2">
                <label>Code (optional)</label>
                <CodeEditor
                  initialCode={test.code}
                  language={codeExamples[0]?.language || "javascript"}
                  readOnly={false}
                  onSubmit={code => {
                    const arr = [...tests];
                    arr[idx].code = code;
                    setTests(arr);
                  }}
                />
              </div>
              <div className="mb-2">
                <label>Explanation</label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={test.explanation}
                  onChange={e => {
                    const arr = [...tests];
                    arr[idx].explanation = e.target.value;
                    setTests(arr);
                  }}
                />
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addTest} type="button">Add Test</Button>
        </div>
        <Button onClick={handleSave} disabled={saving} type="button">
          {lesson ? "Update Lesson" : "Create Lesson"}
        </Button>
      </CardContent>
    </Card>
  );
}
