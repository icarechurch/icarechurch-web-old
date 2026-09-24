import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  CalendarDays,
  Download,
  FileText,
  Filter,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Calendar as CalendarComponent } from "@/shared/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useToast } from "@/shared/hooks/use-toast";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import {
  useLogs,
  useClearLogs,
  useLogActionTypes,
  useLogSummary,
  logActivity,
  type LogFilters,
} from "@/domains/activity-logs/hooks/useActivityLogs";
import { LOG_ACTION_TYPES } from "@/domains/activity-logs/model/logging.types";
import {
  DATE_PRESETS,
  ITEMS_PER_PAGE,
  formatActionType,
} from "@/admin/activity-logs/logging.constants";

export function AdminLogsPage() {
  // filters state
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<LogFilters>({
    limit: ITEMS_PER_PAGE,
    offset: 0,
  });
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  // importing logs data and actions from custom hooks
  const { data: logsData, isLoading, refetch } = useLogs(filters);
  const { data: actionTypes } = useLogActionTypes();
  const { data: summary } = useLogSummary();
  const { clearLogs, isClearing } = useClearLogs();

  const logs = logsData?.logs || [];
  const totalCount = logsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const currentPage = Math.floor((filters.offset || 0) / ITEMS_PER_PAGE) + 1;

  // Apply date filter
  const handleDateRangeChange = useCallback(
    (from: Date | undefined, to: Date | undefined) => {
      setDateRange({ from, to });
      setFilters((prev) => ({
        ...prev,
        startDate: from,
        endDate: to,
        offset: 0,
      }));
    },
    []
  );

  // Apply preset date range
  const applyDatePreset = useCallback(
    (preset: (typeof DATE_PRESETS)[number]) => {
      const { start, end } = preset.getValue();
      handleDateRangeChange(start, end);
    },
    [handleDateRangeChange]
  );

  // Clear date filter
  const clearDateFilter = useCallback(() => {
    setDateRange({ from: undefined, to: undefined });
    setFilters((prev) => ({
      ...prev,
      startDate: undefined,
      endDate: undefined,
      offset: 0,
    }));
  }, []);

  // Apply action type filter
  const handleActionTypeChange = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      actionType: value === "all" ? undefined : value,
      offset: 0,
    }));
  }, []);

  // Pagination
  const goToPage = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      offset: (page - 1) * ITEMS_PER_PAGE,
    }));
  }, []);

  // Export to PDF
  const exportToPDF = useCallback(async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 15;

      // Load and add logo
      try {
        const logoResponse = await fetch("/icc logo no bg.png");
        const logoBlob = await logoResponse.blob();
        const logoUrl = URL.createObjectURL(logoBlob);
        const img = new Image();
        img.onload = () => {
          // Logo will be added, but we'll set it up in canvas conversion
        };
        img.src = logoUrl;

        // Add logo image to PDF
        doc.addImage(logoUrl, "PNG", 14, yPosition, 20, 20);
      } catch {
        // If logo fails to load, continue without it
      }

      // Header section with church info
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("I Care Center", 40, yPosition + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("The Refuge Church", 40, yPosition + 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Activity Logs Report", 40, yPosition + 18);

      yPosition += 35;

      // Divider line
      doc.setDrawColor(41, 128, 185);
      doc.line(14, yPosition, pageWidth - 14, yPosition);
      yPosition += 8;

      // Report metadata
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);

      const dateInfo = dateRange.from
        ? `${format(dateRange.from, "MMM dd, yyyy")} - ${dateRange.to ? format(dateRange.to, "MMM dd, yyyy") : "Present"}`
        : "All Dates";

      const metadataText = [
        { label: "Date Range:", value: dateInfo },
        { label: "Generated:", value: format(new Date(), "MMM dd, yyyy HH:mm") },
        { label: "Total Records:", value: totalCount.toString() },
      ];

      for (const item of metadataText) {
        doc.setFont("helvetica", "bold");
        doc.text(item.label, 14, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(item.value, 50, yPosition);
        yPosition += 6;
      }

      yPosition += 4;

      // Table
      autoTable(doc, {
        startY: yPosition,
        head: [["Date/Time", "Action", "Description", "User", "Entity"]],
        body: logs.map((log) => [
          format(new Date(log.created_at), "MMM dd, yyyy HH:mm"),
          formatActionType(log.action_type),
          log.action_description || "-",
          log.user_email || "System",
          log.entity_type ? `${log.entity_type}` : "-",
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 4,
          textColor: 0,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
          halign: "left",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: 14, right: 14 },
        didDrawPage(data: any) {
          // Add footer
          const footerY = pageHeight - 10;
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Page ${data.pageCount}`,
            pageWidth / 2,
            footerY,
            { align: "center" }
          );
          doc.text(
            "I Care Center - The Refuge Church",
            pageWidth / 2,
            pageHeight - 5,
            { align: "center" }
          );
        },
      });

      // Save
      doc.save(`activity-logs-${format(new Date(), "yyyy-MM-dd")}.pdf`);

      // Log the export action
      await logActivity(LOG_ACTION_TYPES.EXPORT_LOGS, {
        description: `Exported ${totalCount} logs to PDF`,
        metadata: { totalCount, filters },
      });

      toast({
        title: "Export Successful",
        description: "Logs have been exported to PDF.",
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Failed to export logs to PDF.",
        variant: "destructive",
      });
    }
  }, [logs, dateRange, totalCount, filters, toast]);

  // Clear all logs
  const handleClearLogs = useCallback(async () => {
    const success = await clearLogs();
    if (success) {
      // Log the clear action before clearing (this log will also be deleted)
      await logActivity(LOG_ACTION_TYPES.CLEAR_LOGS, {
        description: `Cleared ${totalCount} logs`,
        metadata: { totalCount },
      });

      toast({
        title: "Logs Cleared",
        description: "All activity logs have been deleted.",
      });
      refetch();
    } else {
      toast({
        title: "Clear Failed",
        description: "Failed to clear logs. Please try again.",
        variant: "destructive",
      });
    }
  }, [clearLogs, totalCount, toast, refetch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-2xl">Activity Logs</h2>
          <p className="text-muted-foreground">
            View and manage all application activity
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:flex">
          <Button onClick={() => refetch()} size="sm" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            disabled={logs.length === 0}
            onClick={exportToPDF}
            size="sm"
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={totalCount === 0 || isClearing}
                size="sm"
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Logs?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all{" "}
                  <strong>{totalCount}</strong> activity logs from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleClearLogs}
                >
                  Yes, Clear All Logs
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-medium text-sm">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{summary?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-medium text-sm">Action Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {Object.keys(summary?.byActionType || {}).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-medium text-sm">
              Showing Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {logs.length} of {totalCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Date Range Picker */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm">Date Range</label>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="w-full md:w-[240px] justify-start text-left font-normal"
                      variant="outline"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                            {format(dateRange.to, "MMM dd, yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "MMM dd, yyyy")
                        )
                      ) : (
                        "Select date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="border-b md:border-r p-2">
                        <div className="space-y-1">
                          {DATE_PRESETS.map((preset) => (
                            <Button
                              className="w-full justify-start"
                              key={preset.label}
                              onClick={() => applyDatePreset(preset)}
                              size="sm"
                              variant="ghost"
                            >
                              {preset.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <CalendarComponent
                        defaultMonth={dateRange.from}
                        mode="range"
                        numberOfMonths={isMobile ? 1 : 2}
                        onSelect={(range) =>
                          handleDateRangeChange(range?.from, range?.to)
                        }
                        selected={{ from: dateRange.from, to: dateRange.to }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                {(dateRange.from || dateRange.to) && (
                  <Button onClick={clearDateFilter} size="icon" variant="ghost">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Action Type Filter */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm">Action Type</label>
              <Select
                onValueChange={handleActionTypeChange}
                value={filters.actionType || "all"}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionTypes?.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatActionType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <CardDescription>
            Showing {logs.length} of {totalCount} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-2 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No logs found</p>
              <p className="text-muted-foreground text-sm">
                Activity will appear here as users interact with the
                application
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Page</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.created_at), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <span className="rounded bg-primary/10 px-2 py-1 font-medium text-primary text-xs">
                            {formatActionType(log.action_type)}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {log.action_description || "-"}
                        </TableCell>
                        <TableCell>{log.user_email || "System"}</TableCell>
                        <TableCell>
                          {log.entity_type ? (
                            <span className="text-muted-foreground text-sm">
                              {log.entity_type}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {log.page_path || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-lg border p-4 space-y-3 shadow-sm bg-card text-card-foreground">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-primary/10 px-2 py-1 font-medium text-primary text-xs">
                        {formatActionType(log.action_type)}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.created_at), "MMM dd HH:mm")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{log.action_description || "-"}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        By: {log.user_email || "System"}
                      </p>
                    </div>
                    {(log.entity_type || log.page_path) && (
                      <div className="pt-2 border-t flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                        {log.entity_type && (
                          <span>Entity: {log.entity_type}</span>
                        )}
                        {log.page_path && (
                          <span className="truncate max-w-full">Path: {log.page_path}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => goToPage(currentPage - 1)}
                      size="sm"
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      disabled={currentPage === totalPages}
                      onClick={() => goToPage(currentPage + 1)}
                      size="sm"
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
