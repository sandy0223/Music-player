'use client'
import React from 'react'
import PageHeader from '@/components/PageHeader'
import LibrarySection from '@/components/LibrarySection'
import SectionHeader from '@/components/SectionHeader'
import TrackRow from '@/components/TrackRow'
import { useLibrary } from '@/context/LibraryContext'

export default function LibraryPage() {
  const { recent } = useLibrary()

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <PageHeader title="Your Library" subtitle="Playlists, albums, artists and downloads — all in one place" />
      <LibrarySection hideHeader />

      <section aria-label="Recently played">
        <SectionHeader title="Recently Played" subtitle="Your latest listening history" actionLabel="Favorites" actionTo="/Favorites" />
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center rounded-xl border border-dashed border-white/10">
            Play anything and it will show up here.
          </p>
        ) : (
          <ol className="divide-y divide-white/5">
            {recent.map((track, i) => (
              <TrackRow key={`lib-${track.id}`} track={track} queue={recent} index={i + 1} />
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
