import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CustomSelect } from './CustomSelect'
import { useTDSFormStore } from '@/stores/tdsFormStore'
import { JOB_TYPES, SHIFT_NUMBERS, ACTION_ON_JOB } from '@/lib/constants'
import { Calendar } from 'lucide-react'

export function JobInfoSection() {
  const { formData, updateField } = useTDSFormStore()

  return (
    <div className="glass-panel border-white/5 space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]">1</div>
        <h3 className="text-lg font-bold tracking-widest text-foreground uppercase">JOB INFORMATION</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="space-y-2">
          <Label htmlFor="date">
            Date <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="date"
              type="date"
              value={formData.date || new Date().toISOString().split('T')[0]}
              onChange={(e) => updateField('date', e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order_number">
            Order Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="order_number"
            value={formData.order_number || ''}
            onChange={(e) => updateField('order_number', e.target.value)}
            placeholder="ORD-2025-0142"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="num_units">
            No. of Units <span className="text-destructive">*</span>
          </Label>
          <Input
            id="num_units"
            type="number"
            min={1}
            max={20}
            value={formData.num_units || 10}
            onChange={(e) => updateField('num_units', parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="job_type">Job Type</Label>
          <CustomSelect
            value={formData.job_type || ''}
            onChange={(value) => updateField('job_type', value)}
            options={JOB_TYPES}
            placeholder="Select job type"
            allowCustom
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="job_product_name">Job / Product Name</Label>
          <Input
            id="job_product_name"
            value={formData.job_product_name || ''}
            onChange={(e) => updateField('job_product_name', e.target.value)}
            placeholder="PET Shrink Sleeve 80µ"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="design_artwork_bromide">Design / Artwork / Bromide</Label>
          <Input
            id="design_artwork_bromide"
            value={formData.design_artwork_bromide || ''}
            onChange={(e) => updateField('design_artwork_bromide', e.target.value)}
            placeholder="AW-2024-VER3"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="operator_name">Operator Name</Label>
          <Input
            id="operator_name"
            value={formData.operator_name || ''}
            onChange={(e) => updateField('operator_name', e.target.value)}
            placeholder="Rajesh Kumar"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="speed_mpm">Speed (m/min)</Label>
          <Input
            id="speed_mpm"
            type="number"
            min={0}
            max={500}
            value={formData.speed_mpm || ''}
            onChange={(e) => updateField('speed_mpm', parseInt(e.target.value))}
            placeholder="120"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="downtime_min">Downtime (min)</Label>
          <Input
            id="downtime_min"
            type="number"
            min={0}
            max={999}
            value={formData.downtime_min || ''}
            onChange={(e) => updateField('downtime_min', parseInt(e.target.value))}
            placeholder="15"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shift_no">Shift No.</Label>
          <CustomSelect
            value={formData.shift_no || ''}
            onChange={(value) => updateField('shift_no', value)}
            options={SHIFT_NUMBERS}
            placeholder="Select shift"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="action_on_job">Action on Job</Label>
        <CustomSelect
          value={formData.action_on_job || ''}
          onChange={(value) => updateField('action_on_job', value)}
          options={ACTION_ON_JOB}
          placeholder="Select action"
          allowCustom
        />
      </div>
    </div>
  )
}