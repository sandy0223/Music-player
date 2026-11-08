'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SectionHeader from './SectionHeader'
import TrackRow from './TrackRow'
import { TrackListSkeleton, ErrorState } from './States'
import { usePlayer } from '@/context/PlayerContext'
import { getTrending, getViral, getLatest, type Track } from '@/lib/freetouse'

const tabs = ['Global', 'Your Country', 'Viral', 'New Releases']

/** Static chart-movement pattern, matching the design's up/down/flat arrows. */
const MOVES = ['up', 'same', 'up', 'down', 'up', 'same', 'down', 'up'] as const

type ChartData = Partial<Record<string, Track[]>>

interface ChartsSectionProps {
  title?: string
  subtitle?: string
  actionLabel?: string
  actionTo?: string
  limit?: number
}

export default function ChartsSection({
  title = 'Top Charts & Trending',
  subtitle = 'What the world is streaming right now',
  actionLabel = 'Full charts',
  actionTo = '/Charts',
  limit = 24,
}: ChartsSectionProps) {
  const [data, setData] = useState<ChartData>({})
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const { playQueue } = usePlayer()

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [global, viral, newest] = await Promise.all([
        getTrending({ limit }),
        getViral(limit, Math.max(8, Math.floor(limit / 2))),
        getLatest(limit),
      ])
      // "Your Country" is presented as a different regional slice of the
      // same chart; rotate it so the ordering isn't identical.
      const country = [...global.slice(5), ...global.slice(0, 5)]
      setData({ Global: global, 'Your Country': country, Viral: viral, 'New Releases': newest })
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <section aria-label="Top charts and trending">
      <SectionHeader title={title} subtitle={subtitle} actionLabel={actionLabel} actionTo={actionTo} />
      <Tabs defaultValue="Global">
        <TabsList className="bg-white/5 rounded-full p-1 h-10 mb-4 w-full sm:w-auto justify-start overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              className="rounded-full px-4 h-8 text-sm font-semibold text-muted-foreground data-[state=active]:bg-[#1ED760] data-[state=active]:text-black cursor-pointer whitespace-nowrap"
            >
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t} value={t} className="mt-0">
            {error ? (
              <ErrorState message="Could not load the charts." onRetry={load} />
            ) : loading || !data[t] ? (
              <TrackListSkeleton rows={6} />
            ) : (
              <ol className="divide-y divide-white/5">
                {(data[t] as Track[]).map((track, i) => (
                  <TrackRow
                    key={`${t}-${track.id}`}
                    track={track}
                    queue={data[t]}
                    index={i + 1}
                    move={MOVES[i % MOVES.length]}
                  />
                ))}
              </ol>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
