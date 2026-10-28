// src/services/xp.service.ts

const XP_PER_MINUTE = 2;

export function calculateSessionXp(minutes: number, currentStreak: number): number {
    // Bónus de 5% por dia de streak (máximo de +50% aos 10 dias)
    const streakMultiplier = 1 + Math.min(currentStreak * 0.05, 0.5);
    return Math.round(minutes * XP_PER_MINUTE * streakMultiplier);
}

export function calculateLevelFromXp(totalXp: number) {
    // Progressão quadrática suave: Nível 1 = 0 XP, Nível 2 = 100 XP, Nível 3 = 400 XP...
    const level = Math.floor(Math.sqrt(totalXp / 100)) + 1;
    const currentLevelBaseXp = Math.pow(level - 1, 2) * 100;
    const nextLevelXp = Math.pow(level, 2) * 100;

    return {
        level,
        currentXp: totalXp,
        xpInCurrentLevel: totalXp - currentLevelBaseXp,
        xpNeededForNextLevel: nextLevelXp - currentLevelBaseXp,
        progressPercentage: Math.min(
            100,
            Math.round(((totalXp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100)
        ),
    };
}