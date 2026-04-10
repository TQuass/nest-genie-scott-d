"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface OutboundAction {
  id: string;
  created_at: string;
  contact_name: string;
  draft_text: string;
  status: "pending" | "sent" | "cancelled";
}

export default function OutboundPage() {
  const { data, isLoading } = useQuery<OutboundAction[]>({
    queryKey: ["outbound"],
    queryFn: () => apiClient.get<OutboundAction[]>("/outbound"),
    retry: false,
  });

  const badgeVariant = (status: string) => {
    if (status === "sent") return "default";
    if (status === "cancelled") return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Outbound</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-4 text-gray-300" />
          <p className="font-medium">No outbound messages</p>
          <p className="text-sm mt-1">
            Text NestGenie at <strong>+1 555 555 5555</strong> to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((action) => (
            <Link key={action.id} href={`/app/outbound/${action.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 text-sm">
                          To: {action.contact_name}
                        </p>
                        <Badge variant={badgeVariant(action.status)}>
                          {action.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">{action.draft_text}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(action.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
