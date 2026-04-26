import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTDSFormStore } from '@/stores/tdsFormStore'
import { TEST_RESULTS } from '@/lib/constants'
import { QualityBadge } from '@/components/shared/StatusBadge'
import { computeOverallResult } from '@/lib/utils'
import { useEffect } from 'react'

export function QualitySection() {
  const { formData, updateField } = useTDSFormStore()

  // Auto-compute overall result
  useEffect(() => {
    const result = computeOverallResult({
      tape_test: formData.tape_test,
      flow_marks: formData.flow_marks,
      flex_test: formData.flex_test,
      graphite_test: formData.graphite_test,
      adhesion_test: formData.adhesion_test,
      rub_scuff_test: formData.rub_scuff_test,
      ink_lay_tone_check: formData.ink_lay_tone_check,
    })
    
    if (result !== formData.overall_result) {
      updateField('overall_result', result)
    }
  }, [
    formData.tape_test,
    formData.flow_marks,
    formData.flex_test,
    formData.graphite_test,
    formData.adhesion_test,
    formData.rub_scuff_test,
    formData.ink_lay_tone_check,
  ])

  const qualityTests = [
    { key: 'tape_test', label: 'Tape Test' },
    { key: 'flow_marks', label: 'Flow Marks' },
    { key: 'flex_test', label: 'Flex Test' },
    { key: 'graphite_test', label: 'Graphite Test' },
    { key: 'adhesion_test', label: 'Adhesion Test' },
    { key: 'rub_scuff_test', label: 'Rub / Scuff Test' },
    { key: 'ink_lay_tone_check', label: 'Ink Lay / Tone Check' },
  ]

  return (
    <div className="space-y-4">
      <div className="section-header">
        <span className="text-lg">▶</span>
        <span>QUALITY PARAMETERS</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {qualityTests.map((test) => (
          <div key={test.key} className="space-y-2">
            <Label htmlFor={test.key} className="text-xs">
              {test.label}
            </Label>
            <Select
              value={(formData as any)[test.key] || ''}
              onValueChange={(value) => updateField(test.key, value)}
            >
              <SelectTrigger id={test.key}>
                <SelectValue placeholder="N/A" />
              </SelectTrigger>
              <SelectContent>
                {TEST_RESULTS.map((result) => (
                  <SelectItem key={result} value={result}>
                    {result}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="flex items-center gap-3">
          <Label className="font-semibold">Overall Result:</Label>
          <QualityBadge result={formData.overall_result as any || 'Conditional'} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quality_notes">Quality Notes / Remarks</Label>
        <Textarea
          id="quality_notes"
          value={formData.quality_notes || ''}
          onChange={(e) => updateField('quality_notes', e.target.value)}
          placeholder="Enter any quality observations, issues, or notes..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  )
}