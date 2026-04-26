import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined, formatStr: string = 'dd-MMM-yyyy'): string {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr)
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd-MMM-yyyy HH:mm')
}

export function computeOverallResult(tests: {
  tape_test?: string | null
  flow_marks?: string | null
  flex_test?: string | null
  graphite_test?: string | null
  adhesion_test?: string | null
  rub_scuff_test?: string | null
  ink_lay_tone_check?: string | null
}): 'Pass' | 'Conditional' | 'Fail' {
  const values = Object.values(tests).filter(Boolean)
  
  if (values.length === 0) return 'Conditional'
  
  const hasFail = values.some(v => v === 'Fail')
  const allPass = values.every(v => v === 'Pass')
  
  if (hasFail) return 'Fail'
  if (allPass) return 'Pass'
  return 'Conditional'
}