import { WorkspaceSidebar, WorkspaceTabBar } from "@/components/workspace/workspace-nav";

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh bg-muted/40 md:grid md:grid-cols-[220px_minmax(0,1fr)] print:block print:bg-transparent">
      <WorkspaceSidebar />
      <main className="min-w-0 pt-[env(safe-area-inset-top)] pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0 print:p-0">
        {children}
      </main>
      <WorkspaceTabBar />
    </div>
  );
}
