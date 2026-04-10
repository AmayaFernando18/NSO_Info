import { useEffect, type ReactNode } from 'react'

type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  description: string
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  intent?: 'primary' | 'success' | 'warning' | 'danger'
  isConfirming?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const intentStyles: Record<NonNullable<ConfirmDialogProps['intent']>, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary/30',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-300',
  warning: 'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300',
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  intent = 'primary',
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isConfirming) {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, isConfirming, onCancel])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-secondary/60 backdrop-blur-sm"
        aria-label="Close confirmation dialog"
        onClick={() => !isConfirming && onCancel()}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
        <div className="border-b border-border bg-surface px-6 py-4">
          <h3 className="text-lg font-semibold text-secondary">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>

        {children ? <div className="px-6 pt-4">{children}</div> : null}

        <div className="flex items-center justify-end gap-2 px-6 py-4">
          <button
            type="button"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onCancel}
            disabled={isConfirming}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${intentStyles[intent]}`}
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
