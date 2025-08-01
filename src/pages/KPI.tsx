import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign,
  Factory,
  Zap,
  Droplets,
  Leaf,
  Clock,
  Filter,
  Download
} from "lucide-react";

const kpiData = {
  financial: [
    {
      metric: "Annual Savings",
      current: "₹45.2L",
      target: "₹50L", 
      progress: 90.4,
      trend: "+15%",
      status: "On Track"
    },
    {
      metric: "CAPEX Utilization",
      current: "₹28.5L",
      target: "₹35L",
      progress: 81.4,
      trend: "+8%", 
      status: "Good"
    },
    {
      metric: "ROI Achievement",
      current: "18.5%",
      target: "20%",
      progress: 92.5,
      trend: "+3%",
      status: "Excellent"
    }
  ],
  operational: [
    {
      metric: "Productivity Gain",
      current: "12.8 MT/manhour",
      target: "15 MT/manhour",
      progress: 85.3,
      trend: "+22%",
      status: "On Track",
      unit: "MT/manhour"
    },
    {
      metric: "Cycle Time Reduction",
      current: "18%",
      target: "25%",
      progress: 72,
      trend: "+5%",
      status: "Behind",
      unit: "%"
    },
    {
      metric: "Waste Reduction",
      current: "8.5%",
      target: "12%",
      progress: 70.8,
      trend: "+12%",
      status: "Behind", 
      unit: "%"
    }
  ],
  utilities: [
    {
      metric: "Energy Saved",
      current: "450 MWh",
      target: "600 MWh",
      progress: 75,
      trend: "+28%",
      status: "Good",
      unit: "MWh"
    },
    {
      metric: "Water Conservation",
      current: "2.8 KL",
      target: "4.0 KL", 
      progress: 70,
      trend: "+18%",
      status: "Behind",
      unit: "KL"
    },
    {
      metric: "CO₂ Reduction",
      current: "125 eCO₂/MT",
      target: "150 eCO₂/MT",
      progress: 83.3,
      trend: "+35%",
      status: "Excellent",
      unit: "eCO₂/MT"
    }
  ]
};

const initiatives = [
  {
    id: "NDS/25/OP/AB/001",
    title: "Energy Optimization in Reactor Unit",
    site: "NDS",
    status: "On Time",
    completion: 65,
    savings: "₹8.5L",
    kpis: {
      energySaved: "120 MWh",
      productivity: "+15%",
      waste: "-8%"
    }
  },
  {
    id: "HSD1/25/EG/CD/002", 
    title: "Downtime Reduction Initiative",
    site: "HSD1",
    status: "Ahead",
    completion: 80,
    savings: "₹12.3L",
    kpis: {
      cycleTime: "-22%",
      productivity: "+18%",
      maintenance: "-30%"
    }
  },
  {
    id: "APL/25/QA/EF/003",
    title: "Quality Control Enhancement", 
    site: "APL",
    status: "Behind",
    completion: 45,
    savings: "₹6.7L",
    kpis: {
      defectRate: "-12%",
      rework: "-25%",
      customer: "+8%"
    }
  }
];

