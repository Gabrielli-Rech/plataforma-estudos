"use client";

import { useEffect, useState } from "react";

interface Subject {
  id: number;
  name: string;
}

export default function TimerPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSubjects(data);
          setSelectedSubject(String(data[0].id));
        }
      });
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          handleFinishSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  async function handleFinishSession() {
    if (!selectedSubject) return;
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: Number(selectedSubject),
        minutes: durationMinutes,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      const unlockedNames =
        data.unlockedAchievements?.map((a: any) => a.name).join(", ") || "";
      setFeedback(
        `+${data.xpEarned} XP ganhos! Ofensiva atual: ${data.streak} dia(s). ${
          unlockedNames ? `🏆 Conquista desbloqueada: ${unlockedNames}!` : ""
        }`
      );
    }
  }

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="mx-auto max-w-xl space-y-6 text-center">
      <h1 className="text-2xl font-bold text-white">Timer Pomodoro</h1>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">
        <div className="mb-6 text-left">
          <label className="block text-xs font-medium uppercase text-slate-400">
            Matéria da Sessão
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-white"
          >
            {subjects.length === 0 && (
              <option value="">Cadastre uma matéria primeiro em Matérias</option>
            )}
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="my-8 font-mono text-7xl font-bold tracking-wider text-indigo-400">
          {mins}:{secs}
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            disabled={!selectedSubject}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40"
          >
            {isRunning ? "Pausar" : "Iniciar Foco"}
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setSecondsLeft(durationMinutes * 60);
            }}
            className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700"
          >
            Reiniciar
          </button>
          <button
            onClick={handleFinishSession}
            disabled={!selectedSubject}
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40"
          >
            Concluir Agora (Teste)
          </button>
        </div>

        {feedback && (
          <div className="mt-6 rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-4 text-sm text-indigo-300">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}