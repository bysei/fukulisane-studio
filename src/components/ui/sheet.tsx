import { useState, createContext, useContext, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { X } from 'lucide-react'

const SheetContext = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} })

export function Sheet({ children, open: controlledOpen, onOpenChange }: { children: ReactNode; open?: boolean; onOpenChange?: (v: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (v: boolean) => { setInternalOpen(v); onOpenChange?.(v) }
  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>
}
export function SheetTrigger({ children, className, ...props }: HTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useContext(SheetContext)
  return <button className={className} onClick={() => setOpen(true)} {...props}>{children}</button>
}
export function SheetContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = useContext(SheetContext)
  if (!open) return null
  return <div className='fixed inset-0 z-50'><div className='fixed inset-0 bg-black/50' onClick={() => setOpen(false)} /><div className={cn('fixed inset-y-0 right-0 z-50 h-full w-3/4 max-w-sm border-l bg-background p-6 shadow-lg', className)} {...props}>{children}<button className='absolute right-4 top-4' onClick={() => setOpen(false)}><X size={16} /></button></div></div>
}
export function SheetHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('flex flex-col gap-2 text-center sm:text-left', className)} {...props} /> }
export function SheetTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) { return <h2 className={cn('text-lg font-semibold text-foreground', className)} {...props} /> }
export function SheetDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) { return <p className={cn('text-sm text-muted-foreground', className)} {...props} /> }
