import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: readonly string[]
  placeholder?: string
  allowCustom?: boolean
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  allowCustom = false,
}: CustomSelectProps) {
  const [isCustom, setIsCustom] = useState(
    value && !options.includes(value as any)
  )

  const handleSelectChange = (newValue: string) => {
    if (newValue === '__custom__') {
      setIsCustom(true)
      onChange('')
    } else {
      setIsCustom(false)
      onChange(newValue)
    }
  }

  if (isCustom) {
    return (
      <TooltipProvider>
        <div className="relative group">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter custom value..."
            className="pr-9 h-10 bg-background/50 border-white/10"
            onBlur={() => {
              if (!value) setIsCustom(false)
            }}
            autoFocus
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => {
                  setIsCustom(false)
                  onChange('')
                }}
                className="absolute right-0 top-0 h-10 w-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors border-l border-white/5 bg-white/[0.02] rounded-r-md group-hover:bg-white/[0.05]"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="glass-modal border-white/10 text-[10px] font-mono uppercase tracking-widest">
              Switch to Dropdown
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <Select value={value} onValueChange={handleSelectChange}>
      <SelectTrigger className="bg-background/50 border-white/10 hover:bg-white/5 transition-colors">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="glass-modal border-white/10">
        {options.map((option) => (
          <SelectItem key={option} value={option} className="cursor-pointer focus:bg-white/5">
            {option}
          </SelectItem>
        ))}
        {allowCustom && (
          <>
            <SelectItem value="__separator__" disabled className="h-px bg-border p-0" />
            <SelectItem value="__custom__" className="cursor-pointer focus:bg-white/5 font-semibold text-primary">Custom…</SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  )
}