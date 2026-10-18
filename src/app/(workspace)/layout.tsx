import { WorkspaceSidebar } from "@/components/workspace-sidebar";

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="workspace">
      <WorkspaceSidebar />
      <main className="workspace-main">{children}</main>
    </div>
  );
}
