import Script from "next/script";

export function ThemeScript() {
  const code = `
(() => {
  try {
    const stored = window.localStorage.getItem("tecnired-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored === "light" || stored === "dark" ? stored : systemDark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

  return <Script id="tecnired-theme-script">{code}</Script>;
}
