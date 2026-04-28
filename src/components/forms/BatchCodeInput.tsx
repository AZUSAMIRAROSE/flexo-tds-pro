import { useState, useEffect, useRef } from 'react'
import { useBatchCodeSuggestions } from '@/hooks/useTDS'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface BatchCodeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
}

export function BatchCodeInput({
  value,
  onChange,
  onBlur,
  placeholder = 'Enter batch code...',
  className,
  ...props
}: BatchCodeInputProps) {
  const [focused, setFocused] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { data: suggestions, isLoading } = useBatchCodeSuggestions(query)

  useEffect(() => {
    if (value.length >= 2) {
      setQuery(value)
    } else {
      setQuery('')
    }
  }, [value])

  const handleSelect = (batchCode: string) => {
    onChange(batchCode)
    setFocused(false)
    inputRef.current?.blur()
  }

  const showSuggestions = focused && suggestions && suggestions.length > 0

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setTimeout(() => setFocused(false), 200)
          onBlur?.()
        }}
        placeholder={placeholder}
        className={cn('batch-code-highlight font-mono', className)}
        {...props}
      />
      
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-3">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <div className="py-1">
              {suggestions.map((suggestion: any, index: number) => (
                <button
                  key={`${suggestion.batch_code}-${index}`}
                  type="button"
                  onClick={() => handleSelect(suggestion.batch_code)}
                  className="w-full px-3 py-2 text-left hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm batch-code-highlight inline-block px-1 rounded">
                        {suggestion.batch_code}
                      </div>
                      {suggestion.ink_name && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {suggestion.ink_name}
                        </div>
                      )}
                    </div>
                    {suggestion.usage_count && suggestion.usage_count > 1 && (
                      <div className="text-xs text-muted-foreground">
                        Used {suggestion.usage_count}×
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}