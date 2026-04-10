"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import { ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from "lucide-react";

const schema = z.object({
  parent_name: z.string().min(1, "Required"),
  children: z.array(
    z.object({
      name: z.string().min(1, "Required"),
      birth_date: z.string().min(1, "Required"),
      allergies: z.string().optional(),
    })
  ),
  pediatrician_name: z.string().optional(),
  pediatrician_phone: z.string().optional(),
  critical_allergies: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function OnboardingFamilyPage() {
  const router = useRouter();
  const [showChildren, setShowChildren] = useState(false);
  const [showPed, setShowPed] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { children: [] },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "children",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormData) => {
      await apiClient.patch("/families/me", {
        parent_name: data.parent_name,
        critical_allergies: data.critical_allergies,
      });
      for (const child of data.children) {
        await apiClient.post("/families/me/children", {
          name: child.name,
          birth_date: child.birth_date,
          allergies: child.allergies
            ? child.allergies.split(",").map((s) => s.trim())
            : [],
        });
      }
      if (data.pediatrician_name) {
        await apiClient.post("/families/me/contacts", {
          name: data.pediatrician_name,
          phone_e164: data.pediatrician_phone || "",
          relationship: "pediatrician",
        });
      }
    },
    onSuccess: () => router.push("/app/onboarding/consent"),
    onError: () => toast.error("Could not save. Try again."),
  });

  return (
    <div className="max-w-sm mx-auto space-y-6 py-8">
      <div className="text-center">
        <div className="text-sm text-gray-400 font-medium mb-4">Step 3 of 4</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tell us about your family
        </h1>
      </div>

      <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-5">
        <div className="space-y-1">
          <Label>Your name</Label>
          <Input {...register("parent_name")} placeholder="e.g. Sarah" />
          {errors.parent_name && (
            <p className="text-xs text-red-500">{errors.parent_name.message}</p>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowChildren(!showChildren)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100"
          >
            Add children ({fields.length})
            {showChildren ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {showChildren && (
            <div className="p-4 space-y-4">
              {fields.map((field, i) => (
                <div
                  key={field.id}
                  className="space-y-2 border border-gray-100 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Child {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Input {...register(`children.${i}.name`)} placeholder="Name" />
                  <Input
                    {...register(`children.${i}.birth_date`)}
                    type="date"
                    placeholder="Date of birth"
                  />
                  <Input
                    {...register(`children.${i}.allergies`)}
                    placeholder="Allergies (comma-separated, optional)"
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => append({ name: "", birth_date: "", allergies: "" })}
              >
                <Plus className="w-4 h-4" />
                Add child
              </Button>
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPed(!showPed)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100"
          >
            Add pediatrician
            {showPed ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {showPed && (
            <div className="p-4 space-y-2">
              <Input {...register("pediatrician_name")} placeholder="Pediatrician name" />
              <Input
                {...register("pediatrician_phone")}
                type="tel"
                placeholder="Phone (for medical referral drafts)"
              />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label>Critical household allergies</Label>
          <textarea
            {...register("critical_allergies")}
            rows={2}
            placeholder="e.g. Peanuts, shellfish (shared across household)"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] resize-none"
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/app/onboarding/consent")}
          >
            Skip
          </Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
