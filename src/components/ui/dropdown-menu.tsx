import { useState, createContext, useContext, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

const DropdownContext = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} })

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return <DropdownContext.Provider value={{ open, setOpen }}><div className='relative inline-flex'>{children}</div></DropdownContext.Provider>
}

export function DropdownMenuTrigger({ children, className, ...props }: HTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useContext(DropdownContext)
  return <button className={className} onClick={() => setOpen((o) => !o)} {...props}>{children}</button>
}

export function DropdownMenuContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = useContext(DropdownContext)
  if (!open) return null
  return <><div className='fixed inset-0 z-40' onClick={() => setOpen(false)} /><div className={cn('absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)} {...props}>{children}</div></>
}

export function DropdownMenuItem({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { setOpen } = useContext(DropdownContext)
  return <div className={cn('relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground', className)} onClick={() => setOpen(false)} {...props}>{children}</div>
}

export function DropdownMenuSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} /> }
export function DropdownMenuLabel({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('px-2 py-1.5 text-sm font-semibold', className)} {...props}>{children}</div>
}