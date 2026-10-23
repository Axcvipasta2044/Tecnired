import { DashboardShell } from "@/components/dashboard-shell";
import { DisplayNameEditor } from "@/components/display-name-editor";
import { requireUser } from "@/lib/auth";

export default async function ClientProfilePage() {
  const user = await requireUser("client");
  return <DashboardShell role="client" title="Mi perfil" subtitle="Actualiza tu nombre visible."><DisplayNameEditor displayName={user.displayName} /></DashboardShell>;
}
