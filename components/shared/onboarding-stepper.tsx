import { Progress } from "@/components/ui/progress"

interface OnboardingStepperProps {
  currentStep: number
  totalSteps: number
  steps: { label: string }[]
  className?: string
}

export function OnboardingStepper({ currentStep, totalSteps, steps, className }: OnboardingStepperProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={`space-y-4 ${className || ""}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Étape {currentStep} sur {totalSteps}
        </span>
        <span className="text-muted-foreground">{Math.round(progress)}%</span>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`text-xs ${
              index + 1 === currentStep
                ? "font-medium text-foreground"
                : index + 1 < currentStep
                ? "text-muted-foreground"
                : "text-muted-foreground/50"
            }`}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  )
}
