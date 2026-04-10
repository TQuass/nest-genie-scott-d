import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SmsTermsPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-8 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">SMS Terms</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: April 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Program description</h2>
            <p>
              NestGenie sends SMS messages to registered parents for the following purposes:
              daily family briefings, reminders, and confirmations for outbound AI-drafted
              messages. Message frequency varies based on your family&apos;s activity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Message and data rates</h2>
            <p>
              Message and data rates may apply. Check with your carrier for details. NestGenie
              is not responsible for carrier charges.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Opt-out</h2>
            <p>
              Reply <strong>STOP</strong> at any time to stop receiving SMS messages from
              NestGenie. You will receive a confirmation and no further messages will be sent.
              To re-enroll, reply <strong>START</strong> or update your notification preferences
              in the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Help</h2>
            <p>
              Reply <strong>HELP</strong> for assistance, or email{" "}
              <a href="mailto:support@nestgenie.com" className="text-[#2E7D32] underline">
                support@nestgenie.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">TCPA compliance</h2>
            <p>
              NestGenie obtains express written consent before sending any SMS messages to
              third-party contacts on your behalf. You must confirm TCPA consent for each
              contact before NestGenie will send messages to them.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
