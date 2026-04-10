"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { differenceInYears, differenceInMonths } from "date-fns";

interface Child {
  id: string;
  name: string;
  birth_date: string;
  allergies: string[];
  school?: string;
  routines?: string;
  notes?: string;
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  birth_date: z.string().min(1, "Date of birth is required"),
  allergies: z.string().optional(),
  school: z.string().optional(),
  routines: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

function computeAge(birth_date: string) {
  const dob = new Date(birth_date);
  const years = differenceInYears(new Date(), dob);
  const months = differenceInMonths(new Date(), dob) % 12;
  if (years === 0) return `${months} months old`;
  return `${years} year${years !== 1 ? "s" : ""} old`;
}

export default function ChildProfilePage() {
  const { childId } = useParams<{ childId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const isNew = childId === "new";

  const { data, isLoading } = useQuery<Child>({
    queryKey: ["child", childId],
    queryFn: () => apiClient.get<Child>(`/children/${childId}`),
    enabled: !isNew,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: data
      ? {
          name: data.name,
          birth_date: data.birth_date,
          allergies: data.allergies?.join(", ") || "",
          school: data.school || "",
          routines: data.routines || "",
          notes: data.notes || "",
        }
      : undefined,
  });

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: (d: FormData) => {
      const payload = {
        ...d,
        allergies: d.allergies ? d.allergies.split(",").map((s) => s.trim()) : [],
      };
      return isNew
        ? apiClient.post("/families/me/children", payload)
        : apiClient.patch(`/children/${childId}`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["family"] });
      toast.success(isNew ? "Child added!" : "Saved!");
      router.push("/app/family");
    },
    onError: () => toast.error("Could not save. Try again."),
  });

  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: () => apiClient.delete(`/children/${childId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["family"] });
      toast.success("Child removed.");
      router.push("/app/family");
    },
    onError: () => toast.error("Could not delete."),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? "Add child" : isLoading ? "Loading…" : data?.name}
        </h1>
      </div>

      {isLoading && !isNew ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : (
        <form onSubmit={handleSubmit((d) => save(d))} className="space-y-4">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input {...register("name")} placeholder="Child's name" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Date of birth</Label>
            <Input {...register("birth_date")} type="date" />
            {errors.birth_date && <p className="text-xs text-red-500">{errors.birth_date.message}</p>}
            {data?.birth_date && (
              <p className="text-xs text-gray-400">{computeAge(data.birth_date)}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Allergies <span className="text-gray-400 font-normal">(comma-separated)</span></Label>
            <Input {...register("allergies")} placeholder="e.g. Peanuts, dairy" />
          </div>

          <div className="space-y-1">
            <Label>School</Label>
            <Input {...register("school")} placeholder="School name (optional)" />
          </div>

          <div className="space-y-1">
            <Label>Routines</Label>
            <textarea
              {...register("routines")}
              rows={3}
              placeholder="e.g. Bedtime at 7:30pm, no screens after 6pm..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] resize-none"
            />
          </div>

          <div className="space-y-1">
            <Label>Notes</Label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Anything else NestGenie should know..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            {!isNew && (
              <Button
                type="button"
                variant="outline"
                className="gap-2 text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => {
                  if (confirm("Remove this child?")) del();
                }}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Remove
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isNew ? "Add child" : "Save changes"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
