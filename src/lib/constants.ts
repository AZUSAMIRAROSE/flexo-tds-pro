export const COLORS = {
  primary: '#1F4E79',
  secondary: '#C55A11',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  batchYellow: '#FEF3C7',
} as const

export const JOB_TYPES = [
  'Conversion',
  'New Shift',
  'Custom…',
] as const

export const SHIFT_NUMBERS = ['1', '2', '3', 'General'] as const

export const ACTION_ON_JOB = [
  'Setup',
  'Production',
  'Cleanup',
  'Maintenance',
  'Custom…',
] as const

export const SUBSTRATES = [
  'PET',
  'BOPP',
  'PE',
  'Kraft',
  'Custom…',
] as const

export const SURFACE_TYPES = [
  'Corona Treated',
  'Untreated',
  'Primed',
  'Custom…',
] as const

export const TREATMENT_SIDES = ['Front', 'Back', 'Both'] as const

export const FOIL_TYPES = [
  'Hot Stamping',
  'Cold Foil',
  'None',
  'Custom…',
] as const

export const PLATE_TAPE_COLORS = [
  { value: 'Red', color: '#EF4444' },
  { value: 'Blue', color: '#3B82F6' },
  { value: 'Green', color: '#10B981' },
  { value: 'Orange', color: '#F97316' },
] as const

export const TEST_RESULTS = ['Pass', 'Fail', 'N/A'] as const

export const TDS_STATUSES = ['Draft', 'Completed', 'Approved'] as const

export const USER_ROLES = ['Admin', 'Technical Officer', 'Viewer'] as const