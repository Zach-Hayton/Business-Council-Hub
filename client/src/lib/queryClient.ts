import { QueryClient, type QueryFunction } from "@tanstack/react-query";
import { requestPreview, setPreviewUser } from "./demo-store";
export const setDemoUser = setPreviewUser;
export async function apiRequest(method: string, url: string, data?: unknown) {
  const result = await requestPreview(method, url, data);
  return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
}
export const getQueryFn: <T>(options: { on401: "returnNull" | "throw" }) => QueryFunction<T> =
  () =>
  async ({ queryKey }) => {
    const result = await requestPreview("GET", queryKey.join("/"));
    return structuredClone(result) as never;
  };
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: { retry: false },
  },
});
