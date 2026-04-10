"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";

const PHILOSOPHY_OPTIONS = [
  "Attachment", "Montessori", "Free-range", "Positive discipline",
  "Gentle parenting", "Structured", "Evidence-based", "Intuitive", "Other",
];

interface Family {
  philosophy_hints: string[];
  philosophy_notes?: string;
}

export default function PhilosophySettingsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useQuery<Family>({
    queryKey: ["family-me"],
    queryFn: () => apiClient.get<Family>("/families/me"),
  });

  useEffect(() => {
    if (data) {
      setSelected(data.philosophy_hints || []);
      setNotes(data.philosophy_notes || "");
    }
  }, [data]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      apiClient.patch("/families/me", { philosophy_hints: selected, philosophy_notes: notes }),
    onSuccess: () => toast.success("Philosophy saved!"),
    onError: () => toast.error("Could not save. Try again."),
  });

  const toggle = (val: string) =>
    setSelected((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Parenting philosophy</h1>
      </div>

      <p className="text-sm text-gray-500">
        NestGenie uses this to match its guidance to your parenting style.
      </p>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
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

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Tell us more <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. We follow a mix of Montessori and gentle parenting..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] resize-none"
            />
          </div>

          <Button className="w-full" onClick={() => mutate()} disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save
          </Button>
        </>
      )}
    </div>
  );
}
