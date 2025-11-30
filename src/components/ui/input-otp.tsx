import * as React from "react"
import { cn } from "@/lib/utils"

interface InputOTPProps extends React.InputHTMLAttributes<HTMLInputElement> {
  length?: number
  value?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  containerClassName?: string
}

const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProps>(
  ({ length = 6, value = "", onChange, onComplete, disabled, containerClassName, className, ...props }, ref) => {
    const [values, setValues] = React.useState<string[]>(() => {
      const initial = value.split("").slice(0, length)
      return Array.from({ length }, (_, i) => initial[i] || "")
    })

    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

    React.useEffect(() => {
      if (value) {
        const newValues = value.split("").slice(0, length)
        setValues(Array.from({ length }, (_, i) => newValues[i] || ""))
      }
    }, [value, length])

    const handleChange = (index: number, newValue: string) => {
      // Apenas permite números
      if (newValue && !/^\d$/.test(newValue)) {
        return
      }

      const newValues = [...values]
      newValues[index] = newValue.slice(-1) // Pega apenas o último caractere
      setValues(newValues)

      const combinedValue = newValues.join("")
      onChange?.(combinedValue)

      // Se preencheu o campo e não é o último, move para o próximo
      if (newValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }

      // Se completou todos os campos, chama onComplete
      if (newValues.every((v) => v !== "") && newValues.length === length) {
        onComplete?.(combinedValue)
      }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !values[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else if (e.key === "ArrowRight" && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
      
      if (pastedData) {
        const newValues = Array.from({ length }, (_, i) => pastedData[i] || "")
        setValues(newValues)
        
        const combinedValue = newValues.join("")
        onChange?.(combinedValue)

        // Foca no próximo campo vazio ou no último
        const nextEmptyIndex = newValues.findIndex((v) => !v)
        const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex
        inputRefs.current[focusIndex]?.focus()

        // Se completou, chama onComplete
        if (newValues.every((v) => v !== "")) {
          onComplete?.(combinedValue)
        }
      }
    }

    return (
      <div className={cn("flex gap-1.5 sm:gap-2 justify-center flex-wrap", containerClassName)}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
              if (index === 0 && ref) {
                if (typeof ref === "function") {
                  ref(el)
                } else {
                  (ref as React.MutableRefObject<HTMLInputElement | null>).current = el
                }
              }
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={values[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              "h-10 w-10 sm:h-12 sm:w-12 text-center text-base sm:text-lg font-semibold rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] outline-none",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              className
            )}
            aria-label={`Código dígito ${index + 1}`}
            {...props}
          />
        ))}
      </div>
    )
  }
)

InputOTP.displayName = "InputOTP"

export { InputOTP }

