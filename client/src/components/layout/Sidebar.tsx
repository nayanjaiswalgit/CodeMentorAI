import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types/user";
import { UserRole, Permission, hasPermission } from "@/constants/permissions";
import { SidebarNavSection } from "./SidebarNavSection";

const navItems = [
  { path: "/", label: "Dashboard", icon: "fas fa-home" },
  { path: "/home", label: "Home", icon: "fas fa-house-user" },
  { path: "/my-learning", label: "My Learning", icon: "fas fa-graduation-cap" },
  { path: "/courses", label: "Courses", icon: "fas fa-book-open" },
  { path: "/calendar", label: "Calendar", icon: "fas fa-calendar-alt" },
  { path: "/challenges", label: "Challenges", icon: "fas fa-code" },
  { path: "/mcq", label: "MCQ Quizzes", icon: "fas fa-question-circle" },
  { path: "/tests", label: "Tests", icon: "fas fa-file-alt" },
  { path: "/tests/generate", label: "Generate Questions", icon: "fas fa-magic" },
];

const learningPaths = [
  { path: "/paths/web", label: "Web Development", icon: "fas fa-laptop-code" },
  { path: "/paths/data", label: "Data Structures", icon: "fas fa-database" },
  { path: "/paths/ml", label: "Machine Learning", icon: "fas fa-brain" },
  { path: "/paths/mobile", label: "Mobile Development", icon: "fas fa-mobile-alt" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });

  // Role-based nav (example: show admin link)
  const showAdminPanel = user && hasPermission(user.role, Permission.ACCESS_ADMIN_PANEL);

  // Compose sidebar sections
  const sections = [
    { title: "Main", items: navItems },
    { title: "Learning Paths", items: learningPaths },
  ];

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside 
        className={cn(
          "w-56 bg-white border-r border-gray-200 flex-shrink-0 h-full overflow-y-auto transition-all duration-300 ease-in-out shadow-sm font-sans",
          "fixed left-0 top-0 z-30 md:static md:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 flex items-center border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="rounded bg-gray-100 p-2 mr-2">
            <i className="fas fa-graduation-cap text-primary text-xl"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">CodeMentor<span className="text-primary font-light">AI</span></h1>
        </div>

        <nav className="p-2">
          {sections.map(section => (
            <SidebarNavSection
              key={section.title}
              title={section.title}
              items={section.items}
              location={location}
              onClose={onClose}
            />
          ))}

          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-6 mb-2 pl-2">Account</p>

          {showAdminPanel && (
            <SidebarNavSection
              title=""
              items={[{ path: "/admin", label: "Admin Panel", icon: "fas fa-tools" }]}
              location={location}
              onClose={onClose}
            />
          )}

          <SidebarNavSection
            title=""
            items={[
              { path: "/profile", label: "Profile", icon: "fas fa-user-circle" },
              { path: "/settings", label: "Settings", icon: "fas fa-cog" },
              { path: "/help", label: "Help", icon: "fas fa-question-circle" },
            ]}
            location={location}
            onClose={onClose}
          />
        </nav>
      </aside>
    </>
  );
}
