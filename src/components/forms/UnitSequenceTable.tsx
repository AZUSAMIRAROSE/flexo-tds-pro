import React, { useCallback, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { BatchCodeInput } from './BatchCodeInput'
import { PlateTapeSelect } from './PlateTapeSelect'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTDSFormStore } from '@/stores/tdsFormStore'
import { Plus, Trash2, ArrowLeftRight } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { TDSUnit } from '@/types/tds.types'

export function UnitSequenceTable() {
  const { units, updateUnit, addUnit, removeUnit } = useTDSFormStore()
  const [expandedUnit, setExpandedUnit] = useState<number | null>(null)

  const toggleAniloxUnit = (index: number) => {
    const current = units[index].anilox_unit
    updateUnit(index, { anilox_unit: current === 'LPI' ? 'LCM' : 'LPI' })
  }

  const toggleVolumeUnit = (index: number) => {
    const current = units[index].volume_unit
    updateUnit(index, { volume_unit: current === 'CCM' ? 'BCM' : 'CCM' })
  }

  const handlePaste = useCallback((e: React.ClipboardEvent, startIndex: number) => {
    e.preventDefault()

    try {
      const pastedText = e.clipboardData.getData('text/plain')
      const rows = pastedText.split('\n').filter(row => row.trim())

      rows.forEach((row, rowIndex) => {
        const cells = row.split('\t')
        const unitIndex = startIndex + rowIndex

        if (unitIndex >= units.length) return

        const updates: Partial<TDSUnit> = {}

        if (cells[0]) updates.color_station = cells[0].trim()
        if (cells[1]) updates.anilox_value = parseFloat(cells[1])
        if (cells[2]) updates.volume_value = parseFloat(cells[2])
        if (cells[3]) updates.ink_name = cells[3].trim()
        if (cells[4]) updates.batch_code = cells[4].trim()
        if (cells[5]) updates.lamp_hrs = parseInt(cells[5])
        if (cells[6]) updates.intensity_pct = parseInt(cells[6])
        if (cells[7]) updates.plate_tape = cells[7].trim() as TDSUnit['plate_tape']

        updateUnit(unitIndex, updates)
      })

      toast({
        title: 'Data pasted',
        description: `Pasted ${rows.length} row(s) from Excel`,
      })
    } catch (_err) {
      toast({
        title: 'Paste failed',
        description: 'Could not paste data. Make sure the format matches the columns.',
        variant: 'destructive',
      })
    }
  }, [units, updateUnit])

  return (
    <div className="glass-panel border-white/5 space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]">3</div>
        <h3 className="text-lg font-bold tracking-widest text-foreground uppercase">PRINTING UNIT SEQUENCE</h3>
      </div>

      <div className="border border-white/10 rounded-lg overflow-hidden bg-background/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16">Unit</TableHead>
                <TableHead className="min-w-[120px]">Color / Station</TableHead>
                <TableHead className="min-w-[140px]">Anilox</TableHead>
                <TableHead className="min-w-[140px]">Volume</TableHead>
                <TableHead className="min-w-[150px]">Printing Ink Name</TableHead>
                <TableHead className="min-w-[150px]">Batch Code</TableHead>
                <TableHead className="w-24">Lamp Hrs</TableHead>
                <TableHead className="w-24">Intensity %</TableHead>
                <TableHead className="min-w-[120px]">Plate Tape</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No units added yet. Click "Add Unit" to start.
                  </TableCell>
                </TableRow>
              ) : (
                units.map((unit, index) => (
                  <React.Fragment key={unit.id || index}>
                    <TableRow className="hover:bg-muted/30">
                      <TableCell className="font-semibold text-center">
                        {unit.unit_no}
                      </TableCell>
                      <TableCell onPaste={(e) => handlePaste(e, index)}>
                        <Input
                          value={unit.color_station || ''}
                          onChange={(e) => updateUnit(index, { color_station: e.target.value })}
                          placeholder="Cyan"
                          className="min-w-[100px]"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={unit.anilox_value || ''}
                            onChange={(e) => updateUnit(index, { anilox_value: parseFloat(e.target.value) })}
                            placeholder="360"
                            className="w-20"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAniloxUnit(index)}
                            className="px-2"
                          >
                            {unit.anilox_unit}
                            <ArrowLeftRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            step="0.1"
                            value={unit.volume_value || ''}
                            onChange={(e) => updateUnit(index, { volume_value: parseFloat(e.target.value) })}
                            placeholder="4.5"
                            className="w-20"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleVolumeUnit(index)}
                            className="px-2"
                          >
                            {unit.volume_unit}
                            <ArrowLeftRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={unit.ink_name || ''}
                          onChange={(e) => updateUnit(index, { ink_name: e.target.value })}
                          placeholder="INX ECO-4000 Cyan"
                          className="min-w-[130px]"
                        />
                      </TableCell>
                      <TableCell>
                        <BatchCodeInput
                          value={unit.batch_code || ''}
                          onChange={(value) => updateUnit(index, { batch_code: value })}
                          placeholder="BT2025042801"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={unit.lamp_hrs || ''}
                          onChange={(e) => updateUnit(index, { lamp_hrs: parseInt(e.target.value) })}
                          placeholder="1200"
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={unit.intensity_pct || ''}
                          onChange={(e) => updateUnit(index, { intensity_pct: parseInt(e.target.value) })}
                          placeholder="85"
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <PlateTapeSelect
                          value={unit.plate_tape || ''}
                          onChange={(value) => updateUnit(index, { plate_tape: value as any })}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUnit(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {/* Expandable Remarks Row */}
                    <TableRow className="hover:bg-muted/30">
                      <TableCell></TableCell>
                      <TableCell colSpan={9}>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Unit Remarks</Label>
                          <Textarea
                            value={unit.unit_remarks || ''}
                            onChange={(e) => updateUnit(index, { unit_remarks: e.target.value })}
                            placeholder="Optional remarks for this unit..."
                            className="min-h-[60px] text-sm"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                    </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {units.length < 20 && (
          <div className="border-t p-4">
            <Button
              type="button"
              variant="outline"
              onClick={addUnit}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Unit (Max 20)
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}