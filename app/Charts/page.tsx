'use client'
import React from 'react'
import PageHeader from '@/components/PageHeader'
import ChartsSection from '@/components/ChartsSection'

export default function ChartsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="Top Charts" subtitle="The most streamed tracks on Sonara right now">
        <span className="text-xs font-bold uppercase tracking-widest text-[#1ED760]">Updated hourly</span>
      </PageHeader>
      <ChartsSection title="Worldwide" subtitle="Global streaming rankings" actionLabel="Browse" actionTo="/Browse" limit={30} />
    </div>
  )
}
