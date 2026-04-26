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
      <SelectTrigger className="bg-background/50 border-white/10 hover:bg-white/5 transition-colors">
        <SelectValue placeholder="Select color" />
      </SelectTrigger>
      <SelectContent className="glass-modal border-white/10">
        {PLATE_TAPE_COLORS.map((tape) => (
          <SelectItem key={tape.value} value={tape.value} className="cursor-pointer focus:bg-white/5">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
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