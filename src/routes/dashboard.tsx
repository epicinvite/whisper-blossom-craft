import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  ssr: false,
});

function DashboardPage() {
  useEffect(() => {
    // Load the real dashboard.html into a container div
    const container = document.getElementById("dashboard-container");
    if (!container) return;

    fetch("/dashboard.html")
      .then((res) => res.text())
      .then((html) => {
        // Extract content between <body> tags
        const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        if (!match) {
          container.innerHTML = '<p style="color:red;">Failed to load dashboard.</p>';
          return;
        }
        container.innerHTML = match[1];

        // Re-run any inline <script> tags
        container.querySelectorAll("script").forEach((oldScript) => {
          const newScript = document.createElement("script");
          newScript.textContent = oldScript.textContent;
          oldScript.parentNode?.replaceChild(newScript, oldScript);
        });

        // Load dashboard.html CSS into document head
        const cssMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
        if (cssMatch) {
          cssMatch.forEach((styleTag) => {
            const styleEl = document.createElement("style");
            styleEl.textContent = styleTag.replace(/<\/?style[^>]*>/gi, "");
            document.head.appendChild(styleEl);
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load dashboard:", err);
        container.innerHTML = '<p style="color:red;">Dashboard failed to load.</p>';
      });
  }, []);

  return <div id="dashboard-container" />;
}
