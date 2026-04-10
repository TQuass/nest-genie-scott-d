"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api";
import { Loader2, Zap, ChevronDown, ChevronUp } from "lucide-react";

const schema = z.object({
  phone: z
    .string()
    .min(10, "Enter a valid US phone number")
    .regex(/^\+?1?\d{10}$/, "Enter a valid US phone number"),
});

type FormData = z.infer<typeof schema>;

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showDev, setShowDev] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const phone = data.phone.startsWith("+1")
        ? data.phone
        : `+1${data.phone.replace(/\D/g, "")}`;
      await apiClient.post("/auth/request-otp", { phone });
      sessionStorage.setItem("ng_phone", phone);
      router.push("/sign-in/verify");
    } catch {
      setError("Unable to send code. Please try again.");
      toast.error("Unable to send code. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Sign in to NestGenie</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your phone number and we&apos;ll text you a code.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <div className="flex gap-2">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              🇺🇸 +1
            </span>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 000-0000"
              className="rounded-l-none"
              {...register("phone")}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Text me a code
        </Button>
      </form>

      <p className="text-center text-xs text-gray-400">
        Code valid for 10 minutes.{" "}
        <a href="/privacy" className="underline hover:text-gray-600">
          Privacy policy
        </a>{" "}
        ·{" "}
        <a href="/terms" className="underline hover:text-gray-600">
          Terms
        </a>
      </p>

      {/* ── Dev shortcuts ──────────────────────────────────────── */}
      <div className="border border-amber-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDev(!showDev)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Dev shortcuts — bypass OTP
          </span>
          {showDev ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {showDev && (
          <div className="p-4 space-y-3 bg-amber-50/50">
            <p className="text-xs text-amber-700">
              These bypass the OTP flow and set a dev auth cookie. For development use only.
            </p>
            <div className="flex flex-col gap-2">
              <a href="/api/dev-login?redirect=/app" className="block">
                <Button variant="outline" size="sm" className="w-full border-amber-300 text-amber-800 hover:bg-amber-100">
                  Sign in as existing user → Dashboard
                </Button>
              </a>
              <a href="/api/dev-login?redirect=/app/onboarding" className="block">
                <Button variant="outline" size="sm" className="w-full border-amber-300 text-amber-800 hover:bg-amber-100">
                  Sign up as new user → Onboarding flow
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
