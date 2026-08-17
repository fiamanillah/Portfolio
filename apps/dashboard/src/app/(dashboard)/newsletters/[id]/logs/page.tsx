// apps/dashboard/src/app/(dashboard)/newsletters/[id]/logs/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { NewsletterApi } from "@/lib/api";
import { CampaignLogsTable } from "../../components/campaign-logs-table";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";

export default function CampaignLogsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [campaignTitle, setCampaignTitle] = React.useState<string>("");

  React.useEffect(() => {
    if (!id) return;
    NewsletterApi.getById(id).then((res) => {
      if (res.success && res.data) {
        setCampaignTitle(res.data.title);
      }
    });
  }, [id]);

  if (!id) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="icon" className="size-8">
          <Link href={`/newsletters/${id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Delivery Logs &amp; Audit Trail
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              Diagnostics
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {campaignTitle
              ? `Real-time recipient delivery tracking for "${campaignTitle}".`
              : "Real-time per-recipient email dispatch status."}
          </p>
        </div>
      </div>

      <CampaignLogsTable newsletterId={id} />
    </div>
  );
}
