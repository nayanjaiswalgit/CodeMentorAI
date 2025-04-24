import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const onboardingSchema = z.object({
  bio: z.string().optional(),
  preferences: z.object({
    languages: z.array(z.string()).min(1, "Select at least one language"),
    interests: z.array(z.string()).min(1, "Select at least one interest area")
  }),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      bio: "",
      preferences: {
        languages: [],
        interests: []
      }
    },
  });

  const availableLanguages = [
    { id: "javascript", label: "JavaScript" },
    { id: "python", label: "Python" },
    { id: "cpp", label: "C++" },
    { id: "java", label: "Java" },
  ];

  const availableInterests = [
    { id: "web development", label: "Web Development" },
    { id: "data structures", label: "Data Structures & Algorithms" },
    { id: "machine learning", label: "Machine Learning" },
    { id: "mobile development", label: "Mobile Development" },
    { id: "game development", label: "Game Development" },
    { id: "devops", label: "DevOps" },
  ];

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("PATCH", `/api/users/${user?.id}`, {
        bio: data.bio,
        preferences: data.preferences
      });
      
      // Invalidate user query to get fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: "Profile updated",
        description: "Your preferences have been saved.",
      });
      
      // Redirect to dashboard
      setLocation("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "An error occurred while updating your profile",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipOnboarding = () => {
    toast({
      title: "Onboarding skipped",
      description: "You can update your preferences anytime from your profile.",
    });
    setLocation("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-md bg-primary bg-opacity-20 p-2">
              <i className="fas fa-code text-primary text-xl"></i>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome to CodeMentor<span className="text-primary">AI</span>
          </CardTitle>
          <CardDescription>
            Let's personalize your learning experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tell us about yourself (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your coding journey, experience, or goals..."
                        {...field}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferences.languages"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Which programming languages are you interested in?</FormLabel>
                      <div className="text-sm text-neutral-500">Select at least one</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {availableLanguages.map((language) => (
                        <FormField
                          key={language.id}
                          control={form.control}
                          name="preferences.languages"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={language.id}
                                className="flex items-center space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(language.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, language.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== language.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {language.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferences.interests"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">What areas are you interested in learning?</FormLabel>
                      <div className="text-sm text-neutral-500">Select at least one</div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.watch("preferences.interests")?.map((interest) => (
                        <Badge key={interest} variant="secondary" className="capitalize">
                          {interest}
                          <button
                            type="button"
                            className="ml-1 rounded-full hover:bg-neutral-200 p-1"
                            onClick={() => {
                              const currentInterests = form.getValues("preferences.interests");
                              form.setValue(
                                "preferences.interests",
                                currentInterests.filter((i) => i !== interest)
                              );
                            }}
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {availableInterests.map((interest) => (
                        <FormField
                          key={interest.id}
                          control={form.control}
                          name="preferences.interests"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={interest.id}
                                className="flex items-center space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(interest.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, interest.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== interest.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {interest.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={skipOnboarding}>
                  Skip for Now
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Preferences
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
