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
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";

const RELATIONSHIPS = [
  "grandparent", "caregiver", "daycare", "coach", "teacher",
  "pediatrician", "therapist", "other",
];

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone_e164: string;
  tcpa_consent: boolean;
  consent_at?: string;
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  phone_e164: z.string().regex(/^\+?1?\d{10}$/, "Enter a valid US number").optional().or(z.literal("")),
  tcpa_consent: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const { contactId } = useParams<{ contactId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const isNew = contactId === "new";

  const { data, isLoading } = useQuery<Contact>({
    queryKey: ["contact", contactId],
    queryFn: () => apiClient.get<Contact>(`/contacts/${contactId}`),
    enabled: !isNew,
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: data
      ? { name: data.name, relationship: data.relationship, phone_e164: data.phone_e164, tcpa_consent: data.tcpa_consent }
      : { name: "", relationship: "", phone_e164: "", tcpa_consent: false },
  });

  const tcpa = watch("tcpa_consent");

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: (d: FormData) => {
      const payload = { ...d, phone_e164: d.phone_e164 ? `+1${d.phone_e164.replace(/\D/g, "").slice(-10)}` : "" };
      return isNew
        ? apiClient.post("/families/me/contacts", payload)
        : apiClient.patch(`/contacts/${contactId}`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["family"] });
      toast.success(isNew ? "Contact added!" : "Saved!");
      router.push("/app/family");
    },
    onError: () => toast.error("Could not save. Try again."),
  });

  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: () => apiClient.delete(`/contacts/${contactId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["family"] });
      toast.success("Contact removed.");
      router.push("/app/family");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? "Add contact" : isLoading ? "Loading…" : data?.name}
        </h1>
      </div>

      {isLoading && !isNew ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : (
        <form onSubmit={handleSubmit((d) => save(d))} className="space-y-4">
          <div className="space-y-1">
            <Label>Full name</Label>
            <Input {...register("name")} placeholder="e.g. Dr. Jane Smith" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Relationship</Label>
            <select
              {...register("relationship")}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            >
              <option value="">Select relationship…</option>
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
            {errors.relationship && <p className="text-xs text-red-500">{errors.relationship.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Phone number <span className="text-gray-400 font-normal">(for outbound messages)</span></Label>
            <Input {...register("phone_e164")} type="tel" placeholder="(555) 000-0000" />
          </div>

          <div className="rounded-lg border border-gray-200 p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">TCPA consent</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Has this contact agreed to receive messages via NestGenie on your behalf?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setValue("tcpa_consent", !tcpa)}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                  tcpa ? "bg-[#2E7D32]" : "bg-gray-200"
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${tcpa ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            {tcpa ? (
              <Badge variant="default" className="text-xs">Consent recorded</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">No consent — sending blocked</Badge>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {!isNew && (
              <Button
                type="button"
                variant="outline"
                className="gap-2 text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => { if (confirm("Remove this contact?")) del(); }}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Remove
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isNew ? "Add contact" : "Save changes"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
