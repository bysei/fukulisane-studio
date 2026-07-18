import { cn } from '@/lib/cn'

export function ScrollArea({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('relative overflow-auto', className)} {...props}>{children}</div>
}