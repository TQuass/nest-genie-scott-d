"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
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
      <h1 className="text-2xl font-bold text-gray-900">Family</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Children</h2>
            {!data?.children?.length ? (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No children added yet. Text NestGenie at <strong>+1 555 555 5555</strong></p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.children.map((child) => (
                  <Link key={child.id} href={`/app/family/child/${child.id}`}>
                    <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <p className="font-medium text-gray-900">{child.name}</p>
                        <p className="text-sm text-gray-500">
                          DOB: {new Date(child.date_of_birth).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Contacts</h2>
            {!data?.contacts?.length ? (
              <p className="text-sm text-gray-400 text-center py-4">No contacts yet.</p>
            ) : (
              <div className="space-y-2">
                {data.contacts.map((contact) => (
                  <Link key={contact.id} href={`/app/family/contact/${contact.id}`}>
                    <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.role}</p>
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
