"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, ChevronRight } from "lucide-react";

interface Child {
  id: string;
  name: string;
  birth_date: string;
  allergies?: string[];
}

interface Contact {
  id: string;
  name: string;
  relationship: string;
  tcpa_consent: boolean;
}

interface Family {
  children: Child[];
  contacts: Contact[];
}

export default function FamilyPage() {
  const { data, isLoading } = useQuery<Family>({
    queryKey: ["family"],
    queryFn: () => apiClient.get<Family>("/families/me"),
    retry: false,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Family</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : (
        <>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Children
              </h2>
              <Link href="/app/family/child/new">
                <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                  <Plus className="w-3 h-3" />
                  Add child
                </Button>
              </Link>
            </div>

            {!data?.children?.length ? (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500 mb-3">No children added yet</p>
                <Link href="/app/family/child/new">
                  <Button size="sm" className="gap-1.5">
                    <Plus className="w-3 h-3" />
                    Add your first child
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {data.children.map((child) => (
                  <Link key={child.id} href={`/app/family/child/${child.id}`}>
                    <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{child.name}</p>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {child.allergies?.map((a) => (
                              <Badge key={a} variant="destructive" className="text-xs">
                                {a}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Contacts
              </h2>
              <Link href="/app/family/contact/new">
                <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                  <Plus className="w-3 h-3" />
                  Add contact
                </Button>
              </Link>
            </div>

            {!data?.contacts?.length ? (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500 mb-3">No contacts yet</p>
                <Link href="/app/family/contact/new">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Plus className="w-3 h-3" />
                    Add contact
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {data.contacts.map((contact) => (
                  <Link key={contact.id} href={`/app/family/contact/${contact.id}`}>
                    <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-500 capitalize">{contact.relationship}</p>
                            <Badge
                              variant={contact.tcpa_consent ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {contact.tcpa_consent ? "Consent ✓" : "No consent"}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
