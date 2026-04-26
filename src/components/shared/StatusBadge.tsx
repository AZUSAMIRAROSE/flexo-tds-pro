import { Badge } from '@/components/ui/badge'
import { TDSStatus, OverallResult } from '@/types/tds.types'

interface StatusBadgeProps {
  status: TDSStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants = {
    Draft: 'draft',
    Completed: 'completed',
    Approved: 'approved',
  } as const

  return (
    <Badge variant={variants[status]} className="status-pill">
      {status}
    </Badge>
  )
}

interface QualityBadgeProps {
  result: OverallResult
}

export function QualityBadge({ result }: QualityBadgeProps) {
  const variants = {
    Pass: 'success',
    Conditional: 'warning',
    Fail: 'destructive',
  } as const

  const icons = {
    Pass: '✓',
    Conditional: '⚠',
    Fail: '✗',
  } as const

  return (
    <Badge variant={variants[result]} className="status-pill">
      <span className="mr-1">{icons[result]}</span>
      {result}
    </Badge>
  )
}