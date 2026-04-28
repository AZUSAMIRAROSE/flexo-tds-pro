import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/types/tds.types'

export interface DashboardKPIs {
  totalTDS: number
  tdsToday: number
  passRate: number
  activeMachines: number
  avgUnits: number
  recentFailures: number
}

export interface TrendData {
  date: string
  count: number
}

export interface QualityStats {
  pass: number
  conditional: number
  fail: number
  total: number
}

export interface MachineStats {
  name: string
  count: number
  active: boolean
}

type CountResponse = {
  count: number | null
  error: unknown
}

function readCount(response: CountResponse) {
  if (response.error) throw response.error
  return response.count ?? 0
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

async function fetchDashboardData() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const trendStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29).toISOString()

  const [
    totalResponse,
    todayResponse,
    passResponse,
    conditionalResponse,
    failResponse,
    recentFailuresResponse,
    machinesResponse,
    recentRecordsResponse,
    activityResponse,
  ] = await Promise.all([
    supabase.from('tds_records').select('id', { count: 'exact', head: true }),
    supabase.from('tds_records').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('tds_records').select('id', { count: 'exact', head: true }).eq('overall_result', 'Pass'),
    supabase.from('tds_records').select('id', { count: 'exact', head: true }).eq('overall_result', 'Conditional'),
    supabase.from('tds_records').select('id', { count: 'exact', head: true }).eq('overall_result', 'Fail'),
    supabase
      .from('tds_records')
      .select('id', { count: 'exact', head: true })
      .eq('overall_result', 'Fail')
      .gte('created_at', sevenDaysAgo),
    supabase.from('machines').select('id, machine_code, machine_name'),
    supabase.from('tds_records').select('created_at, machine_id').gte('created_at', trendStart),
    supabase
      .from('activity_log')
      .select(`
        id,
        action,
        timestamp,
        user_id,
        tds_record_id,
        tds_records(order_number)
      `)
      .order('timestamp', { ascending: false })
      .limit(10),
  ])

  const totalTDS = readCount(totalResponse)
  const tdsToday = readCount(todayResponse)
  const passCount = readCount(passResponse)
  const condCount = readCount(conditionalResponse)
  const failCount = readCount(failResponse)
  const recentFailures = readCount(recentFailuresResponse)

  if (machinesResponse.error) throw machinesResponse.error
  if (recentRecordsResponse.error) throw recentRecordsResponse.error
  if (activityResponse.error) throw activityResponse.error

  const machines = machinesResponse.data || []
  const recentRecords = recentRecordsResponse.data || []
  const activity = activityResponse.data || []

  const kpis: DashboardKPIs = {
    totalTDS,
    tdsToday,
    passRate: totalTDS > 0 ? Math.round((passCount / totalTDS) * 100) : 0,
    activeMachines: machines.length,
    avgUnits: 0,
    recentFailures,
  }

  const dateCounts = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    dateCounts.set(toDateKey(date), 0)
  }

  recentRecords.forEach((record) => {
    const dateKey = record.created_at?.slice(0, 10)
    if (dateKey && dateCounts.has(dateKey)) {
      dateCounts.set(dateKey, (dateCounts.get(dateKey) || 0) + 1)
    }
  })

  const machineMap = new Map<string, MachineStats>()
  machines.forEach((machine) => {
    machineMap.set(machine.id, {
      name: machine.machine_name || machine.machine_code,
      count: 0,
      active: true,
    })
  })

  recentRecords.forEach((record) => {
    if (!record.machine_id) return
    const stats = machineMap.get(record.machine_id)
    if (stats) stats.count += 1
  })

  const userIds = Array.from(
    new Set(activity.map((item) => item.user_id).filter(Boolean) as string[])
  )
  const fullNameByUserId = new Map<string, string>()

  if (userIds.length > 0) {
    const { data: users, error: usersError } = await supabase
      .from('user_roles')
      .select('user_id, full_name')
      .in('user_id', userIds)

    if (usersError) {
      console.warn('Unable to load dashboard activity user names:', usersError)
    } else {
      ;(users || []).forEach((user: Pick<UserRole, 'user_id' | 'full_name'>) => {
        if (user.full_name) {
          fullNameByUserId.set(user.user_id, user.full_name)
        }
      })
    }
  }

  return {
    kpis,
    trends: Array.from(dateCounts, ([date, count]) => ({ date, count })),
    qualityStats: {
      pass: passCount,
      conditional: condCount,
      fail: failCount,
      total: totalTDS,
    },
    machineStats: Array.from(machineMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    recentActivity: activity.map((item) => ({
      id: item.id,
      action: item.action,
      timestamp: item.timestamp,
      userName: item.user_id ? fullNameByUserId.get(item.user_id) || 'Someone' : 'Someone',
      orderNumber: (item.tds_records as any)?.order_number,
      tdsId: item.tds_record_id || undefined,
    })),
  }
}

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchDashboardData,
    staleTime: 2 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  })
}
