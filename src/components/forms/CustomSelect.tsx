import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter custom value..."
          onBlur={() => {
            if (!value) setIsCustom(false)
          }}
          autoFocus
        />
        <button
          type="button"
          onClick={() => {
            setIsCustom(false)
            onChange('')
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
        >
          Back to dropdown
        </button>
      </div>
    )
  }

  return (
    <Select value={value} onValueChange={handleSelectChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
        {allowCustom && (
          <>
            <SelectItem value="__separator__" disabled className="h-px bg-border p-0" />
            <SelectItem value="__custom__">Custom…</SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  )
}