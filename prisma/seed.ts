import { PrismaClient, Rarity } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const achievements = [
        {
            code: "FIRST_SESSION",
            name: "Primeiro Passo",
            description: "Conclua a sua primeira sessão de estudo no timer.",
            icon: "/badges/first-session.svg",
            xpReward: 50,
            rarity: Rarity.COMMON,
        },
        {
            code: "STREAK_3_DAYS",
            name: "Ritmo Inicial",
            description: "Mantenha uma sequência de estudos de 3 dias seguidos.",
            icon: "/badges/streak-3.svg",
            xpReward: 100,
            rarity: Rarity.COMMON,
        },
        {
            code: "STREAK_7_DAYS",
            name: "Imparável",
            description: "Estude durante 7 dias consecutivos sem quebrar a ofensiva.",
            icon: "/badges/streak-7.svg",
            xpReward: 250,
            rarity: Rarity.RARE,
        },
        {
            code: "STREAK_30_DAYS",
            name: "Mestre da Disciplina",
            description: "Alcance a marca histórica de 30 dias seguidos de estudo.",
            icon: "/badges/streak-30.svg",
            xpReward: 1000,
            rarity: Rarity.LEGENDARY,
        },
        {
            code: "HOURS_10",
            name: "Maratonista Bronze",
            description: "Acumule 10 horas totais de estudo registadas na plataforma.",
            icon: "/badges/hours-10.svg",
            xpReward: 200,
            rarity: Rarity.RARE,
        },
        {
            code: "HOURS_50",
            name: "Foco Absoluto",
            description: "Acumule 50 horas totais de estudo registadas.",
            icon: "/badges/hours-50.svg",
            xpReward: 500,
            rarity: Rarity.EPIC,
        },
        {
            code: "WEEKLY_GOAL_HIT",
            name: "Meta Cumprida",
            description: "Atinja 100% da sua meta semanal pela primeira vez.",
            icon: "/badges/weekly-goal.svg",
            xpReward: 150,
            rarity: Rarity.RARE,
        },
        {
            code: "TREE_UNLOCKER",
            name: "Desbravador",
            description: "Conclua 5 tópicos na árvore de estudos.",
            icon: "/badges/tree-unlocker.svg",
            xpReward: 300,
            rarity: Rarity.EPIC,
        },
    ];

    console.log("🌱 A popular catálogo de conquistas...");

    for (const item of achievements) {
        await prisma.achievement.upsert({
            where: { code: item.code },
            update: item,
            create: item,
        });
    }

    console.log(`✅ ${achievements.length} conquistas sincronizadas com sucesso!`);
}

main()
    .catch((e) => {
        console.error("❌ Erro ao executar seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });