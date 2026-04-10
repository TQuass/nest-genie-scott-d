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
import { Loader2 } from "lucide-react";

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
        </a>
      </p>
    </div>
  );
}
