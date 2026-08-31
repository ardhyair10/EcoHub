"use client";

import { Lock } from "lucide-react";

interface BadgeCardProps {
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
  compact?: boolean;
}

export function BadgeCard({ icon, name, description, unlocked, progress, target, compact = false }: BadgeCardProps) {
  const percentage = Math.min((progress / target) * 100, 100);

  if (compact) {
    return (
      <div
        className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all min-w-[80px] ${
          unlocked
            ? "bg-accent/10 border-accent/30 shadow-sm"
            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50"
        }`}
      >
        <span className="text-2xl">{unlocked ? icon : "🔒"}</span>
        <span className={`text-xs font-bold text-center leading-tight ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
          {name}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
        unlocked
          ? "bg-accent/5 border-accent/20 shadow-sm"
          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
      }`}
    >
      <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-2xl ${
        unlocked ? "bg-accent/10" : "bg-slate-200 dark:bg-slate-700"
      }`}>
        {unlocked ? icon : <Lock className="h-5 w-5 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        {!unlocked && (
          <div className="mt-2">
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{progress} / {target}</p>
          </div>
        )}
      </div>
      {unlocked && (
        <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-full">✓ Diraih</span>
      )}
    </div>
  );
}

export default BadgeCard;
