"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader, AdminSection } from "@/components/admin/admin-ui";

export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin studio"
        title="This view could not load"
        description="The rest of the admin studio is still available. Try again, or choose another section from the navigation."
      />
      <AdminSection title="Error details">
        <div className="space-y-4 p-5">
          <p role="alert" className="text-sm text-muted">
            {error.digest ? `Reference: ${error.digest}` : "An unexpected error interrupted this view."}
          </p>
          <Button onClick={retry}>Try again</Button>
        </div>
      </AdminSection>
    </>
  );
}
