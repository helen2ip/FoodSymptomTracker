import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  // Add touch/click to dismiss functionality
  useEffect(() => {
    if (toasts.length === 0) return

    const dismissToasts = () => {
      toasts.forEach((toast) => {
        dismiss(toast.id)
      })
    }

    // Add event listeners for touch and click
    document.addEventListener('touchstart', dismissToasts)
    document.addEventListener('click', dismissToasts)

    return () => {
      document.removeEventListener('touchstart', dismissToasts)
      document.removeEventListener('click', dismissToasts)
    }
  }, [toasts, dismiss])

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
