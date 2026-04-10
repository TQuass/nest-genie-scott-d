"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, Clock, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface OutboundAction {
  id: string;
  created_at: string;
  contact_name: string;
  contact_relationship: string;
  contact_tcpa_consent: boolean;
  draft_text: string;
  status: "pending" | "sent" | "declined";
  confirmed_at?: string;
  sent_at?: string;
  declined_at?: string;
}

const STATUS_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  sent: "default",
  declined: "secondary",
};

export default function OutboundDetailPage() {
  const { actionId } = useParams<{ actionId: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<OutboundAction>({
    queryKey: ["outbound", actionId],
    queryFn: () => apiClient.get<OutboundAction>(`/outbound/${actionId}`),
  });

  const { mutate: confirm, isPending: confirming } = useMutation({
    mutationFn: () => apiClient.post(`/outbound/confirm/${actionId}`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["outbound"] });
      toast.success("Message confirmed and sent!");
      router.push("/app/outbound");
    },
    onError: () => toast.error("Could not confirm. Try again."),
  });

  const { mutate: decline, isPending: declining } = useMutation({
    mutationFn: () => apiClient.post(`/outbound/decline/${actionId}`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["outbound"] });
      toast.info("Message declined.");
      router.push("/app/outbound");
    },
  });

  const timeline = data
    ? [
        { label: "Queued", at: data.created_at, icon: Clock },
        ...(data.confirmed_at
          ? [{ label: "Approved by you", at: data.confirmed_at, icon: Check }]
          : []),
        ...(data.sent_at
          ? [{ label: "Sent to contact", at: data.sent_at, icon: Send }]
          : []),
        ...(data.declined_at
          ? [{ label: "Declined", at: data.declined_at, icon: X }]
          : []),
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          {isLoading ? (
            <Skeleton className="h-6 w-40" />
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">
                To: {data?.contact_name}
              </h1>
              {data && (
                <Badge variant={STATUS_COLOR[data.status]}>
                  {data.status}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : (
        <>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              AI-drafted message
            </p>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {data?.draft_text}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Contact</p>
            <p className="text-sm text-gray-900 font-medium">{data?.contact_name}</p>
            <p className="text-sm text-gray-500 capitalize">{data?.contact_relationship}</p>
            {data && !data.contact_tcpa_consent && (
              <Badge variant="destructive" className="text-xs">No TCPA consent — sending blocked</Badge>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Timeline</p>
            {timeline.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#C8E6C9] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-[#2E7D32]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{step.label}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(step.at), "MMM d, yyyy · h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {data?.status === "pending" && data.contact_tcpa_consent && (
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 gap-2 text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => decline()}
                disabled={declining}
              >
                {declining ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Decline
              </Button>
              <Button className="flex-1 gap-2" onClick={() => confirm()} disabled={confirming}>
                {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Approve & Send
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
