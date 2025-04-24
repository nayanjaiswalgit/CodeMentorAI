import { apiRequest } from "./queryClient";

/**
 * Login with username and password
 */
export async function login(username: string, password: string) {
  try {
    const response = await apiRequest("POST", "/api/auth/login", {
      username,
      password,
    });
    return response;
  } catch (error) {
    throw new Error(error.message || "Login failed. Please check your credentials.");
  }
}

/**
 * Register a new user
 */
export async function signup(userData: {
  username: string;
  email: string;
  password: string;
  displayName: string;
  skillLevel: string;
}) {
  try {
    const response = await apiRequest("POST", "/api/auth/signup", userData);
    return response;
  } catch (error) {
    throw new Error(error.message || "Signup failed. Please try again.");
  }
}

/**
 * Logout the current user
 */
export async function logout() {
  try {
    const response = await apiRequest("POST", "/api/auth/logout", {});
    return response;
  } catch (error) {
    throw new Error(error.message || "Logout failed.");
  }
}

/**
 * Get the current user's information
 */
export async function getCurrentUser() {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return null; // Not authenticated
      }
      throw new Error("Failed to fetch user data");
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Failed to get current user.");
  }
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(userId: number, updateData: any) {
  try {
    const response = await apiRequest("PATCH", `/api/users/${userId}`, updateData);
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to update profile.");
  }
}
