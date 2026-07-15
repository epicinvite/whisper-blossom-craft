import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: () => {
    // Redirect to the static dashboard.html
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard.html";
    }
    return null;
  },
  loader: () => {
    throw redirect({ href: "/dashboard.html" });
  },
});
