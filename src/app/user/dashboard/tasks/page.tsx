"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  RESUME_TASK_CREDIT_COST,
  type ResumeAgentTask,
} from "@/schemas/resumeAgentSchema";

type TaskCard = {
  key: ResumeAgentTask;
  title: string;
  value: string;
};

const TASKS: TaskCard[] = [
  {
    key: "full_resume_analysis",
    title: "Full Resume Analysis",
    value: "Parsing, ATS score, and suggestions.",
  },
];

const TaskSelectionPage: React.FC = () => {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<ResumeAgentTask>("full_resume_analysis");

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-rose-500/10 bg-background/70 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="border border-rose-500/20 bg-white/5 hover:bg-white/10" />
            <div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">Select Analysis Task</h1>
              <p className="text-sm text-foreground/65">Choose what you want to run before moving to analysis input.</p>
            </div>
          </div>

          <Button
            type="button"
            className="gradient-accent border-0 text-white"
            onClick={() => router.push(`/user/dashboard/analyze?task=${selectedTask}`)}
          >
            Continue to Analyze
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        <section>
          <article className="glow-card rounded-xl border border-rose-500/20 bg-white/5 p-5">
            <div className="mb-4">
              <p className="text-sm text-foreground/65">Frontend-only selection step.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {TASKS.map((task) => {
                const isSelected = selectedTask === task.key;
                return (
                  <button
                    key={task.key}
                    type="button"
                    onClick={() => setSelectedTask(task.key)}
                    className={[
                      "rounded-lg border p-4 text-left transition",
                      isSelected
                        ? "border-rose-400/45 bg-rose-500/10"
                        : "border-rose-500/15 bg-black/20 hover:bg-black/30",
                    ].join(" ")}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-medium text-foreground">{task.title}</p>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-rose-200" />}
                    </div>
                    <p className="text-xs text-foreground/65">{task.value}</p>
                    <p className="mt-2 text-sm text-rose-200">{RESUME_TASK_CREDIT_COST[task.key]} credits</p>
                  </button>
                );
              })}
            </div>
          </article>
        </section>
      </main>
    </>
  );
};

export default TaskSelectionPage;
