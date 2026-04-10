"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";

interface NotifPrefs {
  briefings: { sms: boolean; email: boolean };
  reminders: { sms: boolean; email: boolean };
  outbound_confirmations: { sms: boolean; email: boolean };
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${on ? "bg-[#2E7D32]" : "bg-gray-200"}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

const NOTIF_TYPES = [
  { key: "briefings" as const, label: "Daily briefings", desc: "Morning family summary" },
  { key: "reminders" as const, label: "Reminders", desc: "Upcoming events and tasks" },
  { key: "outbound_confirmations" as const, label: "Outbound confirmations", desc: "AI-drafted messages awaiting your approval" },
];

export default function NotificationsPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery<NotifPrefs>({
    queryKey: ["notif-prefs"],
    queryFn: () => apiClient.get<NotifPrefs>("/families/me/notification-preferences"),
  });

  const [prefs, setPrefs] = useState<NotifPrefs | null>(null);
  const current = prefs || data;

  const { mutate, isPending } = useMutation({
    mutationFn: () => apiClient.patch("/families/me/notification-preferences", current),
    onSuccess: () => toast.success("Preferences saved!"),
    onError: () => toast.error("Could not save. Try again."),
  });

  const update = (type: keyof NotifPrefs, channel: "sms" | "email", val: boolean) => {
    const base = current || { briefings: { sms: true, email: true }, reminders: { sms: true, email: false }, outbound_confirmations: { sms: true, email: false } };
    setPrefs({ ...base, [type]: { ...base[type], [channel]: val } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {NOTIF_TYPES.map((t) => (
            <Card key={t.key}>
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Toggle
                      on={current?.[t.key]?.sms ?? true}
                      onChange={(v) => update(t.key, "sms", v)}
                    />
                    <span className="text-sm text-gray-700">SMS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Toggle
                      on={current?.[t.key]?.email ?? false}
                      onChange={(v) => update(t.key, "email", v)}
                    />
                    <span className="text-sm text-gray-700">Email</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <p className="text-xs text-center text-gray-400">
            Push notifications coming soon
          </p>

          <Button className="w-full" onClick={() => mutate()} disabled={isPending || !prefs}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save changes
          </Button>
        </div>
      )}
    </div>
  );
}
