import { useState, createContext, useContext, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

const PopoverContext = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} })

export function Popover({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return <PopoverContext.Provider value={{ open, setOpen }}><div className='relative inline-flex'>{children}</div></PopoverContext.Provider>
}
export function PopoverTrigger({ children, className, ...props }: HTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useContext(PopoverContext)
  return <button className={className} onClick={() => setOpen((o) => !o)} {...props}>{children}</button>
}
export function PopoverContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = useContext(PopoverContext)
  if (!open) return null
  return <><div className='fixed inset-0 z-40' onClick={() => setOpen(false)} /><div className={cn('absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none', className)} {...props}>{children}</div></>
}