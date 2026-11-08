'use client'
import React from 'react'
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react'
import { cn } from '@/lib'

/** Neutral shimmer block used while data loads. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-white/10', className)} aria-hidden="true" />
}

/** Skeleton list shaped like a stack of TrackRows. */
export function TrackListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-white/5" aria-busy="true" aria-label="Loading tracks">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-4 py-2.5 px-2">
          <Skeleton className="h-4 w-6" />
          <Skeleton className="size-11 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-3 w-9" />
        </li>
      ))}
    </ul>
  )
}

/** Skeleton card grid for playlists / albums. */
export function CardSkeleton({ count = 7, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('flex gap-4', className)} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="shrink-0 w-40 sm:w-44 rounded-xl border border-white/5 p-3 space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  desc?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, title, desc, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-14 px-6 text-center">
      <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-white/5 text-muted-foreground">
        {icon ?? <Inbox size={22} />}
      </span>
      <p className="text-sm font-bold text-foreground">{title}</p>
      {desc && <p className="text-xs text-muted-foreground mt-1 max-w-sm">{desc}</p>}
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-4 h-9 rounded-full bg-[#1ED760] px-5 text-xs font-bold text-black hover:shadow-[0_0_24px_rgba(30,215,96,0.45)] transition-all cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Something went wrong loading this section.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] py-12 px-6 text-center">
      <AlertCircle size={24} className="text-destructive mb-3" />
      <p className="text-sm font-bold text-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 h-9 rounded-full border border-white/20 px-5 text-xs font-bold text-foreground hover:border-[#1ED760] hover:text-[#1ED760] transition-colors cursor-pointer"
        >
          <RefreshCw size={14} /> Try again
        </button>
      )}
    </div>
  )
}
