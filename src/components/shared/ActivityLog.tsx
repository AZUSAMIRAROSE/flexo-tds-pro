import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/utils'
import { Activity, Loader2 } from 'lucide-react'

interface ActivityLogEntry {
  id: string
  action: string
  field_name: string | null
  old_value: string | null
  new_value: string | null
  timestamp: string
  user_id: string | null
}

interface ActivityLogProps {
  tdsRecordId: string
}

export function ActivityLog({ tdsRecordId }: ActivityLogProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activity-log', tdsRecordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('tds_record_id', tdsRecordId)
        .order('timestamp', { ascending: false })

      if (error) throw error
      return data as ActivityLogEntry[]
    },
  })

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: 'Created TDS',
      updated: 'Updated',
      completed: 'Marked as Completed',
      approved: 'Approved',
      exported: 'Exported',
    }
    return labels[action] || action
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      created: 'text-blue-600',
      updated: 'text-amber-600',
      completed: 'text-green-600',
      approved: 'text-primary',
      exported: 'text-purple-600',
    }
    return colors[action] || 'text-muted-foreground'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <Activity className="mr-2 h-4 w-4" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities && activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-3 border-b last:border-0"
              >
                <div className={`mt-1 ${getActionColor(activity.action)}`}>
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {getActionLabel(activity.action)}
                      {activity.field_name && (
                        <span className="text-muted-foreground ml-1">
                          · {activity.field_name}
                        </span>
                      )}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(activity.timestamp)}
                    </span>
                  </div>
                  {activity.old_value && activity.new_value && (
                    <div className="text-xs text-muted-foreground">
                      <span className="line-through">{activity.old_value}</span>
                      {' → '}
                      <span className="font-medium text-foreground">
                        {activity.new_value}
                      </span>
                    </div>
                  )}
                  {activity.new_value && !activity.old_value && (
                    <div className="text-xs text-muted-foreground">
                      {activity.new_value}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              No activity recorded yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}