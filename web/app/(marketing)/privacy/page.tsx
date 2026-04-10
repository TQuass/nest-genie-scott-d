import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-8 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: April 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">What we collect</h2>
            <p>
              NestGenie collects your name, phone number, and any information you share
              through SMS conversations or the web companion — including details about
              your children, contacts, and daily routines. We also receive delivery
              receipts from Twilio and usage data from Google Calendar (if connected).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">How we use it</h2>
            <p>
              Your information is used solely to operate NestGenie: sending you daily
              briefings, drafting outbound messages to third-party contacts (which you
              always review before sending), and personalizing guidance to match your
              parenting philosophy. We do not sell your data to advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">MHMDA notice</h2>
            <p>
              NestGenie may process family-related information including details about
              children&apos;s behavior and routines. NestGenie is not a mental health
              service and does not provide mental health diagnoses, counseling, or treatment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Medical disclaimer</h2>
            <p>
              Nothing NestGenie says constitutes medical advice. NestGenie will always
              recommend you consult your pediatrician for medical questions. Any
              health-related content is for informational purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Data retention</h2>
            <p>
              Your data is retained while your account is active. You can export your
              data or request full deletion at any time from Settings → Privacy & Data.
              Deletion removes all family profiles, conversations, briefings, and contact
              records within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Third-party services</h2>
            <p>
              NestGenie uses Twilio for SMS delivery, AWS for infrastructure and AI
              processing, and Google Calendar (if you connect it). Each service is
              governed by its own privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact</h2>
            <p>
              For privacy questions, email{" "}
              <a href="mailto:privacy@nestgenie.com" className="text-[#2E7D32] underline">
                privacy@nestgenie.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
