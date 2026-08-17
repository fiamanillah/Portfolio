// apps/dashboard/src/app/(dashboard)/newsletters/components/campaign-table.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Mail,
  Users,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import type { NewsletterItem } from "@workspace/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Badge } from "@workspace/ui/components/badge";
import {
  getStatusBadge,
  CampaignActionsDropdown,
} from "./campaign-columns";

interface CampaignTableProps {
  data: NewsletterItem[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  audienceFilter: string;
  onAudienceFilterChange: (aud: string) => void;
  onRefresh: () => void;
  onSendTest: (item: NewsletterItem) => void;
  onSchedule: (item: NewsletterItem) => void;
  onSendNow: (item: NewsletterItem) => void;
  onCancel: (item: NewsletterItem) => void;
  onDuplicate: (item: NewsletterItem) => void;
  onDelete: (item: NewsletterItem) => void;
  onSync?: (item: NewsletterItem) => void;
}

export function CampaignTable({
  data,
  isLoading,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  audienceFilter,
  onAudienceFilterChange,
  onRefresh,
  onSendTest,
  onSchedule,
  onSendNow,
  onCancel,
  onDuplicate,
  onDelete,
  onSync,
}: CampaignTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const callbacks = {
    onSendTest,
    onSchedule,
    onSendNow,
    onCancel,
    onDuplicate,
    onDelete,
    onSync,
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-2.5 left-3 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search campaigns by title or subject..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8.5 pl-8 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="h-8.5 w-[130px] text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">
                All Statuses
              </SelectItem>
              <SelectItem value="DRAFT" className="text-xs">
                Draft
              </SelectItem>
              <SelectItem value="SCHEDULED" className="text-xs">
                Scheduled
              </SelectItem>
              <SelectItem value="SENDING" className="text-xs">
                Sending
              </SelectItem>
              <SelectItem value="SENT" className="text-xs">
                Sent
              </SelectItem>
              <SelectItem value="FAILED" className="text-xs">
                Failed
              </SelectItem>
              <SelectItem value="CANCELLED" className="text-xs">
                Cancelled
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Audience Filter */}
          <Select value={audienceFilter} onValueChange={onAudienceFilterChange}>
            <SelectTrigger className="h-8.5 w-[140px] text-xs">
              <SelectValue placeholder="All Audiences" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">
                All Audiences
              </SelectItem>
              <SelectItem value="ALL_SUBS" className="text-xs">
                All Subscribers
              </SelectItem>
              <SelectItem value="SEGMENT" className="text-xs">
                Segments
              </SelectItem>
              <SelectItem value="CUSTOM" className="text-xs">
                Custom Lists
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8.5 gap-1.5 text-xs"
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button asChild size="sm" className="h-8.5 gap-1.5 text-xs">
            <Link href="/newsletters/new">
              <Plus className="size-3.5" />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-border/80 bg-card/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Campaign Title &amp; Subject</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Target Audience</TableHead>
              <TableHead className="text-xs">Delivery Progress</TableHead>
              <TableHead className="text-xs">Spam Health</TableHead>
              <TableHead className="text-xs">Timing</TableHead>
              <TableHead className="text-right text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs">
                  <RefreshCw className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((item) => {
                return (
                  <TableRow key={item.id} className="hover:bg-muted/40">
                    {/* Title & Subject */}
                    <TableCell>
                      <Link
                        href={`/newsletters/${item.id}`}
                        className="group flex flex-col gap-0.5"
                      >
                        <span className="font-semibold text-xs text-foreground group-hover:text-primary">
                          {item.title}
                        </span>
                        <span className="line-clamp-1 text-[11px] text-muted-foreground">
                          {item.subject}
                        </span>
                      </Link>
                    </TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(item.status)}</TableCell>

                    {/* Target Audience */}
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {item.targetAudience}
                      </Badge>
                    </TableCell>

                    {/* Delivery Progress */}
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-mono font-medium text-foreground">
                          {item.successfulSends.toLocaleString()} /{" "}
                          {item.totalRecipients.toLocaleString()}
                        </span>
                        {item.failedSends > 0 && (
                          <span className="text-[10px] text-rose-500">
                            {item.failedSends} failed
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Spam Health */}
                    <TableCell>
                      {item.spamScore !== undefined && item.spamScore !== null ? (
                        <Badge
                          variant="outline"
                          className={`font-mono text-[10px] ${
                            item.spamScore >= 85
                              ? "text-emerald-500 border-emerald-500/30"
                              : item.spamScore >= 65
                              ? "text-amber-500 border-amber-500/30"
                              : "text-rose-500 border-rose-500/30"
                          }`}
                        >
                          {item.spamScore} / 100
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </TableCell>

                    {/* Timing */}
                    <TableCell className="text-[11px] text-muted-foreground">
                      {item.sentAt ? (
                        <div>
                          <div className="font-medium text-foreground">Sent</div>
                          <div>{new Date(item.sentAt).toLocaleDateString()}</div>
                        </div>
                      ) : item.scheduledAt ? (
                        <div>
                          <div className="font-medium text-blue-500">
                            Scheduled
                          </div>
                          <div>{new Date(item.scheduledAt).toLocaleDateString()}</div>
                        </div>
                      ) : (
                        <div>
                          <div>Created</div>
                          <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                        </div>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <CampaignActionsDropdown
                        item={item}
                        callbacks={callbacks}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-xs text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Mail className="size-6 text-muted-foreground/60" />
                    <p>No newsletter campaigns found.</p>
                    <Button asChild size="sm" variant="outline" className="text-xs">
                      <Link href="/newsletters/new">
                        <Plus className="mr-1 size-3.5" />
                        Create your first campaign
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            Showing Page {currentPage} of {totalPages} ({totalCount} total)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="h-8 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
