"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  calendar_name: string;
}

interface CalendarStatus {
  connected: boolean;
  events: CalendarEvent[];
}

export default function CalendarPage() {
  const { data, isLoading } = useQuery<CalendarStatus>({
    queryKey: ["calendar"],
    queryFn: () => apiClient.get<CalendarStatus>("/calendar"),
    retry: false,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : !data?.connected ? (
        <div className="text-center py-16">
          <CalendarIcon className="w-10 h-10 mx-auto mb-4 text-gray-300" />
          <p className="font-medium text-gray-900 mb-2">Connect your Google Calendar</p>
          <p className="text-sm text-gray-500 mb-6">
            NestGenie reads your calendar to include events in your daily briefings.
          </p>
          <Button className="gap-2" onClick={() => window.location.href = "/api/v1/calendar/connect"}>
            <ExternalLink className="w-4 h-4" />
            Connect Google Calendar
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.events?.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <p className="font-medium text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(event.start), "MMM d · h:mm a")}
                  {event.end && ` — ${format(new Date(event.end), "h:mm a")}`}
                </p>
                <p className="text-xs text-gray-400 mt-1">{event.calendar_name}</p>
              </CardContent>
            </Card>
          ))}
          {!data.events?.length && (
            <p className="text-center text-gray-400 py-8 text-sm">No upcoming events</p>
          )}
        </div>
      )}
    </div>
  );
}
