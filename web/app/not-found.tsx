import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-14 h-14 bg-[#2E7D32] rounded-2xl flex items-center justify-center mb-6">
        <MessageSquare className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-6xl font-bold text-gray-200 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Page not found</h2>
      <p className="text-sm text-gray-500 mb-8 max-w-xs">
        This page doesn&apos;t exist. You can text NestGenie anytime — the web app is just the companion.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/app">
          <Button className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go to dashboard
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Home</Button>
        </Link>
      </div>
    </div>
  );
}
