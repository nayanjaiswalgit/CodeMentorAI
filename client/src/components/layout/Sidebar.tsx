import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: "fas fa-home" },
  { path: "/courses", label: "My Courses", icon: "fas fa-book-open" },
  { path: "/challenges", label: "Challenges", icon: "fas fa-code" },
  { path: "/mcq", label: "MCQ Quizzes", icon: "fas fa-question-circle" },
  { path: "/tests", label: "Tests", icon: "fas fa-file-alt" },
  { path: "/profile", label: "Profile", icon: "fas fa-user-circle" },
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
          "w-64 bg-white border-r border-neutral-200 flex-shrink-0 h-full overflow-y-auto transition-all duration-300 ease-in-out",
          "fixed left-0 top-0 z-30 md:static md:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 flex items-center border-b border-neutral-200">
          <div className="rounded-md bg-primary bg-opacity-20 p-2 mr-3">
            <i className="fas fa-code text-primary text-xl"></i>
          </div>
          <h1 className="text-xl font-semibold">CodeMentor<span className="text-primary">AI</span></h1>
        </div>

        <nav className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Main</p>
          
          {navItems.map(item => (
            <div key={item.path} className="mb-1">
              <Link href={item.path}>
                <div 
                  className={cn(
                    "flex items-center py-2 px-3 rounded-md cursor-pointer",
                    location === item.path 
                      ? "bg-primary bg-opacity-10 text-primary" 
                      : "hover:bg-neutral-100 text-neutral-700"
                  )}
                  onClick={onClose}
                >
                  <i className={`${item.icon} w-5 mr-3`}></i>
                  <span>{item.label}</span>
                </div>
              </Link>
            </div>
          ))}

          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mt-6 mb-2">Learning Paths</p>
          
          {learningPaths.map(item => (
            <div key={item.path} className="mb-1">
              <Link href={item.path}>
                <div 
                  className={cn(
                    "flex items-center py-2 px-3 rounded-md cursor-pointer",
                    location === item.path 
                      ? "bg-primary bg-opacity-10 text-primary" 
                      : "hover:bg-neutral-100 text-neutral-700"
                  )}
                  onClick={onClose}
                >
                  <i className={`${item.icon} w-5 mr-3`}></i>
                  <span>{item.label}</span>
                </div>
              </Link>
            </div>
          ))}

          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mt-6 mb-2">Account</p>
          
          <div className="mb-1">
            <Link href="/profile">
              <div 
                className={cn(
                  "flex items-center py-2 px-3 rounded-md cursor-pointer",
                  location === "/profile" 
                    ? "bg-primary bg-opacity-10 text-primary" 
                    : "hover:bg-neutral-100 text-neutral-700"
                )}
                onClick={onClose}
              >
                <i className="fas fa-user-circle w-5 mr-3"></i>
                <span>Profile</span>
              </div>
            </Link>
          </div>
          
          <div className="mb-1">
            <Link href="/settings">
              <div 
                className="flex items-center py-2 px-3 rounded-md hover:bg-neutral-100 text-neutral-700 cursor-pointer"
                onClick={onClose}
              >
                <i className="fas fa-cog w-5 mr-3"></i>
                <span>Settings</span>
              </div>
            </Link>
          </div>
          
          <div className="mb-1">
            <Link href="/help">
              <div 
                className="flex items-center py-2 px-3 rounded-md hover:bg-neutral-100 text-neutral-700 cursor-pointer"
                onClick={onClose}
              >
                <i className="fas fa-question-circle w-5 mr-3"></i>
                <span>Help</span>
              </div>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}
