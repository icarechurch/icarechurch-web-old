import { format } from "date-fns";
import {
  BookOpen,
  Calendar,
  CalendarDays,
  CalendarX,
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  Globe,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  useAnalyticsSummary,
  useContentAnalytics,
  useDailyVisits,
  usePagePopularity,
  useRecentVisits,
} from "@/domains/analytics/hooks/useAnalytics";
import {
  CHART_COLORS,
  createPieChartData,
  formatChartData,
  formatPagePath,
} from "@/admin/analytics/analytics.constants";

export function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary(30);
  const { data: dailyVisits, isLoading: dailyLoading } = useDailyVisits(30);
  const { data: pagePopularity, isLoading: pagesLoading } =
    usePagePopularity(30);
  const { data: recentVisits, isLoading: recentLoading } = useRecentVisits(20);
  const { data: contentAnalytics, isLoading: contentLoading } =
    useContentAnalytics();

  if (
    summaryLoading ||
    dailyLoading ||
    pagesLoading ||
    recentLoading ||
    contentLoading
  ) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
      </div>
    );
  }

  const chartData = formatChartData(dailyVisits || [], format);
  const pieChartData = createPieChartData(pagePopularity);

  return (
    <div className="max-w-full space-y-6 overflow-x-hidden pb-6">
      <div>
        <h2 className="break-words font-bold font-display text-xl md:text-2xl">
          Website Analytics
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Track your website performance and visitor insights
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-xs md:text-sm">
              Total Visits
            </CardTitle>
            <Eye className="h-4 w-4 shrink-0 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="break-all font-bold text-lg md:text-2xl">
              {summary?.total_visits?.toLocaleString() || "0"}
            </div>
            <p className="line-clamp-2 text-muted-foreground text-xs">
              All time visits to your website
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-xs md:text-sm">
              Unique Visitors
            </CardTitle>
            <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="break-all font-bold text-lg md:text-2xl">
              {summary?.unique_visitors?.toLocaleString() || "0"}
            </div>
            <p className="line-clamp-2 text-muted-foreground text-xs">
              Individual visitors tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-xs md:text-sm">
              Pages Tracked
            </CardTitle>
            <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="break-all font-bold text-lg md:text-2xl">
              {summary?.total_pages || "0"}
            </div>
            <p className="line-clamp-2 text-muted-foreground text-xs">
              Different pages visited
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-xs md:text-sm">
              Daily Average
            </CardTitle>
            <TrendingUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="break-all font-bold text-lg md:text-2xl">
              {Math.round(Number(summary?.avg_daily_visits) || 0)}
            </div>
            <p className="line-clamp-2 text-muted-foreground text-xs">
              Average visits per day (30d)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Analytics Cards */}
      <div>
        <h3 className="mb-3 font-display font-semibold text-base md:mb-4 md:text-lg">
          Content Overview
        </h3>
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-xs md:text-sm">
                Total Ministries
              </CardTitle>
              <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="break-all font-bold text-lg md:text-2xl">
                {contentAnalytics?.total_ministries?.toLocaleString() || "0"}
              </div>
              <p className="line-clamp-2 text-muted-foreground text-xs">
                Active ministries in your church
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-xs md:text-sm">
                Total Events
              </CardTitle>
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="break-all font-bold text-lg md:text-2xl">
                {contentAnalytics?.total_events?.toLocaleString() || "0"}
              </div>
              <p className="line-clamp-2 text-muted-foreground text-xs">
                All events (past and upcoming)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-xs md:text-sm">
                Scheduled Events
              </CardTitle>
              <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="break-all font-bold text-lg md:text-2xl">
                {contentAnalytics?.scheduled_events?.toLocaleString() || "0"}
              </div>
              <p className="line-clamp-2 text-muted-foreground text-xs">
                Events ready to happen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-xs md:text-sm">
                Completed Events
              </CardTitle>
              <CheckCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="break-all font-bold text-lg md:text-2xl">
                {contentAnalytics?.done_events?.toLocaleString() || "0"}
              </div>
              <p className="line-clamp-2 text-muted-foreground text-xs">
                Successfully completed events
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts and Data */}
      <Tabs
        className="space-y-4"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <div className="w-full">
          {/* Mobile View - Dropdown */}
          <div className="mb-4 w-full min-[1100px]:hidden">
            <Select onValueChange={setActiveTab} value={activeTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="pages">Page Analytics</SelectItem>
                <SelectItem value="content">Content Analytics</SelectItem>
                <SelectItem value="recent">Recent Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop View - Tabs */}
          <div className="-mx-2 hidden overflow-x-auto px-2 min-[1100px]:block">
            <TabsList className="inline-flex w-full md:w-auto">
              <TabsTrigger className="text-xs md:text-sm" value="overview">
                Overview
              </TabsTrigger>
              <TabsTrigger className="text-xs md:text-sm" value="pages">
                Page Analytics
              </TabsTrigger>
              <TabsTrigger className="text-xs md:text-sm" value="content">
                Content Analytics
              </TabsTrigger>
              <TabsTrigger className="text-xs md:text-sm" value="recent">
                Recent Activity
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  Daily Visits (Last 30 Days)
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Track your website traffic over time
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden pt-2">
                <div className="w-full">
                  <ResponsiveContainer height={250} width="100%">
                    <LineChart
                      data={chartData}
                      margin={{ left: -20, right: 10, top: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        angle={-45}
                        dataKey="date"
                        height={50}
                        interval="preserveStartEnd"
                        textAnchor="end"
                        tick={{ fontSize: 9 }}
                      />
                      <YAxis tick={{ fontSize: 9 }} width={40} />
                      <Tooltip />
                      <Legend
                        iconSize={8}
                        wrapperStyle={{ fontSize: "10px" }}
                      />
                      <Line
                        dataKey="total_visits"
                        dot={false}
                        name="Total Visits"
                        stroke="#8884d8"
                        strokeWidth={2}
                        type="monotone"
                      />
                      <Line
                        dataKey="unique_visitors"
                        dot={false}
                        name="Unique Visitors"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        type="monotone"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  Page Distribution
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Most visited pages on your website
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden pt-2">
                <div className="w-full">
                  <ResponsiveContainer height={250} width="100%">
                    <PieChart>
                      <Pie
                        cx="50%"
                        cy="50%"
                        data={pieChartData}
                        dataKey="value"
                        fill="#8884d8"
                        label={false}
                        labelLine={false}
                        outerRadius={80}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell fill={entry.color} key={`cell-${index}`} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        iconSize={8}
                        wrapperStyle={{ fontSize: "10px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                Page Performance (Last 30 Days)
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Detailed breakdown of visits per page
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="w-full">
                <ResponsiveContainer height={300} width="100%">
                  <BarChart
                    data={pagePopularity?.slice(0, 8) || []}
                    margin={{ left: -20, right: 10, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      angle={-45}
                      dataKey="page_path"
                      height={70}
                      interval={0}
                      textAnchor="end"
                      tick={{ fontSize: 9 }}
                      tickFormatter={formatPagePath}
                    />
                    <YAxis tick={{ fontSize: 9 }} width={40} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        value.toLocaleString(),
                        name === "total_visits"
                          ? "Total Visits"
                          : "Unique Visitors",
                      ]}
                      labelFormatter={(label) => formatPagePath(label)}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                    <Bar
                      dataKey="total_visits"
                      fill="#8884d8"
                      name="Total Visits"
                    />
                    <Bar
                      dataKey="unique_visitors"
                      fill="#82ca9d"
                      name="Unique Visitors"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                Top Pages Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pagePopularity?.slice(0, 10).map((page, index) => (
                  <div
                    className="flex flex-col gap-2 rounded border p-2 sm:flex-row sm:items-center sm:justify-between md:p-3"
                    key={page.page_path}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <Badge
                        className="flex h-6 w-6 shrink-0 items-center justify-center text-xs md:h-6 md:w-8"
                        variant="outline"
                      >
                        {index + 1}
                      </Badge>
                      <span className="truncate font-medium text-sm md:text-base">
                        {formatPagePath(page.page_path)}
                      </span>
                      <span className="hidden truncate text-muted-foreground text-xs md:inline md:text-sm">
                        ({page.page_path})
                      </span>
                    </div>
                    <div className="ml-8 flex shrink-0 gap-3 text-xs sm:ml-0 md:gap-4 md:text-sm">
                      <span>
                        <strong>{page.total_visits}</strong> visits
                      </span>
                      <span>
                        <strong>{page.unique_visitors}</strong> unique
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  Content Overview
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Summary of your church's content
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between rounded border bg-muted/20 p-3 md:p-4">
                    <div className="flex min-w-0 items-center gap-2 md:gap-3">
                      <BookOpen className="h-4 w-4 shrink-0 text-primary md:h-5 md:w-5" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm md:text-base">
                          Ministries
                        </div>
                        <div className="text-muted-foreground text-xs md:text-sm">
                          Active church ministries
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 font-bold text-xl md:text-2xl">
                      {contentAnalytics?.total_ministries || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded border bg-muted/20 p-3 md:p-4">
                    <div className="flex min-w-0 items-center gap-2 md:gap-3">
                      <Calendar className="h-4 w-4 shrink-0 text-primary md:h-5 md:w-5" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm md:text-base">
                          Total Events
                        </div>
                        <div className="text-muted-foreground text-xs md:text-sm">
                          All events created
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 font-bold text-xl md:text-2xl">
                      {contentAnalytics?.total_events || 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  Event Status Breakdown
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Current status of all events
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between rounded border border-blue-200 bg-blue-50 p-3 md:p-4">
                    <div className="flex min-w-0 items-center gap-2 md:gap-3">
                      <CalendarDays className="h-4 w-4 shrink-0 text-blue-600 md:h-5 md:w-5" />
                      <div className="min-w-0">
                        <div className="font-medium text-blue-800 text-sm md:text-base">
                          Scheduled Events
                        </div>
                        <div className="text-blue-600 text-xs md:text-sm">
                          Ready to happen as planned
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 font-bold text-blue-800 text-xl md:text-2xl">
                      {contentAnalytics?.scheduled_events || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded border border-yellow-200 bg-yellow-50 p-3 md:p-4">
                    <div className="flex min-w-0 items-center gap-2 md:gap-3">
                      <CalendarX className="h-4 w-4 shrink-0 text-yellow-600 md:h-5 md:w-5" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-yellow-800 md:text-base">
                          Postponed Events
                        </div>
                        <div className="text-xs text-yellow-600 md:text-sm">
                          Events that have been delayed
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 font-bold text-xl text-yellow-800 md:text-2xl">
                      {contentAnalytics?.postponed_events || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded border border-green-200 bg-green-50 p-3 md:p-4">
                    <div className="flex min-w-0 items-center gap-2 md:gap-3">
                      <CheckCircle className="h-4 w-4 shrink-0 text-green-600 md:h-5 md:w-5" />
                      <div className="min-w-0">
                        <div className="font-medium text-green-800 text-sm md:text-base">
                          Completed Events
                        </div>
                        <div className="text-green-600 text-xs md:text-sm">
                          Successfully finished events
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 font-bold text-green-800 text-xl md:text-2xl">
                      {contentAnalytics?.done_events || 0}
                    </div>
                  </div>

                  {contentAnalytics?.total_events &&
                    contentAnalytics.total_events > 0 && (
                      <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-2 md:mt-4 md:p-3">
                        <div className="space-y-1 text-gray-800 text-xs md:text-sm">
                          <div>
                            <strong>Completion Rate:</strong>{" "}
                            {Math.round(
                              (contentAnalytics.done_events /
                                contentAnalytics.total_events) *
                                100
                            )}
                            % of events have been completed
                          </div>
                          {contentAnalytics.postponed_events > 0 && (
                            <div>
                              <strong>Postponed Rate:</strong>{" "}
                              {Math.round(
                                (contentAnalytics.postponed_events /
                                  contentAnalytics.total_events) *
                                  100
                              )}
                              % of events have been postponed
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Clock className="h-4 w-4" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Live feed of recent website visits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {recentVisits?.map((visit) => (
                  <div
                    className="flex flex-col gap-2 rounded border bg-muted/20 p-2 sm:flex-row sm:items-center sm:justify-between md:p-3"
                    key={visit.id}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
                      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-sm md:text-base">
                          {formatPagePath(visit.page_path)}
                        </div>
                        <div className="text-muted-foreground text-xs md:text-sm">
                          {format(
                            new Date(visit.visited_at),
                            "MMM dd, yyyy HH:mm:ss"
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 shrink-0 text-muted-foreground text-xs sm:ml-0 md:text-sm">
                      {visit.referrer ? (
                        <span className="block max-w-[200px] truncate">
                          from {new URL(visit.referrer).hostname}
                        </span>
                      ) : (
                        <span>direct visit</span>
                      )}
                    </div>
                  </div>
                ))}
                {(!recentVisits || recentVisits.length === 0) && (
                  <div className="py-8 text-center text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
