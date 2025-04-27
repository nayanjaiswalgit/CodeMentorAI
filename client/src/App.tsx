import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
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
import GenerateQuestionsPage from "@/pages/tests/generate";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import LearningPathsIndex from "@/pages/learning-paths/index";
import LearningPathsCreate from "@/pages/learning-paths/create";
import LearningPathsDetail from "@/pages/learning-paths/pathId";
import SettingsPage from "./pages/settings";
import Home from "@/pages/home";
import MyLearning from "@/pages/my-learning";
import Calendar from "@/pages/calendar";

interface RouteWrapperProps {
  children: React.ReactNode;
}

function AuthenticatedRouteWrapper({ children }: RouteWrapperProps) {
  const { isLoading, data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" role="status" aria-busy="true">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading..." />
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
}

function UnauthenticatedRouteWrapper({ children }: RouteWrapperProps) {
  const { isLoading, data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/");
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" role="status" aria-busy="true">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading..." />
      </div>
    );
  }

  if (user) return null;
  return <>{children}</>;
}

// Route config and wrapper helpers for DRY code

interface AppRoute {
  path?: string;
  component: React.ComponentType<any>;
  auth?: 'authenticated' | 'unauthenticated' | 'none';
  exact?: boolean;
}

const appRoutes: AppRoute[] = [
  { path: '/', component: Dashboard, auth: 'authenticated' },
  { path: '/home', component: Home, auth: 'authenticated' },
  { path: '/my-learning', component: MyLearning, auth: 'authenticated' },
  { path: '/calendar', component: Calendar, auth: 'authenticated' },
  { path: '/onboarding', component: Onboarding, auth: 'authenticated' },
  { path: '/courses', component: Courses, auth: 'authenticated' },
  { path: '/courses/:courseId', component: CourseDetail, auth: 'authenticated' },
  { path: '/challenges', component: Challenges, auth: 'authenticated' },
  { path: '/challenges/:challengeId', component: ChallengeDetail, auth: 'authenticated' },
  { path: '/mcq', component: McqQuizzes, auth: 'authenticated' },
  { path: '/tests', component: Tests, auth: 'authenticated' },
  { path: '/tests/create', component: CreateTest, auth: 'authenticated' },
  { path: '/tests/generate', component: GenerateQuestionsPage, auth: 'authenticated' },
  { path: '/tests/:testId', component: TestDetail, auth: 'authenticated' },
  { path: '/learning-paths', component: LearningPathsIndex, auth: 'authenticated' },
  { path: '/learning-paths/create', component: LearningPathsCreate, auth: 'authenticated' },
  { path: '/learning-paths/:pathId', component: LearningPathsDetail, auth: 'authenticated' },
  { path: '/profile', component: Profile, auth: 'authenticated' },
  { path: '/settings', component: SettingsPage, auth: 'authenticated' },
  { path: '/login', component: Login, auth: 'unauthenticated' },
  { path: '/signup', component: Signup, auth: 'unauthenticated' },
  // 404 fallback handled below
];

function RouteWithAuth({ route, params }: { route: AppRoute; params?: any }) {
  if (route.auth === 'authenticated') {
    return (
      <AuthenticatedRouteWrapper>
        <route.component {...params} />
      </AuthenticatedRouteWrapper>
    );
  }
  if (route.auth === 'unauthenticated') {
    return (
      <UnauthenticatedRouteWrapper>
        <route.component {...params} />
      </UnauthenticatedRouteWrapper>
    );
  }
  return <route.component {...params} />;
}

function App() {
  return (
    <Switch>
      {appRoutes.map(route => (
        <Route
          key={route.path || 'notfound'}
          path={route.path}
          component={params => <RouteWithAuth route={route} params={params} />}
        />
      ))}
      {/* 404 fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
