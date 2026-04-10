"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Briefing {
  id: string;
  created_at: string;
  channel: "sms" | "email";
  body: string;
  medical_flag: boolean;
}

function MedicalDisclaimerModal({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Medical content</h2>
            <p className="text-sm text-gray-500 mt-1">
              This briefing contains health-related information. NestGenie is not a
              medical provider. Always consult your pediatrician for medical questions.
            </p>
          </div>
        </div>
        <Button className="w-full" onClick={onDismiss}>
          I understand, show briefing
        </Button>
      </div>
    </div>
  );
}

export default function BriefingDetailPage() {
  const { briefingId } = useParams<{ briefingId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, isLoading } = useQuery<Briefing>({
    queryKey: ["briefing", briefingId],
    queryFn: () => apiClient.get<Briefing>(`/briefings/${briefingId}`),
  });

  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: () => apiClient.delete(`/briefings/${briefingId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["briefings"] });
      toast.success("Briefing deleted.");
      router.push("/app/briefings");
    },
    onError: () => toast.error("Could not delete. Try again."),
  });

  const showDisclaimer = data?.medical_flag && !disclaimerDismissed;

  return (
    <div className="space-y-6">
      {showDisclaimer && (
        <MedicalDisclaimerModal onDismiss={() => setDisclaimerDismissed(true)} />
      )}

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <Skeleton className="h-6 w-40" />
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-gray-900">
                {data && format(new Date(data.created_at), "MMMM d, yyyy")}
              </h1>
              {data && (
                <Badge variant="secondary" className="uppercase text-xs">
                  {data.channel}
                </Badge>
              )}
              {data?.medical_flag && (
                <Badge variant="destructive" className="text-xs">Medical</Badge>
              )}
            </div>
          )}
        </div>
        {!isLoading && data && (
          !confirmDelete ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-red-500 shrink-0"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-red-600 font-medium">Delete?</span>
              <Button
                size="sm"
                className="h-7 text-xs bg-red-500 hover:bg-red-600"
                onClick={() => del()}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setConfirmDelete(false)}
              >
                No
              </Button>
            </div>
          )
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-4" style={{ width: `${70 + i * 5}%` }} />
          ))}
        </div>
      ) : (
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {data?.body || "No content available."}
        </div>
      )}
    </div>
  );
}
