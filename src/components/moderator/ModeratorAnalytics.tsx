import { format } from "date-fns";
import {
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatChartData, formatPagePath } from "@/components/admin/adminconstants/analytics/adminanalytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  useAnalyticsSummary,
  useContentAnalytics,
  useDailyVisits,
  useRecentVisits,
} from "@/hooks/useAnalytics";

export function ModeratorAnalytics() {
  // Fetching slightly less data potentially, but reusing hooks is fine
  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary(30);
  const { data: dailyVisits, isLoading: dailyLoading } = useDailyVisits(30);
  const { data: recentVisits, isLoading: recentLoading } = useRecentVisits(10); // Reduced from 20
  const { data: contentAnalytics, isLoading: contentLoading } =
    useContentAnalytics();

  if (summaryLoading || dailyLoading || recentLoading || contentLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
      </div>
    );
  }

  const formattedDailyVisits = formatChartData(dailyVisits || [], format);

  return (
    <div className="max-w-full space-y-6 overflow-x-hidden pb-6">
      <div>
        <h2 className="break-words font-bold font-display text-xl md:text-2xl">
          Moderator Analytics
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Quick overview of website and content performance
        </p>
      </div>

      {/* Simplified Summary Cards - Mixed General & Content */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {/* General Stat 1 */}
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
              All time visits
            </p>
          </CardContent>
        </Card>

        {/* General Stat 2 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-xs md:text-sm">
              Daily Avg
            </CardTitle>
            <TrendingUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="break-all font-bold text-lg md:text-2xl">
              {Math.round(Number(summary?.avg_daily_visits) || 0)}
            </div>
            <p className="line-clamp-2 text-muted-foreground text-xs">
              Visits/day (30d)
            </p>
          </CardContent>
        </Card>

        {/* Content Stat 1 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-xs md:text-sm">
              Events
            </CardTitle>
            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="break-all font-bold text-lg md:text-2xl">
              {contentAnalytics?.total_events?.toLocaleString() || "0"}
            </div>
            <p className="line-clamp-2 text-muted-foreground text-xs">
              Total events created
            </p>
          </CardContent>
        </Card>

        {/* Content Stat 2 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-xs md:text-sm">
              Ministries
            </CardTitle>
            <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="break-all font-bold text-lg md:text-2xl">
              {contentAnalytics?.total_ministries?.toLocaleString() || "0"}
            </div>
            <p className="line-clamp-2 text-muted-foreground text-xs">
              Active ministries
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Main Chart - Daily Visits Only */}
        <Card className="overflow-hidden md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Daily Visits (30 Days)
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Traffic trend over the last month
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden pt-2">
            <div className="w-full">
              <ResponsiveContainer height={250} width="100%">
                <LineChart
                  data={formattedDailyVisits}
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
                  <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                  <Line
                    dataKey="total_visits"
                    dot={false}
                    name="Total Visits"
                    stroke="#8884d8"
                    strokeWidth={2}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Simplified */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Clock className="h-4 w-4" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Latest visits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[250px] space-y-2 overflow-y-auto">
              {recentVisits?.map((visit) => (
                <div
                  className="flex items-center justify-between gap-2 rounded border bg-muted/20 p-2"
                  key={visit.id}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-xs md:text-sm">
                        {formatPagePath(visit.page_path)}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-[10px] text-muted-foreground md:text-xs">
                    {format(new Date(visit.visited_at), "MMM dd, HH:mm")}
                  </div>
                </div>
              ))}
              {(!recentVisits || recentVisits.length === 0) && (
                <div className="py-4 text-center text-muted-foreground text-xs">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
