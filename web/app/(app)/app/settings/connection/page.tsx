"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Mail, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ConnectionStatus {
  sms: {
    number: string;
    status: "active" | "down";
    last_inbound?: string;
    a2p_status: "approved" | "pending" | "rejected";
  };
  email: {
    from: string;
    status: "active" | "down";
    last_delivered?: string;
  };
}

export default function ConnectionPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery<ConnectionStatus>({
    queryKey: ["connection"],
    queryFn: () => apiClient.get<ConnectionStatus>("/families/me/connection"),
  });

  const overallHealth = data
    ? data.sms.status === "active" && data.email.status === "active"
    : null;

  const handleSignOut = async () => {
    await fetch("/api/sign-out", { method: "POST", credentials: "same-origin" });
    toast.success("Signed out");
    router.push("/sign-in");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Connection</h1>
      </div>

      {overallHealth !== null && (
        <div className={`rounded-lg px-4 py-3 flex items-center gap-2 ${overallHealth ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          <span className={`w-2 h-2 rounded-full ${overallHealth ? "bg-green-500" : "bg-red-500"}`} />
          <p className={`text-sm font-medium ${overallHealth ? "text-green-800" : "text-red-800"}`}>
            {overallHealth ? "All channels active" : "One or more channels have issues"}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#C8E6C9] rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-[#2E7D32]" />
                </div>
                <span className="font-semibold text-gray-900">SMS</span>
                <Badge variant={data?.sms.status === "active" ? "default" : "destructive"}>
                  {data?.sms.status}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="text-gray-400">Number:</span> {data?.sms.number}</p>
                <p><span className="text-gray-400">A2P status:</span>{" "}
                  <span className={data?.sms.a2p_status === "approved" ? "text-green-600" : "text-yellow-600"}>
                    {data?.sms.a2p_status}
                  </span>
                </p>
                {data?.sms.last_inbound && (
                  <p><span className="text-gray-400">Last inbound:</span> {new Date(data.sms.last_inbound).toLocaleString()}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#C8E6C9] rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#2E7D32]" />
                </div>
                <span className="font-semibold text-gray-900">Email</span>
                <Badge variant={data?.email.status === "active" ? "default" : "destructive"}>
                  {data?.email.status}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="text-gray-400">From:</span> {data?.email.from}</p>
                {data?.email.last_delivered && (
                  <p><span className="text-gray-400">Last delivered:</span> {new Date(data.email.last_delivered).toLocaleString()}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-center text-gray-400">
            <Link href="/sms-terms" className="underline hover:text-gray-600">View SMS terms</Link>
          </p>

          <div className="pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
