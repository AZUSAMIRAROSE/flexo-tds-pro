import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import {
  Bell,
  Activity,
  CheckCircle2,
  FileText,
  AlertCircle,
  ExternalLink,
  Clock
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface ActivityLogExtended {
  id: string
  action: string
  field_name: string | null
  old_value: string | null
  new_value: string | null
  timestamp: string
  user_id: string | null
  tds_record_id: string | null
  full_name?: string
  order_number?: string
}

export function NotificationCenter() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  // Fetch recent activity with joined user and record data
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['global-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          user_roles!user_roles_user_id_fkey(full_name),
          tds_records(order_number)
        `)
        .order('timestamp', { ascending: false })
        .limit(10)

      if (error) throw error

      return (data || []).map(item => ({
        ...item,
        full_name: (item.user_roles as any)?.full_name,
        order_number: (item.tds_records as any)?.order_number
      })) as ActivityLogExtended[]
    },
    refetchInterval: 30000
  })

  const getNotificationIcon = (action: string) => {
    switch (action) {
      case 'created': return <PlusCircleIcon className="h-4 w-4 text-blue-400" />
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      case 'approved': return <FileText className="h-4 w-4 text-indigo-400" />
      case 'updated': return <Activity className="h-4 w-4 text-amber-400" />
      default: return <AlertCircle className="h-4 w-4 text-slate-400" />
    }
  }

  const formatNotificationMessage = (notif: ActivityLogExtended) => {
    const userName = notif.full_name || 'Someone'
    const orderNum = notif.order_number ? `#${notif.order_number}` : 'a record'

    switch (notif.action) {
      case 'created': return <span><strong>{userName}</strong> created TDS <strong>{orderNum}</strong></span>
      case 'completed': return <span><strong>{userName}</strong> finalized TDS <strong>{orderNum}</strong></span>
      case 'approved': return <span><strong>{userName}</strong> approved TDS <strong>{orderNum}</strong></span>
      case 'updated': return <span><strong>{userName}</strong> updated <strong>{notif.field_name || 'details'}</strong> on {orderNum}</span>
      default: return <span>Activity on <strong>{orderNum}</strong></span>
    }
  }

  const handleNotificationClick = (notif: ActivityLogExtended) => {
    setOpen(false)
    if (notif.tds_record_id) {
      navigate(`/tds/${notif.tds_record_id}`)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground relative rounded-full transition-all hover:bg-white/5 active:scale-95"
        >
          <Bell className="h-5 w-5" />
          {notifications && notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-[#09090b] animate-pulse"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 bg-[#09090b]/95 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h3 className="font-semibold text-sm tracking-tight flex items-center gap-2">
            Notification Center
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] h-4">
              Activity Feed
            </Badge>
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-[10px] text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
          >
            Clear all
          </Button>
        </div>

        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Loading Feed...</p>
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y divide-white/5">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className="p-4 hover:bg-white/[0.03] transition-colors cursor-pointer group relative"
                >
                  <div className="flex gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/10 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                        {getNotificationIcon(notif.action)}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs text-foreground/90 leading-relaxed">
                        {formatNotificationMessage(notif)}
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                        </div>
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-60 text-center p-6">
              <div className="h-12 w-12 rounded-full bg-white/[0.02] flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-medium text-foreground/50">All quiet for now</p>
              <p className="text-xs text-muted-foreground mt-1">Activities will appear here as they happen.</p>
            </div>
          )}
        </div>

        <div className="p-3 bg-white/[0.02] border-t border-white/5 text-center">
          <Button 
            variant="ghost" 
            className="w-full text-[10px] text-muted-foreground hover:bg-white/10 hover:text-foreground h-8 uppercase tracking-widest font-bold transition-all"
          >
            View All History
          </Button>
        </div>
      </DropdownMenuContent>
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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </DropdownMenu>
  )
}

function PlusCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  )
}
