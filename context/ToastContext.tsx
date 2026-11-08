'use client'
import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  title: string
  desc?: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (title: string, opts?: { desc?: string; variant?: ToastVariant }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const COLORS: Record<ToastVariant, string> = {
  success: 'text-[#1ED760]',
  error: 'text-destructive',
  info: 'text-white',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback<ToastContextValue['toast']>(
    (title, opts) => {
      const id = nextId.current++
      setItems((prev) => [...prev.slice(-3), { id, title, desc: opts?.desc, variant: opts?.variant ?? 'info' }])
      window.setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-20 right-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {items.map((item) => {
            const Icon = ICONS[item.variant]
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ type: 'spring', damping: 26, stiffness: 380 }}
                className="pointer-events-auto flex items-start gap-3 rounded-xl glass-panel px-4 py-3"
                role="status"
              >
                <Icon size={18} className={cn('mt-0.5 shrink-0', COLORS[item.variant])} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  {item.desc && <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>}
                </div>
                <button
                  onClick={() => dismiss(item.id)}
                  className="shrink-0 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                  aria-label="Dismiss notification"
                >
                  <X size={15} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
