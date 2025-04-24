import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface CodeEditorProps {
  initialCode: string;
  language: string;
  challenge?: {
    id: number;
    title: string;
    description: string;
    expectedOutput?: string;
  };
  onSubmit?: (code: string, result: any, feedback: any) => void;
  readOnly?: boolean;
}

export default function CodeEditor({
  initialCode,
  language,
  challenge,
  onSubmit,
  readOnly = false
}: CodeEditorProps) {
  const { toast } = useToast();
  const editorRef = useRef(null);
  const [code, setCode] = useState(initialCode || "");
  const [output, setOutput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("code");

  // Language mapping for Monaco editor
  const languageMap = {
    javascript: "javascript",
    python: "python",
    cpp: "cpp",
    java: "java"
  };

  // Theme setup
  const editorTheme = "vs-light";

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  function handleCodeChange(value) {
    setCode(value);
  }

  async function handleRunCode() {
    if (!code.trim()) {
      toast({
        title: "Empty Code",
        description: "Please write some code before running.",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    setOutput("");
    
    try {
      const result = await apiRequest("POST", "/api/execute-code", {
        language,
        code
      });
      
      if (result.success) {
        setOutput(result.stdout || "Code executed successfully with no output.");
      } else {
        setOutput(`Error: ${result.stderr || "Unknown error occurred"}`);
      }
      
      setActiveTab("output");
    } catch (error) {
      setOutput(`Error: ${error.message || "Failed to execute code"}`);
      
      toast({
        title: "Execution Failed",
        description: error.message || "Failed to execute code",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  }

  async function handleGetFeedback() {
    if (!code.trim()) {
      toast({
        title: "Empty Code",
        description: "Please write some code before requesting feedback.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const result = await apiRequest("POST", "/api/ai-feedback", {
        language,
        code,
        challenge: challenge ? {
          description: challenge.description,
          expectedOutput: challenge.expectedOutput
        } : undefined
      });
      
      setFeedback(result);
      setActiveTab("feedback");
    } catch (error) {
      toast({
        title: "Feedback Failed",
        description: error.message || "Failed to get AI feedback",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleSubmitCode() {
    if (!code.trim()) {
      toast({
        title: "Empty Code",
        description: "Please write some code before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    setIsAnalyzing(true);
    
    try {
      // Execute code
      const executionResult = await apiRequest("POST", "/api/execute-code", {
        language,
        code
      });
      
      // Get AI feedback
      const feedbackResult = await apiRequest("POST", "/api/ai-feedback", {
        language,
        code,
        challenge: challenge ? {
          description: challenge.description,
          expectedOutput: challenge.expectedOutput
        } : undefined
      });
      
      setOutput(executionResult.stdout || "Code executed successfully with no output.");
      setFeedback(feedbackResult);
      
      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit(code, executionResult, feedbackResult);
      }
      
      toast({
        title: "Submission Complete",
        description: "Your code has been submitted successfully.",
      });
      
      setActiveTab("feedback");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit code",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <div className="px-3 py-1 rounded bg-neutral-100 text-neutral-700 text-sm font-medium mr-2">
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </div>
          {challenge && (
            <h3 className="text-neutral-800 font-medium">{challenge.title}</h3>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRunCode}
            disabled={isExecuting || readOnly}
          >
            {isExecuting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <i className="fas fa-play mr-1"></i>}
            Run
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetFeedback}
            disabled={isAnalyzing || readOnly}
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <i className="fas fa-robot mr-1"></i>}
            Get AI Feedback
          </Button>
          {challenge && onSubmit && (
            <Button
              size="sm"
              onClick={handleSubmitCode}
              disabled={isExecuting || isAnalyzing || readOnly}
              className="bg-primary hover:bg-primary/90"
            >
              {(isExecuting || isAnalyzing) ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <i className="fas fa-check mr-1"></i>}
              Submit
            </Button>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mb-2">
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="output">Output</TabsTrigger>
          <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="code" className="flex-1 mt-0">
          <div className="border rounded-md h-full overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage={languageMap[language.toLowerCase()] || "javascript"}
              defaultValue={initialCode}
              theme={editorTheme}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                readOnly: readOnly
              }}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              className="font-mono"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="output" className="flex-1 mt-0">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <div className="font-mono text-sm p-4 h-full overflow-auto bg-neutral-50 rounded-md">
                {isExecuting ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                    <p className="text-neutral-600">Executing code...</p>
                  </div>
                ) : output ? (
                  <pre className="whitespace-pre-wrap">{output}</pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                    <i className="fas fa-terminal text-2xl mb-2"></i>
                    <p>Run your code to see the output</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback" className="flex-1 mt-0">
          <Card className="h-full">
            <CardContent className="p-4 h-full overflow-auto">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                  <p className="text-neutral-600">AI is analyzing your code...</p>
                </div>
              ) : feedback ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">AI Feedback</h3>
                    <p className="text-neutral-700">{feedback.feedback}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Suggestions</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {feedback.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-neutral-700">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Code Quality</h4>
                      <div className="flex items-center">
                        <Progress value={feedback.codeQuality * 10} className="mr-2" />
                        <span className="text-sm font-medium">{feedback.codeQuality}/10</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Correctness</h4>
                      <div className="flex items-center">
                        <Progress value={feedback.correctness * 10} className="mr-2" />
                        <span className="text-sm font-medium">{feedback.correctness}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                  <i className="fas fa-robot text-2xl mb-2"></i>
                  <p>Get AI feedback on your code</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
