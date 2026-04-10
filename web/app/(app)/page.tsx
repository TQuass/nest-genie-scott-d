"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, BookOpen, Calendar, Settings, MessageSquare, ArrowRight
} from "lucide-react";

interface FamilyStatus {
  parent_name: string;
  phone_number: string;
  last_message_at: string;
  channel_health: "active" | "down";
  onboarding_complete: boolean;
}

const quickLinks = [
  { href: "/app/family", label: "Family", desc: "Manage family members & contacts", icon: Users },
  { href: "/app/briefings", label: "Briefings", desc: "View daily briefing history", icon: BookOpen },
  { href: "/app/calendar", label: "Calendar", desc: "Linked Google Calendar events", icon: Calendar },
  { href: "/app/outbound", label: "Outbound", desc: "Review AI-drafted messages", icon: MessageSquare },
  { href: "/app/settings", label: "Settings", desc: "Preferences & privacy controls", icon: Settings },
];

export default function DashboardPage() {
  const { data, isLoading } = useQuery<FamilyStatus>({
    queryKey: ["family-status"],
    queryFn: () => apiClient.get<FamilyStatus>("/families/me/status"),
    retry: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isLoading ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            `Welcome back${data?.parent_name ? `, ${data.parent_name}` : ""}!`
          )}
        </h1>
      </div>

      {data && !data.onboarding_complete && (
        <Card className="border-[#2E7D32] bg-[#f1f8f1]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-[#2E7D32]">Finish setting up your family profile</p>
              <p className="text-sm text-gray-600 mt-0.5">Complete onboarding to unlock all features.</p>
            </div>
            <Link href="/app/onboarding">
              <Button size="sm" className="shrink-0">
                Start <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Your NestGenie number</p>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {data?.phone_number || "+1 555 555 5555"}
                </p>
                {data?.last_message_at && (
                  <p className="text-xs text-gray-400 mt-1">
                    Last message: {new Date(data.last_message_at).toLocaleString()}
                  </p>
                )}
              </div>
              <Badge variant={data?.channel_health === "active" ? "default" : "destructive"}>
                {data?.channel_health === "active" ? "Active" : "Down"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="w-10 h-10 bg-[#C8E6C9] rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#2E7D32]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="text-center py-8 text-gray-400 text-sm">
        <p>Text NestGenie at <strong>+1 555 555 5555</strong> to get started</p>
      </div>
    </div>
  );
}
