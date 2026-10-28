// src/services/achievements.service.ts
import { prisma } from "@/lib/prisma";
import { ProgressStatus } from "@prisma/client";

export async function checkAndUnlockAchievements(userId: number) {
  const [user, sessionStats, completedTopicsCount, existingUserAchievements, allAchievements] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { currentStreak: true, longestStreak: true },
      }),
      prisma.studySession.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: { minutes: true },
      }),
      prisma.topicProgress.count({
        where: { userId, status: ProgressStatus.COMPLETED },
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      }),
      prisma.achievement.findMany(),
    ]);

  if (!user) return [];

  const unlockedIds = new Set(existingUserAchievements.map((ua) => ua.achievementId));
  const totalSessions = sessionStats._count.id;
  const totalMinutes = sessionStats._sum.minutes ?? 0;
  const maxStreak = Math.max(user.currentStreak, user.longestStreak);

  const rules: Record<string, boolean> = {
    FIRST_SESSION: totalSessions >= 1,
    STREAK_3_DAYS: maxStreak >= 3,
    STREAK_7_DAYS: maxStreak >= 7,
    STREAK_30_DAYS: maxStreak >= 30,
    HOURS_10: totalMinutes >= 600,
    HOURS_50: totalMinutes >= 3000,
    TREE_UNLOCKER: completedTopicsCount >= 5,
  };

  const newlyUnlocked = allAchievements.filter(
    (ach) => !unlockedIds.has(ach.id) && rules[ach.code] === true
  );

  if (newlyUnlocked.length === 0) return [];

  const bonusXp = newlyUnlocked.reduce((acc, ach) => acc + ach.xpReward, 0);

  await prisma.$transaction([
    prisma.userAchievement.createMany({
      data: newlyUnlocked.map((ach) => ({
        userId,
        achievementId: ach.id,
      })),
    }),
    prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: bonusXp } },
    }),
  ]);

  return newlyUnlocked;
}