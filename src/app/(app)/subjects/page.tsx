// src/app/api/subjects/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const userId = Number((session.user as any).id);
  const subjects = await prisma.subject.findMany({
    where: { userId },
    include: { exams: true, topics: true, _count: { select: { sessions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(subjects);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const userId = Number((session.user as any).id);
  const { name, color } = await request.json();

  if (!name) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });

  const subject = await prisma.subject.create({
    data: {
      userId,
      name,
      color: color || "#6366f1",
    },
  });

  return NextResponse.json(subject, { status: 201 });
}

"use client";

import { useEffect, useState } from "react";

interface Subject {
  id: number;
  name: string;
  color: string;
  _count?: { sessions: number };
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");

  async function loadSubjects() {
    const res = await fetch("/api/subjects");
    if (res.ok) setSubjects(await res.json());
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    if (res.ok) {
      setName("");
      loadSubjects();
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Matérias e Provas</h1>
        <p className="text-sm text-slate-400">Cadastre as disciplinas para vincular ao Pomodoro</p>
      </div>

      <form
        onSubmit={handleCreate}
        className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5"
      >
        <div className="flex-1">
          <label className="block text-xs font-medium uppercase text-slate-400">
            Nome da Matéria
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Estrutura de Dados, Banco de Dados..."
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase text-slate-400">Cor</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 h-10 w-16 cursor-pointer rounded border border-slate-700 bg-slate-800 p-1"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Adicionar Matéria
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: sub.color }}
              />
              <h3 className="font-semibold text-white">{sub.name}</h3>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {sub._count?.sessions ?? 0} sessões registradas
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}