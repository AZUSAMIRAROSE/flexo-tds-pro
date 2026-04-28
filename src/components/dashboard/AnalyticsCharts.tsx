import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { TrendData, QualityStats, MachineStats } from '@/hooks/useDashboardData'

interface AnalyticsChartsProps {
  trends: TrendData[]
  quality: QualityStats
  machines: MachineStats[]
}

export function AnalyticsCharts({ trends, quality, machines }: AnalyticsChartsProps) {
  const qualityData = [
    { name: 'Pass', value: quality.pass, color: '#10b981' },
    { name: 'Conditional', value: quality.conditional, color: '#f59e0b' },
    { name: 'Fail', value: quality.fail, color: '#ef4444' }
  ].filter(d => d.value > 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* TDS Volume Trend */}
      <Card className="col-span-full lg:col-span-2 border-white/5 bg-[#18181b]/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-tight">TDS Volume Trend</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Production output over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4, stroke: '#18181b' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quality Breakdown */}
      <Card className="border-white/5 bg-[#18181b]/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-tight">Quality Performance</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Overall result distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={qualityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {qualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-foreground">{quality.total}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {qualityData.map((d) => (
              <div key={d.name} className="flex flex-col items-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-tighter mb-1">{d.name}</span>
                <span className="text-sm font-bold" style={{ color: d.color }}>{d.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Machine Utilization */}
      <Card className="col-span-full border-white/5 bg-[#18181b]/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-tight">Machine Utilization</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Output volume per machine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machines} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={10} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {machines.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.active ? '#6366f1' : '#475569'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
