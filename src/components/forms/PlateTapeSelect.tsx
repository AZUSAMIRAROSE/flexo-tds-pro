import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PLATE_TAPE_COLORS } from '@/lib/constants'

interface PlateTapeSelectProps {
  value: string
  onChange: (value: string) => void
}

export function PlateTapeSelect({ value, onChange }: PlateTapeSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select color" />
      </SelectTrigger>
      <SelectContent>
        {PLATE_TAPE_COLORS.map((tape) => (
          <SelectItem key={tape.value} value={tape.value}>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: tape.color }}
              />
              <span>{tape.value}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}