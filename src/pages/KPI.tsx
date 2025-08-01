import { User } from "@/lib/mockData";
import { useInitiatives } from "@/hooks/useInitiatives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, DollarSign, Clock, Award, AlertTriangle } from "lucide-react";

interface KPIProps {
  user: User;
}

export default function KPI({ user }: KPIProps) {
  const { data: initiatives = [], isLoading } = useInitiatives();

  if (isLoading) {
    return <div className="p-6">Loading KPI data...</div>;
  }

  // Calculate KPIs
  const totalInitiatives = initiatives.length;
  const completedInitiatives = initiatives.filter((i: any) => i.status === 'Completed').length;
  const inProgressInitiatives = initiatives.filter((i: any) => i.status === 'In Progress').length;
  const rejectedInitiatives = initiatives.filter((i: any) => i.status === 'Rejected').length;
  const totalExpectedSavings = initiatives.reduce((sum: number, i: any) => sum + (i.expectedSavings || 0), 0);
  const completedSavings = initiatives
    .filter((i: any) => i.status === 'Completed')
    .reduce((sum: number, i: any) => sum + (i.expectedSavings || 0), 0);

  const completionRate = totalInitiatives > 0 ? (completedInitiatives / totalInitiatives) * 100 : 0;
  const savingsRealizationRate = totalExpectedSavings > 0 ? (completedSavings / totalExpectedSavings) * 100 : 0;

  // Status distribution data
  const statusData = [
    { name: 'Completed', value: completedInitiatives, color: '#22c55e' },
    { name: 'In Progress', value: inProgressInitiatives, color: '#3b82f6' },
    { name: 'Rejected', value: rejectedInitiatives, color: '#ef4444' },
    { name: 'Draft', value: initiatives.filter((i: any) => i.status === 'Draft').length, color: '#f59e0b' },
  ];

  // Site distribution
  const siteData = initiatives.reduce((acc: any, initiative: any) => {
    const site = initiative.site || 'Unknown';
    acc[site] = (acc[site] || 0) + 1;
    return acc;
  }, {});

  const siteChartData = Object.entries(siteData).map(([site, count]) => ({
    site,
    count,
  }));

  // Priority distribution
  const priorityData = initiatives.reduce((acc: any, initiative: any) => {
    const priority = initiative.priority || 'Unknown';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const priorityChartData = Object.entries(priorityData).map(([priority, count]) => ({
    priority,
    count,
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">KPI Monitoring</h1>
        <p className="text-muted-foreground">Monitor key performance indicators and initiative metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Initiatives</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInitiatives}</div>
            <p className="text-xs text-muted-foreground">
              {inProgressInitiatives} in progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpectedSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${completedSavings.toLocaleString()} realized
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Realization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savingsRealizationRate.toFixed(1)}%</div>
            <Progress value={savingsRealizationRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sites">By Sites</TabsTrigger>
          <TabsTrigger value="priority">By Priority</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Initiative Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Initiative Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {initiatives.slice(0, 5).map((initiative: any) => (
                    <div key={initiative.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{initiative.title}</p>
                        <p className="text-xs text-muted-foreground">{initiative.site}</p>
                      </div>
                      <Badge 
                        className={
                          initiative.status === 'Completed' ? 'bg-green-500' :
                          initiative.status === 'In Progress' ? 'bg-blue-500' :
                          initiative.status === 'Rejected' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }
                      >
                        {initiative.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Initiatives by Site</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={siteChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="site" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Initiatives by Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={priorityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {rejectedInitiatives > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {rejectedInitiatives} initiative(s) have been rejected and may need review or resubmission.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}