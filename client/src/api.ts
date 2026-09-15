import axios from "axios";
export const api = axios.create({ baseURL: "/api", withCredentials: true });
let token = "";
export function setToken(value: string) {
  token = value;
}
api.interceptors.request.use((c) => {
  if (token) c.headers.Authorization = `Bearer ${token}`;
  return c;
});
let refresh: Promise<any> | null = null;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const c = error.config;
    if (
      error.response?.status === 401 &&
      !c._retry &&
      !c.url.startsWith("/auth/")
    ) {
      c._retry = true;
      try {
        refresh ??= axios
          .post("/api/auth/refresh", {}, { withCredentials: true })
          .then((r) => {
            setToken(r.data.accessToken);
            return r.data;
          })
          .finally(() => {
            refresh = null;
          });
        await refresh;
        return api(c);
      } catch {
        setToken("");
        window.dispatchEvent(new Event("moa-signed-out"));
      }
    }
    return Promise.reject(error);
  },
);
export const errorMessage = (e: any) =>
  e.response?.data?.error || "Unable to connect. Please try again.";
