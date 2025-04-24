import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { XCircle, PlusCircle, Code, AlignLeft, Check, Trash2, Eye, MoveUp, MoveDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Editor } from "@monaco-editor/react";

// Question types
type QuestionType = "mcq" | "code-mcq" | "multi-select";

// Basic question interface
interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  points: number;
}

// MCQ question type
interface McqQuestion extends BaseQuestion {
  type: "mcq";
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// Code MCQ question type
interface CodeMcqQuestion extends BaseQuestion {
  type: "code-mcq";
  code: string;
  language: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// Multiple selection question type
interface MultiSelectQuestion extends BaseQuestion {
  type: "multi-select";
  options: string[];
  correctAnswers: number[];
  explanation?: string;
}

// Union type for all question types
type Question = McqQuestion | CodeMcqQuestion | MultiSelectQuestion;

// Test interface
interface Test {
  title: string;
  description: string;
  language: string;
  difficulty: string;
  timeLimit: number;
  passingScore: number;
  questions: Question[];
}

// Form validation schema
const testFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  language: z.string().min(1, "Language is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  timeLimit: z.number().min(1, "Time limit must be at least 1 minute"),
  passingScore: z.number().min(1, "Passing score must be at least 1"),
});

export default function CreateTest() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("test-info");
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Initialize form
  const form = useForm<z.infer<typeof testFormSchema>>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      title: "",
      description: "",
      language: "javascript",
      difficulty: "beginner",
      timeLimit: 30,
      passingScore: 70,
    },
  });

  // MCQ form state
  const [mcqState, setMcqState] = useState({
    question: "",
    options: ["", ""],
    correctAnswer: 0,
    explanation: "",
    points: 10,
  });

  // Code MCQ form state
  const [codeMcqState, setCodeMcqState] = useState({
    question: "",
    code: "// Add your code here",
    language: "javascript",
    options: ["", ""],
    correctAnswer: 0,
    explanation: "",
    points: 15,
  });

  // Multi-select form state
  const [multiSelectState, setMultiSelectState] = useState({
    question: "",
    options: ["", ""],
    correctAnswers: [0],
    explanation: "",
    points: 15,
  });

  // Generate unique ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  // Add option to MCQ
  const addMcqOption = () => {
    setMcqState({
      ...mcqState,
      options: [...mcqState.options, ""]
    });
  };

  // Remove option from MCQ
  const removeMcqOption = (index: number) => {
    if (mcqState.options.length <= 2) {
      toast({
        title: "Cannot remove option",
        description: "You need at least 2 options for an MCQ",
        variant: "destructive",
      });
      return;
    }

    const newOptions = [...mcqState.options];
    newOptions.splice(index, 1);

    // Adjust correct answer if needed
    let correctAnswer = mcqState.correctAnswer;
    if (correctAnswer === index) {
      correctAnswer = 0;
    } else if (correctAnswer > index) {
      correctAnswer = correctAnswer - 1;
    }

    setMcqState({
      ...mcqState,
      options: newOptions,
      correctAnswer
    });
  };

  // Add option to Code MCQ
  const addCodeMcqOption = () => {
    setCodeMcqState({
      ...codeMcqState,
      options: [...codeMcqState.options, ""]
    });
  };

  // Remove option from Code MCQ
  const removeCodeMcqOption = (index: number) => {
    if (codeMcqState.options.length <= 2) {
      toast({
        title: "Cannot remove option",
        description: "You need at least 2 options for a Code MCQ",
        variant: "destructive",
      });
      return;
    }

    const newOptions = [...codeMcqState.options];
    newOptions.splice(index, 1);

    // Adjust correct answer if needed
    let correctAnswer = codeMcqState.correctAnswer;
    if (correctAnswer === index) {
      correctAnswer = 0;
    } else if (correctAnswer > index) {
      correctAnswer = correctAnswer - 1;
    }

    setCodeMcqState({
      ...codeMcqState,
      options: newOptions,
      correctAnswer
    });
  };

  // Add option to Multi-select
  const addMultiSelectOption = () => {
    setMultiSelectState({
      ...multiSelectState,
      options: [...multiSelectState.options, ""]
    });
  };

  // Remove option from Multi-select
  const removeMultiSelectOption = (index: number) => {
    if (multiSelectState.options.length <= 2) {
      toast({
        title: "Cannot remove option",
        description: "You need at least 2 options for a multi-select question",
        variant: "destructive",
      });
      return;
    }

    const newOptions = [...multiSelectState.options];
    newOptions.splice(index, 1);

    // Adjust correct answers if needed
    const newCorrectAnswers = multiSelectState.correctAnswers.filter(i => {
      if (i === index) return false;
      if (i > index) return i - 1;
      return i;
    }) as number[];

    setMultiSelectState({
      ...multiSelectState,
      options: newOptions,
      correctAnswers: newCorrectAnswers
    });
  };

  // Toggle correct answer for multi-select
  const toggleMultiSelectAnswer = (index: number) => {
    const correctAnswers = [...multiSelectState.correctAnswers];
    const answerIndex = correctAnswers.indexOf(index);
    
    if (answerIndex === -1) {
      correctAnswers.push(index);
    } else {
      correctAnswers.splice(answerIndex, 1);
    }
    
    setMultiSelectState({
      ...multiSelectState,
      correctAnswers
    });
  };

  // Add MCQ question
  const addMcqQuestion = () => {
    if (!mcqState.question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    if (mcqState.options.some(opt => !opt.trim())) {
      toast({
        title: "Invalid options",
        description: "All options must have content",
        variant: "destructive",
      });
      return;
    }

    const newQuestion: McqQuestion = {
      id: generateId(),
      type: "mcq",
      question: mcqState.question,
      options: mcqState.options,
      correctAnswer: mcqState.correctAnswer,
      explanation: mcqState.explanation || undefined,
      points: mcqState.points
    };

    setQuestions([...questions, newQuestion]);
    
    // Reset form
    setMcqState({
      question: "",
      options: ["", ""],
      correctAnswer: 0,
      explanation: "",
      points: 10,
    });

    toast({
      title: "Question added",
      description: "MCQ question has been added to the test",
    });
  };

  // Add Code MCQ question
  const addCodeMcqQuestion = () => {
    if (!codeMcqState.question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    if (!codeMcqState.code.trim()) {
      toast({
        title: "Code required",
        description: "Please enter code for the question",
        variant: "destructive",
      });
      return;
    }

    if (codeMcqState.options.some(opt => !opt.trim())) {
      toast({
        title: "Invalid options",
        description: "All options must have content",
        variant: "destructive",
      });
      return;
    }

    const newQuestion: CodeMcqQuestion = {
      id: generateId(),
      type: "code-mcq",
      question: codeMcqState.question,
      code: codeMcqState.code,
      language: codeMcqState.language,
      options: codeMcqState.options,
      correctAnswer: codeMcqState.correctAnswer,
      explanation: codeMcqState.explanation || undefined,
      points: codeMcqState.points
    };

    setQuestions([...questions, newQuestion]);
    
    // Reset form
    setCodeMcqState({
      question: "",
      code: "// Add your code here",
      language: "javascript",
      options: ["", ""],
      correctAnswer: 0,
      explanation: "",
      points: 15,
    });

    toast({
      title: "Question added",
      description: "Code MCQ question has been added to the test",
    });
  };

  // Add Multi-select question
  const addMultiSelectQuestion = () => {
    if (!multiSelectState.question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    if (multiSelectState.options.some(opt => !opt.trim())) {
      toast({
        title: "Invalid options",
        description: "All options must have content",
        variant: "destructive",
      });
      return;
    }

    if (multiSelectState.correctAnswers.length === 0) {
      toast({
        title: "Correct answer required",
        description: "Please select at least one correct answer",
        variant: "destructive",
      });
      return;
    }

    const newQuestion: MultiSelectQuestion = {
      id: generateId(),
      type: "multi-select",
      question: multiSelectState.question,
      options: multiSelectState.options,
      correctAnswers: multiSelectState.correctAnswers,
      explanation: multiSelectState.explanation || undefined,
      points: multiSelectState.points
    };

    setQuestions([...questions, newQuestion]);
    
    // Reset form
    setMultiSelectState({
      question: "",
      options: ["", ""],
      correctAnswers: [0],
      explanation: "",
      points: 15,
    });

    toast({
      title: "Question added",
      description: "Multi-select question has been added to the test",
    });
  };

  // Remove question from the test
  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast({
      title: "Question removed",
      description: "The question has been removed from the test",
    });
  };

  // Move question up in the list
  const moveQuestionUp = (index: number) => {
    if (index === 0) return;
    const newQuestions = [...questions];
    [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
    setQuestions(newQuestions);
  };

  // Move question down in the list
  const moveQuestionDown = (index: number) => {
    if (index === questions.length - 1) return;
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    setQuestions(newQuestions);
  };

  // Calculate total points
  const calculateTotalPoints = () => {
    return questions.reduce((sum, q) => sum + q.points, 0);
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof testFormSchema>) => {
    if (questions.length === 0) {
      toast({
        title: "No questions",
        description: "Please add at least one question to the test",
        variant: "destructive",
      });
      return;
    }

    try {
      const testData: Test = {
        ...data,
        questions
      };

      await apiRequest("POST", "/api/tests", testData);
      
      // Invalidate tests cache
      queryClient.invalidateQueries({ queryKey: ['/api/tests'] });
      
      toast({
        title: "Test created successfully",
        description: "Your test has been created and is ready to be taken",
      });
      
      // Redirect to tests listing page
      setLocation("/tests");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create test",
        description: error.message || "An error occurred while creating the test"
      });
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
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">Create Test</h1>
            <p className="text-neutral-600">
              Create a comprehensive test with multiple question types
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="max-w-5xl mx-auto"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="test-info">
                Test Information
              </TabsTrigger>
              <TabsTrigger value="add-questions">
                Add Questions
              </TabsTrigger>
              <TabsTrigger value="review" disabled={questions.length === 0}>
                Review & Submit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="test-info" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Information</CardTitle>
                  <CardDescription>
                    Provide basic information about your test
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Test Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter test title..." 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter test description..." 
                                {...field}
                                className="min-h-20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary Language</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="javascript">JavaScript</SelectItem>
                                  <SelectItem value="python">Python</SelectItem>
                                  <SelectItem value="cpp">C++</SelectItem>
                                  <SelectItem value="java">Java</SelectItem>
                                  <SelectItem value="csharp">C#</SelectItem>
                                  <SelectItem value="rust">Rust</SelectItem>
                                  <SelectItem value="go">Go</SelectItem>
                                  <SelectItem value="general">General Programming</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="difficulty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Difficulty</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select difficulty" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="beginner">Beginner</SelectItem>
                                  <SelectItem value="intermediate">Intermediate</SelectItem>
                                  <SelectItem value="advanced">Advanced</SelectItem>
                                  <SelectItem value="expert">Expert</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="timeLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time Limit (minutes)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1}
                                  {...field}
                                  onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                  value={field.value}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="passingScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Passing Score (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1} 
                                  max={100}
                                  {...field}
                                  onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                  value={field.value}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="button"
                          onClick={() => setActiveTab("add-questions")}
                        >
                          Continue to Add Questions
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add-questions" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Questions Added ({questions.length})</CardTitle>
                  <CardDescription>
                    Total points: {calculateTotalPoints()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {questions.length > 0 ? (
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <div 
                          key={question.id} 
                          className="flex items-start justify-between border p-4 rounded-md"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">Q{index + 1}.</span>
                              {question.type === "mcq" && <AlignLeft className="h-4 w-4" />}
                              {question.type === "code-mcq" && <Code className="h-4 w-4" />}
                              {question.type === "multi-select" && <Check className="h-4 w-4" />}
                              <span className="text-sm text-neutral-500">
                                ({question.type === "mcq" ? "Multiple Choice" : 
                                  question.type === "code-mcq" ? "Code-based MCQ" :
                                  "Multiple Selection"}) - {question.points} points
                              </span>
                            </div>
                            <p>{question.question}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveQuestionUp(index)}
                              disabled={index === 0}
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveQuestionDown(index)}
                              disabled={index === questions.length - 1}
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeQuestion(question.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-500">
                      No questions added yet. Use the forms below to add questions.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Tabs defaultValue="mcq" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="mcq">
                    <AlignLeft className="h-4 w-4 mr-2" />
                    Multiple Choice
                  </TabsTrigger>
                  <TabsTrigger value="code-mcq">
                    <Code className="h-4 w-4 mr-2" />
                    Code MCQ
                  </TabsTrigger>
                  <TabsTrigger value="multi-select">
                    <Check className="h-4 w-4 mr-2" />
                    Multiple Selection
                  </TabsTrigger>
                </TabsList>

                {/* Multiple Choice Question Form */}
                <TabsContent value="mcq" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Add Multiple Choice Question</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <FormLabel>Question</FormLabel>
                          <Textarea
                            placeholder="Enter your question here..."
                            value={mcqState.question}
                            onChange={(e) => setMcqState({ ...mcqState, question: e.target.value })}
                            className="min-h-20"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <FormLabel>Options</FormLabel>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={addMcqOption}
                              className="flex items-center gap-1"
                            >
                              <PlusCircle className="h-4 w-4" />
                              Add Option
                            </Button>
                          </div>
                          
                          {mcqState.options.map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Input 
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...mcqState.options];
                                      newOptions[index] = e.target.value;
                                      setMcqState({ ...mcqState, options: newOptions });
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeMcqOption(index)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div>
                          <FormLabel>Correct Answer</FormLabel>
                          <Select
                            value={mcqState.correctAnswer.toString()}
                            onValueChange={(value) => setMcqState({ ...mcqState, correctAnswer: parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select the correct answer" />
                            </SelectTrigger>
                            <SelectContent>
                              {mcqState.options.map((option, index) => (
                                <SelectItem key={index} value={index.toString()}>
                                  Option {index + 1}: {option.substring(0, 30)}{option.length > 30 ? "..." : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <FormLabel>Explanation (Optional)</FormLabel>
                          <Textarea 
                            placeholder="Explain why the correct answer is correct..." 
                            value={mcqState.explanation}
                            onChange={(e) => setMcqState({ ...mcqState, explanation: e.target.value })}
                            className="min-h-20"
                          />
                        </div>

                        <div>
                          <FormLabel>Points</FormLabel>
                          <Input 
                            type="number"
                            min={1}
                            value={mcqState.points}
                            onChange={(e) => setMcqState({ ...mcqState, points: parseInt(e.target.value) || 1 })}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            type="button"
                            onClick={addMcqQuestion}
                          >
                            Add Question
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Code MCQ Question Form */}
                <TabsContent value="code-mcq" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Add Code-based Multiple Choice Question</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <FormLabel>Question</FormLabel>
                          <Textarea
                            placeholder="Enter your question here..."
                            value={codeMcqState.question}
                            onChange={(e) => setCodeMcqState({ ...codeMcqState, question: e.target.value })}
                            className="min-h-20"
                          />
                        </div>

                        <div>
                          <FormLabel>Code Snippet</FormLabel>
                          <div className="border rounded-md overflow-hidden">
                            <Editor
                              height="200px"
                              defaultLanguage={codeMcqState.language}
                              value={codeMcqState.code}
                              onChange={(value) => setCodeMcqState({ ...codeMcqState, code: value || "" })}
                              options={{
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                fontSize: 14,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <FormLabel>Language</FormLabel>
                          <Select
                            value={codeMcqState.language}
                            onValueChange={(value) => setCodeMcqState({ ...codeMcqState, language: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="javascript">JavaScript</SelectItem>
                              <SelectItem value="typescript">TypeScript</SelectItem>
                              <SelectItem value="python">Python</SelectItem>
                              <SelectItem value="java">Java</SelectItem>
                              <SelectItem value="csharp">C#</SelectItem>
                              <SelectItem value="cpp">C++</SelectItem>
                              <SelectItem value="go">Go</SelectItem>
                              <SelectItem value="rust">Rust</SelectItem>
                              <SelectItem value="sql">SQL</SelectItem>
                              <SelectItem value="html">HTML</SelectItem>
                              <SelectItem value="css">CSS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <FormLabel>Options</FormLabel>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={addCodeMcqOption}
                              className="flex items-center gap-1"
                            >
                              <PlusCircle className="h-4 w-4" />
                              Add Option
                            </Button>
                          </div>
                          
                          {codeMcqState.options.map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Input 
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...codeMcqState.options];
                                      newOptions[index] = e.target.value;
                                      setCodeMcqState({ ...codeMcqState, options: newOptions });
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeCodeMcqOption(index)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div>
                          <FormLabel>Correct Answer</FormLabel>
                          <Select
                            value={codeMcqState.correctAnswer.toString()}
                            onValueChange={(value) => setCodeMcqState({ ...codeMcqState, correctAnswer: parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select the correct answer" />
                            </SelectTrigger>
                            <SelectContent>
                              {codeMcqState.options.map((option, index) => (
                                <SelectItem key={index} value={index.toString()}>
                                  Option {index + 1}: {option.substring(0, 30)}{option.length > 30 ? "..." : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <FormLabel>Explanation (Optional)</FormLabel>
                          <Textarea 
                            placeholder="Explain why the correct answer is correct..." 
                            value={codeMcqState.explanation}
                            onChange={(e) => setCodeMcqState({ ...codeMcqState, explanation: e.target.value })}
                            className="min-h-20"
                          />
                        </div>

                        <div>
                          <FormLabel>Points</FormLabel>
                          <Input 
                            type="number"
                            min={1}
                            value={codeMcqState.points}
                            onChange={(e) => setCodeMcqState({ ...codeMcqState, points: parseInt(e.target.value) || 1 })}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            type="button"
                            onClick={addCodeMcqQuestion}
                          >
                            Add Question
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Multiple Selection Question Form */}
                <TabsContent value="multi-select" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Add Multiple Selection Question</CardTitle>
                      <CardDescription>
                        User can select multiple correct answers
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <FormLabel>Question</FormLabel>
                          <Textarea
                            placeholder="Enter your question here..."
                            value={multiSelectState.question}
                            onChange={(e) => setMultiSelectState({ ...multiSelectState, question: e.target.value })}
                            className="min-h-20"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <FormLabel>Options</FormLabel>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={addMultiSelectOption}
                              className="flex items-center gap-1"
                            >
                              <PlusCircle className="h-4 w-4" />
                              Add Option
                            </Button>
                          </div>
                          
                          {multiSelectState.options.map((option, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <Checkbox
                                id={`option-${index}`}
                                checked={multiSelectState.correctAnswers.includes(index)}
                                onCheckedChange={() => toggleMultiSelectAnswer(index)}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Input 
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...multiSelectState.options];
                                      newOptions[index] = e.target.value;
                                      setMultiSelectState({ ...multiSelectState, options: newOptions });
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeMultiSelectOption(index)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div>
                          <FormLabel className="flex items-center gap-1">
                            Correct Answers
                            <span className="text-sm text-neutral-500">(check the boxes above)</span>
                          </FormLabel>
                          <div className="text-sm flex flex-wrap gap-2 mt-2">
                            {multiSelectState.correctAnswers.length > 0 ? (
                              multiSelectState.correctAnswers.map(index => (
                                <span key={index} className="px-2 py-1 bg-primary bg-opacity-10 rounded-md">
                                  Option {index + 1}
                                </span>
                              ))
                            ) : (
                              <span className="text-neutral-500">No correct answers selected</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <FormLabel>Explanation (Optional)</FormLabel>
                          <Textarea 
                            placeholder="Explain why the selected answers are correct..." 
                            value={multiSelectState.explanation}
                            onChange={(e) => setMultiSelectState({ ...multiSelectState, explanation: e.target.value })}
                            className="min-h-20"
                          />
                        </div>

                        <div>
                          <FormLabel>Points</FormLabel>
                          <Input 
                            type="number"
                            min={1}
                            value={multiSelectState.points}
                            onChange={(e) => setMultiSelectState({ ...multiSelectState, points: parseInt(e.target.value) || 1 })}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            type="button"
                            onClick={addMultiSelectQuestion}
                          >
                            Add Question
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("test-info")}
                >
                  Back to Test Info
                </Button>
                <Button 
                  type="button"
                  onClick={() => setActiveTab("review")}
                  disabled={questions.length === 0}
                >
                  Continue to Review
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="review" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review Test</CardTitle>
                  <CardDescription>
                    Review your test before submitting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Test Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-neutral-500">Title:</p>
                          <p>{form.getValues("title")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">Language:</p>
                          <p>{form.getValues("language")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">Difficulty:</p>
                          <p>{form.getValues("difficulty")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">Time Limit:</p>
                          <p>{form.getValues("timeLimit")} minutes</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">Passing Score:</p>
                          <p>{form.getValues("passingScore")}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">Total Points:</p>
                          <p>{calculateTotalPoints()} points</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Description:</p>
                        <p>{form.getValues("description")}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
                      <div className="space-y-4">
                        {questions.map((question, index) => (
                          <div 
                            key={question.id} 
                            className="border p-4 rounded-md"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">Q{index + 1}.</span>
                              {question.type === "mcq" && <AlignLeft className="h-4 w-4" />}
                              {question.type === "code-mcq" && <Code className="h-4 w-4" />}
                              {question.type === "multi-select" && <Check className="h-4 w-4" />}
                              <span className="text-sm text-neutral-500">
                                ({question.type === "mcq" ? "Multiple Choice" : 
                                  question.type === "code-mcq" ? "Code-based MCQ" :
                                  "Multiple Selection"}) - {question.points} points
                              </span>
                            </div>
                            <p className="mb-2">{question.question}</p>

                            {question.type === "code-mcq" && (
                              <div className="border rounded-md overflow-hidden mb-4">
                                <Editor
                                  height="150px"
                                  language={question.language}
                                  value={question.code}
                                  options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    fontSize: 14,
                                  }}
                                />
                              </div>
                            )}

                            <div className="space-y-2 mb-2">
                              <p className="text-sm text-neutral-500">Options:</p>
                              <ul className="list-disc pl-5 space-y-1">
                                {question.options.map((option, optIndex) => (
                                  <li key={optIndex} className={
                                    question.type === "mcq" 
                                      ? (question.correctAnswer === optIndex ? "text-green-600" : "") 
                                      : question.type === "code-mcq"
                                        ? (question.correctAnswer === optIndex ? "text-green-600" : "")
                                        : (question.correctAnswers.includes(optIndex) ? "text-green-600" : "")
                                  }>
                                    {option}
                                    {question.type === "mcq" && question.correctAnswer === optIndex && " (correct)"}
                                    {question.type === "code-mcq" && question.correctAnswer === optIndex && " (correct)"}
                                    {question.type === "multi-select" && question.correctAnswers.includes(optIndex) && " (correct)"}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {question.explanation && (
                              <div>
                                <p className="text-sm text-neutral-500">Explanation:</p>
                                <p className="text-sm">{question.explanation}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("add-questions")}
                >
                  Back to Questions
                </Button>
                <Button 
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                >
                  Create Test
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}