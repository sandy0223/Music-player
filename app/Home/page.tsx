'use client'
import React, { useEffect, useState } from 'react'
import Components from '@/components'
import { usePlayer } from '@/context/PlayerContext'
import { getTrending, type Track } from '@/lib/freetouse'

export default function HomePage() {
  const { playQueue } = usePlayer()
  const [featured, setFeatured] = useState<Track[]>([])

  /* Featured queue behind the hero's Play Now button. */
  useEffect(() => {
    getTrending({ limit: 15 })
      .then(setFeatured)
      .catch(() => setFeatured([]))
  }, [])

  const playFeatured = () => {
    if (featured.length > 0) playQueue(featured, 0)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <Components.HeroSection onPlay={playFeatured} />
      <Components.PlaylistCarousel />
      <Components.ChartsSection />
      <Components.GenresGrid />
      <Components.LibrarySection />
      <Components.PremiumBanner />
    </div>
  )
}
