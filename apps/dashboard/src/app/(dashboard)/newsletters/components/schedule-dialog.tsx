// apps/dashboard/src/app/(dashboard)/newsletters/components/schedule-dialog.tsx
"use client";

import * as React from "react";
import { Clock, Calendar as CalendarIcon } from "lucide-react";
import { NewsletterApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { toast } from "@workspace/ui/components/sonner";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newsletterId: string;
  onScheduledSuccess: () => void;
}

export function ScheduleDialog({
  open,
  onOpenChange,
  newsletterId,
  onScheduledSuccess,
}: ScheduleDialogProps) {
  // Default to tomorrow 9:00 AM
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    // Format to YYYY-MM-DDTHH:MM for datetime-local input
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [dateTimeStr, setDateTimeStr] = React.useState(getDefaultDateTime());
  const [isScheduling, setIsScheduling] = React.useState(false);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const scheduledDate = new Date(dateTimeStr);

    if (isNaN(scheduledDate.getTime()) || scheduledDate.getTime() <= Date.now()) {
      toast.error("Invalid Schedule Time", {
        description: "Please choose a future date and time.",
      });
      return;
    }

    try {
      setIsScheduling(true);
      const res = await NewsletterApi.schedule(newsletterId, {
        scheduledAt: scheduledDate.toISOString(),
      });

      if (res.success) {
        toast.success("Campaign scheduled successfully!", {
          description: `Will broadcast on ${scheduledDate.toLocaleString()}.`,
        });
        onOpenChange(false);
        onScheduledSuccess();
      } else {
        toast.error("Scheduling failed", { description: res.error });
      }
    } catch (err: any) {
      toast.error("Error scheduling campaign", {
        description: err?.message || "An unexpected error occurred.",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSchedule}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4 text-primary" />
              <span>Schedule Campaign Broadcast</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Set a date and time for the autonomous background worker to
              dispatch this newsletter.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="sched-datetime" className="text-xs">
                Broadcast Date & Time (Local Time)
              </Label>
              <Input
                id="sched-datetime"
                type="datetime-local"
                value={dateTimeStr}
                onChange={(e) => setDateTimeStr(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="rounded-md border border-border/60 bg-muted/30 p-2.5 text-xs text-muted-foreground">
              The campaign will transition to{" "}
              <code className="font-mono text-primary">SCHEDULED</code> state.
              You can cancel or edit the schedule anytime before dispatch.
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isScheduling}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isScheduling}
              className="gap-1.5"
            >
              <Clock className="size-3.5" />
              {isScheduling ? "Scheduling..." : "Confirm Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
