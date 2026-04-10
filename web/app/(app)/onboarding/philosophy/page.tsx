"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const PHILOSOPHY_OPTIONS = [
  "Attachment",
  "Montessori",
  "Free-range",
  "Positive discipline",
  "Gentle parenting",
  "Structured",
  "Evidence-based",
  "Intuitive",
  "Other",
];

export default function OnboardingPhilosophyPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      apiClient.patch("/families/me", {
        philosophy_hints: selected,
        philosophy_notes: notes,
      }),
    onSuccess: () => router.push("/app/onboarding/family"),
    onError: () => toast.error("Could not save. Try again."),
  });

  const toggle = (val: string) =>
    setSelected((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );

  return (
    <div className="max-w-sm mx-auto space-y-8 py-8">
      <div className="text-center">
        <div className="text-sm text-gray-400 font-medium mb-4">Step 2 of 4</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          How do you like to parent?
        </h1>
        <p className="text-sm text-gray-500">
          This helps NestGenie match your style when giving guidance.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {PHILOSOPHY_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors",
              selected.includes(opt)
                ? "bg-[#2E7D32] text-white border-[#2E7D32]"
                : "bg-white text-gray-700 border-gray-200 hover:border-[#2E7D32]"
            )}
          >
            {opt}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tell us more{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. We follow a mix of Montessori and gentle parenting..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] resize-none"
        />
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/app/onboarding/family")}
        >
          Skip
        </Button>
        <Button className="flex-1" onClick={() => mutate()} disabled={isPending}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Continue
        </Button>
      </div>
    </div>
  );
}
