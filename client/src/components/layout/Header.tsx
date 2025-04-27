import { useState } from "react";
import { useQuery, QueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/types/user";
import { UserRole, Permission, hasPermission } from "@/constants/permissions";

interface HeaderProps {
  onOpenSidebar: () => void;
}

export default function Header({ onOpenSidebar }: HeaderProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    retry: false
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      // Invalidate the user query
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      // Redirect to login
      setLocation("/login");
      toast({
        title: "Logged out successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message || "An error occurred while logging out",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    toast({
      title: "Search not implemented",
      description: `You searched for: ${searchQuery}`,
    });
  };

  // Example: Only show admin panel link if user is admin
  const showAdminPanel = user && hasPermission(user.role, Permission.ACCESS_ADMIN_PANEL);

  return (
    <header className="bg-white border-b border-neutral-200 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <button 
          className="md:hidden text-neutral-700 mr-3"
          onClick={onOpenSidebar}
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
        <div className="relative flex items-center">
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Search for courses, challenges..." 
              className="py-1.5 pl-9 pr-4 rounded-md border border-neutral-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 placeholder-neutral-400 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fas fa-search text-neutral-400 absolute left-3 top-2.5"></i>
          </form>
        </div>
      </div>

      <div className="flex items-center">
        <div className="mr-4">
          <Link href="/notifications">
            <div className="text-neutral-700 p-2 hover:bg-neutral-100 rounded-full relative cursor-pointer">
              <i className="fas fa-bell"></i>
              <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
            </div>
          </Link>
        </div>
        
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-white font-medium">
                {user?.displayName?.charAt(0) || user?.username?.charAt(0) || "?"}
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:block">
                {user?.displayName || user?.username || "User"}
              </span>
              <i className="fas fa-chevron-down text-xs ml-2 text-neutral-500"></i>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <div className="w-full flex cursor-pointer">
                    <i className="fas fa-user mr-2"></i>
                    <span>Profile</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <div className="w-full flex cursor-pointer">
                    <i className="fas fa-cog mr-2"></i>
                    <span>Settings</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              {showAdminPanel && (
                <DropdownMenuItem asChild>
                  <a href="/admin">
                    <i className="fas fa-tools mr-2"></i>Admin Panel
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <i className="fas fa-sign-out-alt mr-2"></i>
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <div className="text-sm font-medium text-primary hover:text-primary-dark cursor-pointer">
              Login
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
