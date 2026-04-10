import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function OnboardingWelcomePage() {
  return (
    <div className="max-w-sm mx-auto space-y-8 py-8 text-center">
      <div className="text-sm text-gray-400 font-medium">Step 1 of 4</div>
      <div className="w-20 h-20 bg-[#C8E6C9] rounded-2xl flex items-center justify-center mx-auto">
        <Home className="w-10 h-10 text-[#2E7D32]" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Let&apos;s set up your family
        </h1>
        <p className="text-gray-500">
          You can finish this here or text NestGenie at{" "}
          <strong>+1 555 555 5555</strong> anytime.
        </p>
      </div>
      <Link href="/app/onboarding/philosophy" className="block">
        <Button className="w-full h-12">Get started</Button>
      </Link>
    </div>
  );
}
