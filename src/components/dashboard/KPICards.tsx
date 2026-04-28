import { 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Settings, 
  Layers, 
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { DashboardKPIs } from '@/hooks/useDashboardData'

interface KPICardsProps {
  kpis: DashboardKPIs
}

export function KPICards({ kpis }: KPICardsProps) {
  const cards = [
    {
      label: 'Total TDS',
      value: kpis.totalTDS,
      icon: FileText,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      label: 'Created Today',
      value: kpis.tdsToday,
      icon: Calendar,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    {
      label: 'Quality Pass Rate',
      value: `${kpis.passRate}%`,
      icon: CheckCircle2,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10',
      trend: kpis.passRate >= 95 ? 'up' : 'down'
    },
    {
      label: 'Active Machines',
      value: kpis.activeMachines,
      icon: Settings,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    },
    {
      label: 'Avg Units / Job',
      value: kpis.avgUnits || '—',
      icon: Layers,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    {
      label: 'Failures (7d)',
      value: kpis.recentFailures,
      icon: AlertTriangle,
      color: kpis.recentFailures > 0 ? 'text-destructive' : 'text-slate-400',
      bg: kpis.recentFailures > 0 ? 'bg-destructive/10' : 'bg-slate-400/10'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, i) => (
        <Card key={i} className="border-white/5 bg-[#18181b]/50 backdrop-blur-sm overflow-hidden group hover:border-white/10 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              {card.trend && (
                <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter ${card.trend === 'up' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {card.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {card.trend === 'up' ? '+2.4%' : '-1.2%'}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                {card.label}
              </p>
              <h3 className="text-2xl font-bold tracking-tighter text-foreground group-hover:scale-105 transition-transform origin-left">
                {card.value}
              </h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
