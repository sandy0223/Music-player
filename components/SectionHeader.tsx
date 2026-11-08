'use client'
import React from 'react'
import { Link } from '@/lib'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  actionLabel?: string
  actionTo?: string
}

export default function SectionHeader({
  title,
  subtitle,
  actionLabel = 'Show all',
  actionTo = '/Browse',
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <Link
        to={actionTo}
        className="group flex items-center gap-1.5 shrink-0 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-[#1ED760] transition-colors cursor-pointer"
      >
        {actionLabel}
        <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  )
}