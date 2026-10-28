// src/app/api/sessions/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateSessionXp, calculateLevelFromXp } from "@/services/xp.service";
import { updateStreakOnSession } from "@/services/streak.service";
import { checkAndUnlockAchievements } from "@/services/achievements.service";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
        }

        const userId = Number((session.user as any).id);
        const { subjectId, topicId, minutes } = await request.json();

        if (!subjectId || !minutes || minutes <= 0) {
            return NextResponse.json(
                { error: "Selecione uma matéria e um tempo válido." },
                { status: 400 }
            );
        }

        const streakData = await updateStreakOnSession(userId);
        const xpEarned = calculateSessionXp(Number(minutes), streakData.currentStreak);

        const [studySession, updatedUser] = await prisma.$transaction([
            prisma.studySession.create({
                data: {
                    userId,
                    subjectId: Number(subjectId),
                    topicId: topicId ? Number(topicId) : null,
                    minutes: Number(minutes),
                    xpEarned,
                },
            }),
            prisma.user.update({
                where: { id: userId },
                data: { xp: { increment: xpEarned } },
                select: { xp: true },
            }),
        ]);

        const unlockedAchievements = await checkAndUnlockAchievements(userId);
        const levelInfo = calculateLevelFromXp(updatedUser.xp);

        return NextResponse.json({
            session: studySession,
            xpEarned,
            streak: streakData.currentStreak,
            levelInfo,
            unlockedAchievements,
        });
    } catch (error) {
        console.error("Erro ao salvar sessão:", error);
        return NextResponse.json({ error: "Erro interno ao salvar sessão." }, { status: 500 });
    }
}