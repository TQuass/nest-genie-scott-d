"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function OnboardingConsentPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      apiClient.patch("/families/me", { consent_given: true }),
    onSuccess: () => {
      toast.success("You're all set!");
      router.push("/app");
    },
    onError: () => toast.error("Could not save consent. Try again."),
  });

  return (
    <div className="max-w-sm mx-auto space-y-6 py-8">
      <div className="text-center">
        <div className="text-sm text-gray-400 font-medium mb-4">Step 4 of 4</div>
        <div className="w-16 h-16 bg-[#C8E6C9] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-[#2E7D32]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Before we start
        </h1>
        <p className="text-sm text-gray-500">
          Please read the summary below before using NestGenie.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-48 overflow-y-auto text-sm text-gray-600 space-y-3 leading-relaxed">
        <p>
          <strong>What NestGenie collects:</strong> Your name, phone number, and
          information you share about your family — including children&apos;s
          names, ages, allergies, and routines. We also store your SMS
          conversations with NestGenie.
        </p>
        <p>
          <strong>How it&apos;s used:</strong> This information is used to
          personalize your daily briefings, draft outbound messages to your
          contacts, and provide parenting guidance that matches your style.
        </p>
        <p>
          <strong>MHMDA notice:</strong> NestGenie may process family-related
          information. It is not a mental health service and does not provide
          mental health diagnoses or treatment.
        </p>
        <p>
          <strong>Medical disclaimer:</strong> NestGenie will always suggest you
          check with your pediatrician for medical questions. Nothing NestGenie
          says is medical advice.
        </p>
        <p>
          <strong>Your rights:</strong> You can export or delete your data at
          any time from Settings → Privacy & Data.
        </p>
        <p>
          Read our full{" "}
          <Link href="/privacy" className="text-[#2E7D32] underline">
            Privacy Policy
          </Link>{" "}
          for complete details.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#2E7D32]"
        />
        <span className="text-sm text-gray-700">
          I understand and agree to the above
        </span>
      </label>

      <Button
        className="w-full h-12"
        disabled={!agreed || isPending}
        onClick={() => mutate()}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        Finish setup
      </Button>
    </div>
  );
}
