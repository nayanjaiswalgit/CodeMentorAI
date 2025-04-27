import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Use import.meta.env for Vite, fallback to window.env for CRA, fallback to default
const API_BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE
  ? import.meta.env.VITE_API_BASE
  : (window.env && window.env.REACT_APP_API_BASE) || "http://localhost:8000/";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  // Ensure trailing slash and prepend API base if not absolute
  let endpoint = url.startsWith("http") ? url : `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;
  if (!endpoint.endsWith("/")) endpoint += "/";

  const token = localStorage.getItem("authToken");
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  if (token) headers["Authorization"] = `Token ${token}`;

  const res = await fetch(endpoint, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  // Try to parse JSON, fallback to text
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }
  return await res.text();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let endpoint = queryKey[0] as string;
    endpoint = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    if (!endpoint.endsWith("/")) endpoint += "/";
    const token = localStorage.getItem("authToken");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Token ${token}`;
    const res = await fetch(endpoint, {
      credentials: "include",
      headers,
    });
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }
    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