export default function KPI() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("monthly");
  const [selectedSite, setSelectedSite] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Excellent": return "bg-success text-success-foreground";
      case "Good": return "bg-primary text-primary-foreground";
      case "On Track": return "bg-primary text-primary-foreground";
      case "Behind": return "bg-warning text-warning-foreground";
      case "Critical": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "bg-success";
    if (progress >= 70) return "bg-primary";
    if (progress >= 50) return "bg-warning";
    return "bg-destructive";
  };

  const getCompletionStatusColor = (status: string) => {
    switch (status) {
      case "On Time": return "bg-success text-success-foreground";
      case "Ahead": return "bg-primary text-primary-foreground";
      case "Behind": return "bg-warning text-warning-foreground";
      case "Critical": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KPI Monitoring</h1>
          <p className="text-muted-foreground">Track key performance indicators and initiative outcomes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                <SelectItem value="NDS">NDS</SelectItem>
                <SelectItem value="HSD1">HSD1</SelectItem>
                <SelectItem value="HSD2">HSD2</SelectItem>
                <SelectItem value="APL">APL</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">KPI Overview</TabsTrigger>
          <TabsTrigger value="initiatives">Initiative Performance</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial KPIs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-success" />
                Financial KPIs
              </CardTitle>
              <CardDescription>Track financial performance and savings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {kpiData.financial.map((kpi, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{kpi.metric}</h4>
                      <Badge className={getStatusColor(kpi.status)}>
                        {kpi.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Current: <strong>{kpi.current}</strong></span>
                        <span>Target: <strong>{kpi.target}</strong></span>
                      </div>
                      
                      <Progress 
                        value={kpi.progress} 
                        className={`h-2 ${getProgressColor(kpi.progress)}`}
                      />
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{kpi.progress.toFixed(1)}% achieved</span>
                        <span className="text-success flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {kpi.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Operational KPIs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-primary" />
                Operational KPIs
              </CardTitle>
              <CardDescription>Monitor operational efficiency and productivity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {kpiData.operational.map((kpi, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{kpi.metric}</h4>
                      <Badge className={getStatusColor(kpi.status)}>
                        {kpi.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Current: <strong>{kpi.current}</strong></span>
                        <span>Target: <strong>{kpi.target}</strong></span>
                      </div>
                      
                      <Progress 
                        value={kpi.progress} 
                        className={`h-2 ${getProgressColor(kpi.progress)}`}
                      />
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{kpi.progress.toFixed(1)}% achieved</span>
                        <span className="text-success flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {kpi.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Utilities & Environment KPIs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-success" />
                Utilities & Environmental KPIs
              </CardTitle>
              <CardDescription>Track resource utilization and environmental impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {kpiData.utilities.map((kpi, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{kpi.metric}</h4>
                      <Badge className={getStatusColor(kpi.status)}>
                        {kpi.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Current: <strong>{kpi.current}</strong></span>
                        <span>Target: <strong>{kpi.target}</strong></span>
                      </div>
                      
                      <Progress 
                        value={kpi.progress} 
                        className={`h-2 ${getProgressColor(kpi.progress)}`}
                      />
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{kpi.progress.toFixed(1)}% achieved</span>
                        <span className="text-success flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {kpi.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="initiatives" className="space-y-4">
          {/* Initiative Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Initiative Performance Tracking
              </CardTitle>
              <CardDescription>Monitor individual initiative performance and KPIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {initiatives.map((initiative) => (
                  <div key={initiative.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{initiative.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {initiative.id} | Site: {initiative.site}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCompletionStatusColor(initiative.status)}>
                          {initiative.status}
                        </Badge>
                        <Badge variant="outline">
                          {initiative.completion}% Complete
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Progress</h5>
                        <Progress value={initiative.completion} className="h-2" />
                        <p className="text-xs text-muted-foreground">{initiative.completion}% complete</p>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Expected Savings</h5>
                        <p className="text-lg font-bold text-success">{initiative.savings}</p>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Key Metrics</h5>
                        <div className="space-y-1">
                          {Object.entries(initiative.kpis).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between text-xs">
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="font-semibold">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trend Analysis
              </CardTitle>
              <CardDescription>Analyze KPI trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Placeholder for charts - In real implementation, you'd use chart libraries */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-4">Savings Trend (Monthly)</h4>
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                        <p>Chart: Monthly savings progression</p>
                        <p className="text-xs">Jan: ₹8L → Feb: ₹12L → Mar: ₹18L</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-4">Productivity Improvement</h4>
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Factory className="h-12 w-12 mx-auto mb-2" />
                        <p>Chart: Productivity metrics over time</p>
                        <p className="text-xs">Avg improvement: +15% per quarter</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-4">Energy & Utilities</h4>
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Zap className="h-12 w-12 mx-auto mb-2" />
                        <p>Chart: Energy savings trend</p>
                        <p className="text-xs">Total saved: 450 MWh this quarter</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-4">Environmental Impact</h4>
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Leaf className="h-12 w-12 mx-auto mb-2" />
                        <p>Chart: CO₂ reduction over time</p>
                        <p className="text-xs">125 eCO₂/MT reduction achieved</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}