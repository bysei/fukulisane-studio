import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

export const Alert = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { variant?: string }>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div ref={ref} role='alert' className={cn('relative w-full rounded-lg border p-4', variant === 'destructive' ? 'border-destructive/50 text-destructive' : 'border-border', className)} {...props} />
  ),
)
export const AlertTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => <h5 ref={ref} className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />)
export const AlertDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />)