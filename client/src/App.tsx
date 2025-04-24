import { Switch, Route } from "wouter";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import Courses from "@/pages/courses/index";
import CourseDetail from "@/pages/courses/[courseId]";
import Challenges from "@/pages/challenges/index";
import ChallengeDetail from "@/pages/challenges/[challengeId]";
import Profile from "@/pages/profile";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";
import McqQuizzes from "@/pages/mcq/index";
import Tests from "@/pages/tests/index";
import CreateTest from "@/pages/tests/create";
import TestDetail from "@/pages/tests/[testId]";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

function AuthenticatedRoute({
  component: Component,
  ...rest
}: {
  component: React.ComponentType<any>;
  [key: string]: any;
}) {
  const { isLoading, data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login
    window.location.href = "/login";
    return null;
  }

  return <Component {...rest} />;
}

function UnauthenticatedRoute({
  component: Component,
  ...rest
}: {
  component: React.ComponentType<any>;
  [key: string]: any;
}) {
  const { isLoading, data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    // Redirect to dashboard
    window.location.href = "/";
    return null;
  }

  return <Component {...rest} />;
}

import LearningPathsIndex from "@/pages/learning-paths/index";
import LearningPathsCreate from "@/pages/learning-paths/create";
import LearningPathsDetail from "@/pages/learning-paths/pathId";

function App() {
  return (
    <Switch>
      <Route
        path="/"
        component={() => <AuthenticatedRoute component={Dashboard} />}
      />

      {/* Auth routes */}
      <Route
        path="/login"
        component={() => <UnauthenticatedRoute component={Login} />}
      />
      <Route
        path="/signup"
        component={() => <UnauthenticatedRoute component={Signup} />}
      />
      <Route
        path="/onboarding"
        component={() => <AuthenticatedRoute component={Onboarding} />}
      />

      {/* Course routes */}
      <Route
        path="/courses"
        component={() => <AuthenticatedRoute component={Courses} />}
      />
      <Route
        path="/courses/:courseId"
        component={(params) => (
          <AuthenticatedRoute component={CourseDetail} params={params} />
        )}
      />

      {/* Challenge routes */}
      <Route
        path="/challenges"
        component={() => <AuthenticatedRoute component={Challenges} />}
      />
      <Route
        path="/challenges/:challengeId"
        component={(params) => (
          <AuthenticatedRoute component={ChallengeDetail} params={params} />
        )}
      />

      {/* MCQ Quiz routes */}
      <Route
        path="/mcq"
        component={() => <AuthenticatedRoute component={McqQuizzes} />}
      />

      {/* Test routes */}
      <Route
        path="/tests"
        component={() => <AuthenticatedRoute component={Tests} />}
      />
      <Route
        path="/tests/create"
        component={() => <AuthenticatedRoute component={CreateTest} />}
      />
      <Route
        path="/tests/:testId"
        component={(params) => (
          <AuthenticatedRoute component={TestDetail} params={params} />
        )}
      />

      {/* Learning Paths routes */}
      <Route
        path="/learning-paths"
        component={() => <AuthenticatedRoute component={LearningPathsIndex} />}
      />
      <Route
        path="/learning-paths/create"
        component={() => <AuthenticatedRoute component={LearningPathsCreate} />}
      />
      <Route
        path="/learning-paths/:pathId"
        component={(params) => (
          <AuthenticatedRoute component={LearningPathsDetail} params={params} />
        )}
      />

      {/* Profile route */}
      <Route
        path="/profile"
        component={() => <AuthenticatedRoute component={Profile} />}
      />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
