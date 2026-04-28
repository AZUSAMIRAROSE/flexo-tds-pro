import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { 
  Activity, 
  PlusCircle, 
  CheckCircle2, 
  FileText, 
  AlertCircle,
  ExternalLink,
  Clock
} from 'lucide-react'

interface ActivityLogEntry {
  id: string
  action: string
  timestamp: string
  userName: string
  orderNumber?: string
  tdsId?: string
}

interface DashboardActivityFeedProps {
  activities: ActivityLogEntry[]
}

export function DashboardActivityFeed({ activities }: DashboardActivityFeedProps) {
  const navigate = useNavigate()

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <PlusCircle className="h-4 w-4 text-blue-400" />
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      case 'approved': return <FileText className="h-4 w-4 text-indigo-400" />
      case 'updated': return <Activity className="h-4 w-4 text-amber-400" />
      default: return <AlertCircle className="h-4 w-4 text-slate-400" />
    }
  }

  const getActionText = (activity: ActivityLogEntry) => {
    const orderNum = activity.orderNumber ? `#${activity.orderNumber}` : 'a record'
    switch (activity.action) {
      case 'created': return `created TDS ${orderNum}`
      case 'completed': return `finalized TDS ${orderNum}`
      case 'approved': return `approved TDS ${orderNum}`
      case 'updated': return `updated ${orderNum}`
      default: return `performed an action on ${orderNum}`
    }
  }

  return (
    <Card className="border-white/5 bg-[#18181b]/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            System Activity
          </CardTitle>
          <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground border-white/5">
            Real-time
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">Recent actions across all technical logs</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar px-4 pb-4">
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div 
                  key={activity.id}
                  onClick={() => activity.tdsId && navigate(`/tds/${activity.tdsId}`)}
                  className="flex gap-4 p-3 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group border border-transparent hover:border-white/5"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-9 w-9 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-all">
                      {getActionIcon(activity.action)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">{activity.userName}</span>
                        <Badge variant="secondary" className="text-[9px] h-3.5 bg-white/[0.05] border-white/5 text-muted-foreground px-1 py-0 uppercase">
                          {activity.action}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {getActionText(activity)}
                    </p>
                    {activity.tdsId && (
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-3 w-3" />
                        View Record
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center flex flex-col items-center">
                <Activity className="h-10 w-10 text-white/5 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </Card>
  )
}
