import { supabase } from '@/lib/supabase'

interface LogActivityInput {
  action: string
  tdsRecordId?: string | null
  fieldName?: string | null
  oldValue?: string | null
  newValue?: string | null
}

export async function logActivity({
  action,
  tdsRecordId = null,
  fieldName = null,
  oldValue = null,
  newValue = null,
}: LogActivityInput) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.warn(`Skipping activity log for "${action}" because no authenticated user is available.`)
    return
  }

  const { error } = await supabase.from('activity_log').insert({
    tds_record_id: tdsRecordId,
    user_id: user.id,
    action,
    field_name: fieldName,
    old_value: oldValue,
    new_value: newValue,
  })

  if (error) {
    console.warn(`Failed to log activity "${action}":`, error)
  }
}
