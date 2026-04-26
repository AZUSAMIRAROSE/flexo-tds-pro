import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTDSFormStore } from '@/stores/tdsFormStore'
import { PLATE_TAPE_COLORS } from '@/lib/constants'
import { Search } from 'lucide-react'

export function UnitLookupSidebar() {
  const { units } = useTDSFormStore()
  const [selectedUnitNo, setSelectedUnitNo] = useState<number>(1)

  const selectedUnit = units.find(u => u.unit_no === selectedUnitNo)

  const getPlateTapeColor = (tape: string | null) => {
    return PLATE_TAPE_COLORS.find(t => t.value === tape)?.color || '#CBD5E1'
  }

  return (
    <Card className="sticky top-20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center text-base">
          <Search className="mr-2 h-4 w-4" />
          UNIT BATCH CODE LOOKUP
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>Select Unit Number</Label>
          <Select
            value={selectedUnitNo.toString()}
            onValueChange={(value) => setSelectedUnitNo(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[...units].sort((a, b) => a.unit_no - b.unit_no).map((unit) => (
                <SelectItem key={unit.unit_no} value={unit.unit_no.toString()}>
                  Unit {unit.unit_no}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedUnit ? (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-muted-foreground">Plate Tape:</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: getPlateTapeColor(selectedUnit.plate_tape) }}
                />
                <span className="font-medium">{selectedUnit.plate_tape || 'Not set'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Unit No.:</span>
              <span className="font-semibold">{selectedUnit.unit_no}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Color / Station:</span>
              <span className="font-medium">{selectedUnit.color_station || '—'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Anilox ({selectedUnit.anilox_unit}):</span>
              <span className="font-medium">{selectedUnit.anilox_value || '—'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Volume ({selectedUnit.volume_unit}):</span>
              <span className="font-medium">{selectedUnit.volume_value || '—'}</span>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground">Ink Name:</span>
              <div className="font-medium text-xs break-words">
                {selectedUnit.ink_name || '—'}
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-md bg-white/[0.03] border border-white/10 mt-2 mb-2">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Batch Code</span>
              <div className="font-mono text-base font-bold text-white bg-primary/20 border border-primary/30 px-3 py-1.5 rounded block w-full text-center break-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]">
                {selectedUnit.batch_code || 'UNASSIGNED'}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Lamp Hours:</span>
              <span className="font-medium">{selectedUnit.lamp_hrs || '—'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Intensity (%):</span>
              <span className="font-medium">{selectedUnit.intensity_pct || '—'}</span>
            </div>

            {selectedUnit.unit_remarks && (
              <div className="space-y-1 pt-2 border-t">
                <span className="text-muted-foreground">Remarks:</span>
                <div className="text-xs bg-muted/30 p-2 rounded">
                  {selectedUnit.unit_remarks}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No units added yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}