"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, X } from "lucide-react";
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
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(false);

  const { data, isLoading } = useQuery<Briefing>({
    queryKey: ["briefing", briefingId],
    queryFn: () => apiClient.get<Briefing>(`/briefings/${briefingId}`),
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
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-4 w-full" style={{ width: `${70 + i * 5}%` }} />
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
