import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bell, Calendar, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2E7D32] rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">NestGenie</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/sign-in">
              <Button size="sm">Sign in</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-4">
              AI that keeps your family running —{" "}
              <span className="text-[#2E7D32]">just text it.</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              NestGenie is your SMS-first AI family assistant. Text it to manage
              schedules, get daily briefings, and coordinate with caregivers —
              no app required.
            </p>
            <Link href="/sign-in">
              <Button size="lg" className="gap-2">
                Sign in <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">
              No sign-up needed — your number is registered by your admin.
            </p>
          </div>
        </section>

        <section className="px-6 py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                SMS-first, family-forward
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Just text your NestGenie number — it handles the rest.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="w-12 h-12 bg-[#C8E6C9] dark:bg-[#1b5e20] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-6 h-6 text-[#2E7D32] dark:text-[#a5d6a7]" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Daily Briefings</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Morning summaries of your family&apos;s schedule, medications, and
                  upcoming events — straight to your phone.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="w-12 h-12 bg-[#C8E6C9] dark:bg-[#1b5e20] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-[#2E7D32] dark:text-[#a5d6a7]" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Outbound Assist</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  NestGenie drafts messages to pediatricians, schools, and
                  caregivers — you review, then send.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="w-12 h-12 bg-[#C8E6C9] dark:bg-[#1b5e20] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-[#2E7D32] dark:text-[#a5d6a7]" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Parenting Guidance</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ask anything — NestGenie gives you personalized, evidence-based
                  guidance tuned to your parenting philosophy.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800 px-6 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <span>&copy; {new Date().getFullYear()} NestGenie</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300">Terms of Service</Link>
            <Link href="/sms-terms" className="hover:text-gray-600 dark:hover:text-gray-300">SMS Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
