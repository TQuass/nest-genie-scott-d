"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { ArrowLeft, Download, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface ConsentRecord {
  consent_given: boolean;
  consent_at: string;
}

export default function PrivacyPage() {
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data, isLoading } = useQuery<ConsentRecord>({
    queryKey: ["consent"],
    queryFn: () => apiClient.get<ConsentRecord>("/families/me/consent"),
  });

  const { mutate: exportData, isPending: exporting } = useMutation({
    mutationFn: () => apiClient.post("/families/me/export", {}),
    onSuccess: () => toast.success("Export requested — download link will be emailed to you."),
    onError: () => toast.error("Could not start export. Try again."),
  });

  const { mutate: deleteAccount, isPending: deleting } = useMutation({
    mutationFn: () => apiClient.delete("/families/me"),
    onSuccess: () => {
      toast.success("Account deleted.");
      router.push("/sign-in");
    },
    onError: () => toast.error("Could not delete account. Try again."),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Privacy & Data</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2E7D32]" />
                <span className="font-semibold text-gray-900">Consent record</span>
              </div>
              <p className="text-sm text-gray-600">
                {data?.consent_given
                  ? `You gave consent on ${format(new Date(data.consent_at), "MMMM d, yyyy")}.`
                  : "No consent record found."}
              </p>
              <Link href="/privacy" className="text-sm text-[#2E7D32] underline">
                View full privacy policy
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Export my data</span>
              </div>
              <p className="text-sm text-gray-500">
                Download a JSON copy of all your family data. We&apos;ll email you a
                download link within a few minutes.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => exportData()}
                disabled={exporting}
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Request export
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-red-700">Delete all my data</span>
              </div>
              <p className="text-sm text-gray-500">
                Permanently deletes your family profile, all conversations, briefings,
                and contact records. This cannot be undone.
              </p>
              {!showDeleteDialog ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete my account
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-600">
                    Type <strong>DELETE</strong> to confirm:
                  </p>
                  <input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className="w-full h-10 rounded-md border border-red-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    placeholder="DELETE"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white"
                      disabled={deleteConfirm !== "DELETE" || deleting}
                      onClick={() => deleteAccount()}
                    >
                      {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                      Confirm delete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
