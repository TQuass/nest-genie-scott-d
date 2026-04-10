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

async function devLogin(destination: string, router: ReturnType<typeof useRouter>) {
  await fetch("/api/dev-login", { credentials: "same-origin" });
  router.push(destination);
}

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sign in to NestGenie</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Enter your phone number and we&apos;ll text you a code.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <div className="flex gap-2">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
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
            <p className="text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
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

      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        Code valid for 10 minutes.{" "}
        <a href="/privacy" className="underline hover:text-gray-600 dark:hover:text-gray-300">
          Privacy policy
        </a>{" "}
        ·{" "}
        <a href="/terms" className="underline hover:text-gray-600 dark:hover:text-gray-300">
          Terms
        </a>
      </p>

      <div className="border border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDev(!showDev)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Dev shortcuts — bypass OTP
          </span>
          {showDev ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {showDev && (
          <div className="p-4 space-y-3 bg-amber-50/50 dark:bg-amber-950/50">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              These bypass the OTP flow and set a dev auth cookie. For development use only.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
                onClick={() => devLogin("/app", router)}
              >
                Sign in as existing user → Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
                onClick={() => devLogin("/app/onboarding", router)}
              >
                Sign up as new user → Onboarding flow
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
