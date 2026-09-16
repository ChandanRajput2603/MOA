import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, errorMessage } from "./api";
const Context = createContext<any>(null);
export const useApp = () => useContext(Context);
export function Provider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null),
    [ready, setReady] = useState(false),
    [theme, setThemeState] = useState(
      localStorage.getItem("moa-theme") || "system",
    ),
    [toast, setToast] = useState("");
  const notify = (s: string) => setToast(s);
  useEffect(() => {
    api
      .post("/auth/refresh")
      .then((r) => {
        setToken(r.data.accessToken);
        setUser(r.data.user);
        setThemeState(r.data.user.theme);
      })
      .catch(() => {})
      .finally(() => setReady(true));
    const out = () => setUser(null);
    window.addEventListener("moa-signed-out", out);
    return () => window.removeEventListener("moa-signed-out", out);
  }, []);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      (document.documentElement.dataset.theme =
        theme === "system" ? (media.matches ? "dark" : "light") : theme);
    apply();
    media.addEventListener("change", apply);
    localStorage.setItem("moa-theme", theme);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  useEffect(() => {
    if (user?.theme) setThemeState(user.theme);
  }, [user?.id]);
  useEffect(() => {
    document.documentElement.dataset.font =
      user?.preferences?.fontSize || "normal";
    document.documentElement.dataset.motion = user?.preferences?.reducedMotion
      ? "reduced"
      : "normal";
    document.documentElement.dataset.contrast = user?.preferences?.highContrast
      ? "high"
      : "normal";
  }, [user]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  async function setTheme(t: string) {
    setThemeState(t);
    if (user)
      try {
        const r = await api.patch("/me", { theme: t });
        setUser(r.data);
      } catch (e) {
        notify(errorMessage(e));
      }
  }
  async function logout() {
    try {
      await api.post("/auth/logout");
      setToken("");
      setUser(null);
    } catch (e) {
      notify(errorMessage(e));
    }
  }
  return (
    <Context.Provider
      value={{ user, setUser, ready, theme, setTheme, notify, logout }}
    >
      {children}
      {toast && (
        <div role="status" className="toast">
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
