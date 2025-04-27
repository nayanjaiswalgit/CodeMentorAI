export interface User {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  displayName?: string;
  streak?: number;
  skillLevel?: string;
  bio?: string;
  role: import("@/constants/permissions").UserRole;
}
