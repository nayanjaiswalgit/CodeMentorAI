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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, PlusCircle } from "lucide-react";
import McqQuiz from "@/components/learning/McqQuiz";

// Form validation schema
const mcqFormSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters long"),
  options: z.array(z.string()).min(2, "At least 2 options are required"),
  correctAnswer: z.number().min(0, "Please select the correct answer"),
  explanation: z.string().optional(),
  language: z.string().min(1, "Language is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
});

type McqFormData = z.infer<typeof mcqFormSchema>;

export default function CreateMcq() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Initialize form
  const form = useForm<McqFormData>({
    resolver: zodResolver(mcqFormSchema),
    defaultValues: {
      question: "",
      options: ["", ""],
      correctAnswer: 0,
      explanation: "",
      language: "javascript",
      difficulty: "beginner",
    },
  });
  
  // Add a new option field
  const addOption = () => {
    const currentOptions = form.getValues("options");
    form.setValue("options", [...currentOptions, ""]);
  };
  
  // Remove an option field
  const removeOption = (index: number) => {
    const currentOptions = form.getValues("options");
    
    // Don't allow removing if only 2 options remain
    if (currentOptions.length <= 2) {
      toast({
        title: "Cannot remove option",
        description: "You need at least 2 options for an MCQ quiz",
        variant: "destructive",
      });
      return;
    }
    
    // Update correctAnswer if needed
    const correctAnswerValue = form.getValues("correctAnswer");
    if (correctAnswerValue === index) {
      form.setValue("correctAnswer", 0);
    } else if (correctAnswerValue > index) {
      form.setValue("correctAnswer", correctAnswerValue - 1);
    }
    
    // Remove the option
    form.setValue(
      "options", 
      currentOptions.filter((_, i) => i !== index)
    );
  };
  
  // Handle form submission
  const onSubmit = async (data: McqFormData) => {
    try {
      await apiRequest("POST", "/api/mcqs", data);
      
      // Invalidate MCQs cache
      queryClient.invalidateQueries({ queryKey: ['/api/mcqs'] });
      
      toast({
        title: "MCQ created successfully",
        description: "Your multiple choice quiz has been created",
      });
      
      // Redirect to MCQ listing page
      setLocation("/mcq");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create MCQ",
        description: error.message || "An error occurred while creating the MCQ"
      });
    }
  };
  
  // Toggle preview mode
  const togglePreview = () => {
    if (!form.formState.isValid) {
      form.trigger();
      return;
    }
    setPreviewMode(!previewMode);
  };
  
  // Prepare quiz for preview
  const previewQuiz = {
    id: 0,
    question: form.getValues("question"),
    options: form.getValues("options"),
    correctAnswer: form.getValues("correctAnswer"),
    explanation: form.getValues("explanation"),
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
            <h1 className="text-2xl font-semibold mb-1">Create MCQ Quiz</h1>
            <p className="text-neutral-600">
              Create a new multiple choice quiz for students to test their knowledge
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {previewMode ? (
              <div className="mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <McqQuiz mcq={previewQuiz} />
                    <div className="mt-4">
                      <Button variant="outline" onClick={togglePreview}>
                        Back to Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Create New MCQ Quiz</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="question"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter your question here..." 
                                {...field}
                                className="min-h-20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <FormLabel>Options</FormLabel>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={addOption}
                            className="flex items-center gap-1"
                          >
                            <PlusCircle className="h-4 w-4" />
                            Add Option
                          </Button>
                        </div>
                        
                        {form.getValues("options").map((_, index) => (
                          <div key={index} className="flex gap-2">
                            <FormField
                              control={form.control}
                              name={`options.${index}`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <FormControl>
                                      <Input 
                                        placeholder={`Option ${index + 1}`} 
                                        {...field}
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeOption(index)}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                        
                        <FormField
                          control={form.control}
                          name="correctAnswer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correct Answer</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                defaultValue={field.value.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select the correct answer" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {form.getValues("options").map((option, index) => (
                                    <SelectItem key={index} value={index.toString()}>
                                      Option {index + 1}: {option.substring(0, 30)}{option.length > 30 ? "..." : ""}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="explanation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Explanation (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Explain why the correct answer is correct..." 
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
                              <FormLabel>Language</FormLabel>
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
                      
                      <div className="flex gap-2 justify-end">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={togglePreview}
                        >
                          Preview
                        </Button>
                        <Button type="submit">Create MCQ</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}