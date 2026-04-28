import { create } from 'zustand'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastStore {
  toasts: Toast[]
  add: (type: ToastType, message: string) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (type, message) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (msg: string) => useToastStore.getState().add('success', msg),
  error: (msg: string) => useToastStore.getState().add('error', msg),
  warning: (msg: string) => useToastStore.getState().add('warning', msg),
  info: (msg: string) => useToastStore.getState().add('info', msg),
}

const icons = {
  success: <CheckCircle className="w-4 h-4 text-green-400" />,
  error: <XCircle className="w-4 h-4 text-red-400" />,
  warning: <AlertCircle className="w-4 h-4 text-yellow-400" />,
  info: <Info className="w-4 h-4 text-blue-400" />,
}

const styles = {
  success: 'border-green-500/30 bg-green-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  warning: 'border-yellow-500/30 bg-yellow-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
}

export function ToastContainer() {
  const { toasts, remove } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl glass border ${styles[t.type]} min-w-[280px] max-w-sm shadow-lg`}
          >
            {icons[t.type]}
            <span className="text-sm text-white flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
