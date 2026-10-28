// src/services/streak.service.ts
import { prisma } from "@/lib/prisma";

function toDateOnlyString(date: Date): string {
    return date.toISOString().split("T")[0];
}

export async function updateStreakOnSession(userId: number, sessionDate: Date = new Date()) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            currentStreak: true,
            longestStreak: true,
            lastStudyDate: true,
            streakFreezes: true,
        },
    });

    if (!user) throw new Error("Utilizador não encontrado.");

    const todayStr = toDateOnlyString(sessionDate);
    const lastDateStr = user.lastStudyDate ? toDateOnlyString(user.lastStudyDate) : null;

    // Se já estudou hoje, mantém a sequência atual
    if (lastDateStr === todayStr) {
        return {
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
        };
    }

    let newStreak = 1;
    let freezesLeft = user.streakFreezes;

    if (lastDateStr) {
        const today = new Date(todayStr);
        const lastDate = new Date(lastDateStr);
        const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Estudou ontem: incrementa a ofensiva
            newStreak = user.currentStreak + 1;
        } else if (diffDays === 2 && freezesLeft > 0) {
            // Falhou apenas 1 dia mas tinha escudo de ofensiva
            newStreak = user.currentStreak + 1;
            freezesLeft -= 1;
        }
    }

    const newLongest = Math.max(user.longestStreak, newStreak);

    return prisma.user.update({
        where: { id: userId },
        data: {
            currentStreak: newStreak,
            longestStreak: newLongest,
            streakFreezes: freezesLeft,
            lastStudyDate: new Date(todayStr),
        },
        select: {
            currentStreak: true,
            longestStreak: true,
            streakFreezes: true,
        },
    });
}