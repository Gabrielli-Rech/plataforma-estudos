// src/app/layout.tsx
import "../app/globals.css";

export const metadata = {
  title: "StudyPlatform | Organização e Gamificação",
  description: "Plataforma de estudos com Pomodoro, Árvore de Habilidades e Conquistas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
} import Link from "next/link";
import {
  LayoutDashboard,
  Timer,
  BookOpen,
  GitBranch,
  Target,
  Calendar,
  Trophy,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/timer", label: "Timer Pomodoro", icon: Timer },
  { href: "/subjects", label: "Matérias e Provas", icon: BookOpen },
  { href: "/map", label: "Árvore de Estudos", icon: GitBranch },
  { href: "/goals", label: "Metas Semanais", icon: Target },
  { href: "/calendar", label: "Calendário", icon: Calendar },
  { href: "/achievements", label: "Conquistas", icon: Trophy },
  { href: "/friends", label: "Amigos", icon: Users },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-6">
        <div className="mb-8 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_12px_#6366f1]" />
          <span className="text-lg font-bold tracking-tight text-white">StudyPlatform</span>
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
              >
                <Icon className="h-4 w-4 text-indigo-400" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}