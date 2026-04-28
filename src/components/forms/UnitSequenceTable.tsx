import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { BatchCodeInput } from './BatchCodeInput'
import { PlateTapeSelect } from './PlateTapeSelect'
import { useTDSFormStore } from '@/stores/tdsFormStore'
import { Plus, Trash2, ArrowLeftRight } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import type { TDSUnit } from '@/types/tds.types'

function parseNumberInput(value: string) {
  if (value.trim() === '') return null
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

function parseIntegerInput(value: string) {
  const numericValue = parseNumberInput(value)
  return numericValue === null ? null : Math.trunc(numericValue)
}

export function UnitSequenceTable() {
  const { units, updateUnit, addUnit, removeUnit } = useTDSFormStore()

  const [pasteMode, setPasteMode] = useState(false)
  const [pasteData, setPasteData] = useState('')

  const toggleAniloxUnit = (index: number) => {
    const current = units[index].anilox_unit
    updateUnit(index, { anilox_unit: current === 'LPI' ? 'LCM' : 'LPI' })
  }

  // Volume unit is always CCM per project rules (NOT BCM)

  const handlePasteSubmit = () => {
    try {
      const rows = pasteData.split('\n').filter(row => row.trim())
      
      rows.forEach((row, rowIndex) => {
        const cells = row.split('\t')
        // Try to find the first empty unit or just append
        const unitIndex = rowIndex
        
        if (unitIndex >= units.length) return

        const updates: Partial<TDSUnit> = {}

        if (cells[0]) updates.color_station = cells[0].trim()
        if (cells[1]) updates.anilox_value = parseNumberInput(cells[1])
        if (cells[2]) updates.volume_value = parseNumberInput(cells[2])
        if (cells[3]) updates.ink_name = cells[3].trim()
        if (cells[4]) updates.batch_code = cells[4].trim()
        if (cells[5]) updates.lamp_hrs = parseIntegerInput(cells[5])
        if (cells[6]) updates.intensity_pct = parseIntegerInput(cells[6])
        if (cells[7]) updates.plate_tape = cells[7].trim() as TDSUnit['plate_tape']

        updateUnit(unitIndex, updates)
      })

      toast({
        title: 'Data pasted',
        description: `Pasted ${rows.length} row(s) from Excel`,
      })
      setPasteMode(false)
      setPasteData('')
    } catch (_err) {
      toast({
        title: 'Paste failed',
        description: 'Could not paste data. Make sure the format matches the columns.',
        variant: 'destructive',
      })
    }
  }

  // Ensure units are sorted by unit_no
  const sortedUnits = [...units].sort((a, b) => a.unit_no - b.unit_no)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, currentIndex: number, field: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      
      const sortedIndex = sortedUnits.findIndex(u => u.unit_no === units[currentIndex].unit_no)
      if (sortedIndex !== -1 && sortedIndex < sortedUnits.length - 1) {
        const nextUnit = sortedUnits[sortedIndex + 1]
        const nextOriginalIndex = units.findIndex(u => u.unit_no === nextUnit.unit_no)
        
        const nextInput = document.querySelector(`[data-field="${field}"][data-unit-index="${nextOriginalIndex}"]`) as HTMLElement
        if (nextInput) {
          nextInput.focus()
          // Optionally select text to emulate Excel
          if (nextInput instanceof HTMLInputElement || nextInput instanceof HTMLTextAreaElement) {
            nextInput.select()
          }
        }
      }
    }
  }

  return (
    <div className="glass-panel border-white/5 space-y-6 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]">3</div>
          <h3 className="text-lg font-bold tracking-widest text-foreground uppercase">PRINTING UNIT SEQUENCE</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setPasteMode(!pasteMode)} className="bg-white/5">
            {pasteMode ? 'Cancel Paste' : 'Paste Excel Data'}
          </Button>
          {units.length < 20 && (
            <Button type="button" variant="outline" onClick={addUnit} size="sm" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Button>
          )}
        </div>
      </div>

      {pasteMode && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
          <Label className="text-primary font-semibold">Paste from Excel (Tab-separated)</Label>
          <p className="text-xs text-muted-foreground">Columns: Color/Station | Anilox | Volume | Ink Name | Batch Code | Lamp Hrs | Intensity % | Plate Tape</p>
          <Textarea 
            value={pasteData}
            onChange={(e) => setPasteData(e.target.value)}
            placeholder="Paste rows here..."
            className="min-h-[100px] font-mono text-xs"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handlePasteSubmit}>Process Data</Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sortedUnits.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-lg">
            No units added yet. Click "Add Unit" to start.
          </div>
        ) : (
          sortedUnits.map((unit) => {
            const originalIndex = units.findIndex(u => u.unit_no === unit.unit_no)

            return (
              <div key={unit.unit_no} className="border border-white/10 rounded-xl overflow-hidden bg-background/40 p-4 md:p-6 relative group transition-all hover:border-white/20 hover:bg-background/60 shadow-sm">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-4 right-4 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
                  onClick={() => removeUnit(originalIndex)}
                  title="Remove Unit"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold border border-primary/30">
                    {unit.unit_no}
                  </div>
                  <div className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">
                    Unit Configuration
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Color / Station</Label>
                    <Input
                      data-field="color_station"
                      data-unit-index={originalIndex}
                      onKeyDown={(e) => handleKeyDown(e, originalIndex, 'color_station')}
                      value={unit.color_station || ''}
                      onChange={(e) => updateUnit(originalIndex, { color_station: e.target.value })}
                      placeholder="Cyan"
                      className="h-10 bg-white/[0.02]"
                    />
                  </div>
                  
                  <div className="space-y-1.5 xl:col-span-2">
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Printing Ink Name</Label>
                    <Input
                      data-field="ink_name"
                      data-unit-index={originalIndex}
                      onKeyDown={(e) => handleKeyDown(e, originalIndex, 'ink_name')}
                      value={unit.ink_name || ''}
                      onChange={(e) => updateUnit(originalIndex, { ink_name: e.target.value })}
                      placeholder="INX ECO-4000 Cyan"
                      className="h-10 bg-white/[0.02]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Batch Code</Label>
                    <BatchCodeInput
                      data-field="batch_code"
                      data-unit-index={originalIndex}
                      onKeyDown={(e) => handleKeyDown(e, originalIndex, 'batch_code')}
                      value={unit.batch_code || ''}
                      onChange={(value) => updateUnit(originalIndex, { batch_code: value })}
                      placeholder="BT202504..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                      <span>Anilox</span>
                      <button type="button" onClick={() => toggleAniloxUnit(originalIndex)} className="text-primary hover:text-primary/80 font-bold transition-colors">{unit.anilox_unit} <ArrowLeftRight className="inline h-3 w-3 ml-0.5"/></button>
                    </Label>
                    <Input
                      data-field="anilox_value"
                      data-unit-index={originalIndex}
                      onKeyDown={(e) => handleKeyDown(e, originalIndex, 'anilox_value')}
                      type="number"
                      min={0}
                      value={unit.anilox_value ?? ''}
                      onChange={(e) => updateUnit(originalIndex, { anilox_value: parseNumberInput(e.target.value) })}
                      placeholder="360"
                      className="h-10 bg-white/[0.02]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                      <span>Volume</span>
                      <span className="text-primary font-bold">CCM</span>
                    </Label>
                    <Input
                      data-field="volume_value"
                      data-unit-index={originalIndex}
                      onKeyDown={(e) => handleKeyDown(e, originalIndex, 'volume_value')}
                      type="number"
                      min={0}
                      step="0.1"
                      value={unit.volume_value ?? ''}
                      onChange={(e) => updateUnit(originalIndex, { volume_value: parseNumberInput(e.target.value) })}
                      placeholder="4.5"
                      className="h-10 bg-white/[0.02]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Plate Tape</Label>
                    <PlateTapeSelect
                      value={unit.plate_tape || ''}
                      onChange={(value) => updateUnit(originalIndex, { plate_tape: value as any })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Lamp Hrs</Label>
                      <Input
                        data-field="lamp_hrs"
                        data-unit-index={originalIndex}
                        onKeyDown={(e) => handleKeyDown(e, originalIndex, 'lamp_hrs')}
                        type="number"
                        min={0}
                        max={9999}
                        value={unit.lamp_hrs ?? ''}
                        onChange={(e) => updateUnit(originalIndex, { lamp_hrs: parseIntegerInput(e.target.value) })}
                        placeholder="1200"
                        className="h-10 bg-white/[0.02]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Intensity %</Label>
                      <Input
                        data-field="intensity_pct"
                        data-unit-index={originalIndex}
                        onKeyDown={(e) => handleKeyDown(e, originalIndex, 'intensity_pct')}
                        type="number"
                        min={0}
                        max={100}
                        value={unit.intensity_pct ?? ''}
                        onChange={(e) => updateUnit(originalIndex, { intensity_pct: parseIntegerInput(e.target.value) })}
                        placeholder="85"
                        className="h-10 bg-white/[0.02]"
                      />
                    </div>
                  </div>
                </div>

                {/* Remarks Row */}
                <div className="mt-5 pt-5 border-t border-white/5 space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Unit Remarks</Label>
                  <Textarea
                    data-field="unit_remarks"
                    data-unit-index={originalIndex}
                    onKeyDown={(e) => handleKeyDown(e, originalIndex, 'unit_remarks')}
                    value={unit.unit_remarks || ''}
                    onChange={(e) => updateUnit(originalIndex, { unit_remarks: e.target.value })}
                    placeholder="Optional remarks for this unit..."
                    className="min-h-[40px] resize-none bg-white/[0.01]"
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
