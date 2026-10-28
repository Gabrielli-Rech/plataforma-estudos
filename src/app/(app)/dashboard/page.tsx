import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateLevelFromXp } from "@/services/xp.service";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = Number((session.user as any).id);
  const [user, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { achievements: { include: { achievement: true } } },
    }),
    prisma.studySession.aggregate({
      where: { userId },
      _sum: { minutes: true },
      _count: { id: true },
    }),
  ]);

  if (!user) redirect("/login");

  const levelInfo = calculateLevelFromXp(user.xp);
  const totalHours = ((stats._sum.minutes ?? 0) / 60).toFixed(1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Olá, {user.name} 👋</h1>
        <p className="text-sm text-slate-400">Aqui está o progresso da sua jornada</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs uppercase text-slate-400">Nível Atual</span>
          <p className="mt-2 text-3xl font-bold text-indigo-400">Nv. {levelInfo.level}</p>
          <p className="mt-1 text-xs text-slate-400">{user.xp} XP total</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs uppercase text-slate-400">Ofensiva (Streak)</span>
          <p className="mt-2 text-3xl font-bold text-amber-400">🔥 {user.currentStreak} dias</p>
          <p className="mt-1 text-xs text-slate-400">Recorde: {user.longestStreak} dias</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs uppercase text-slate-400">Horas Estudadas</span>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{totalHours}h</p>
          <p className="mt-1 text-xs text-slate-400">{stats._count.id} sessões concluídas</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs uppercase text-slate-400">Conquistas</span>
          <p className="mt-2 text-3xl font-bold text-purple-400">{user.achievements.length}</p>
          <p className="mt-1 text-xs text-slate-400">Selos desbloqueados</p>
        </div>
      </div>
    </div>
  );
}