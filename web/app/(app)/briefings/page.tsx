"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { BookOpen } from "lucide-react";

interface Briefing {
  id: string;
  created_at: string;
  summary: string;
  medical_flag: boolean;
}

export default function BriefingsPage() {
  const { data, isLoading } = useQuery<Briefing[]>({
    queryKey: ["briefings"],
    queryFn: () => apiClient.get<Briefing[]>("/briefings"),
    retry: false,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Briefings</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-4 text-gray-300" />
          <p className="font-medium">No briefings yet</p>
          <p className="text-sm mt-1">
            Text NestGenie at <strong>+1 555 555 5555</strong> to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((b) => (
            <Link key={b.id} href={`/app/briefings/${b.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-1">
                        {format(new Date(b.created_at), "MMM d, yyyy · h:mm a")}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">{b.summary}</p>
                    </div>
                    {b.medical_flag && (
                      <Badge variant="destructive" className="shrink-0">Medical</Badge>
                    )}
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
