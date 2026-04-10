export const apiClient = {
  get: <T>(path: string) =>
    fetch(`/api/v1${path}`, { credentials: "include" }).then(
      (r) => r.json() as T
    ),
  post: <T>(path: string, body: unknown) =>
    fetch(`/api/v1${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    }).then((r) => r.json() as T),
  patch: <T>(path: string, body: unknown) =>
    fetch(`/api/v1${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    }).then((r) => r.json() as T),
  delete: (path: string) =>
    fetch(`/api/v1${path}`, { method: "DELETE", credentials: "include" }),
};
