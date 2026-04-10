import Link from "next/link";
import { ChevronRight, Wifi, Shield, Bell, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const settingsNav = [
  {
    href: "/app/settings/connection",
    icon: Wifi,
    label: "Connection",
    desc: "SMS and email channel status",
  },
  {
    href: "/app/settings/privacy",
    icon: Shield,
    label: "Privacy & Data",
    desc: "Manage your data and consent",
  },
  {
    href: "/app/settings/notifications",
    icon: Bell,
    label: "Notifications",
    desc: "Configure briefing schedule",
  },
  {
    href: "/app/settings/philosophy",
    icon: Heart,
    label: "Parenting Philosophy",
    desc: "Tune NestGenie to your style",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <Card>
        <CardContent className="p-0">
          {settingsNav.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors ${
                  i < settingsNav.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="w-10 h-10 bg-[#C8E6C9] rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#2E7D32]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500 truncate">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
