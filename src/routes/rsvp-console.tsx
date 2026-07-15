import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/rsvp-console")({
  component: () => {
    if (typeof window !== "undefined") {
      window.location.href = "/rsvp-console.html";
    }
    return null;
  },
  loader: () => {
    throw redirect({ href: "/rsvp-console.html" });
  },
});
