import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_admin/admin/")({
  component: Redir,
});
function Redir() {
  const nav = useNavigate();
  useEffect(() => { nav({ to: "/admin/dashboard", replace: true }); }, [nav]);
  return null;
}
