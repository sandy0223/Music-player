'use client'
import React, { useState } from 'react'
import TopNav from './TopNav'
import Sidebar from './Sidebar'
import NowPlayingBar from './NowPlayingBar'
import MobilePlayer from './MobilePlayer'
import Footer from './Footer'

interface ShellProps {
  children: React.ReactNode
}

/**
 * Persistent chrome shared by every route: top bar, sidebar, the fixed
 * now-playing bar and the mobile full-screen player. Keeping it here (in
 * the root layout) means the player never remounts while you navigate.
 */
export default function Shell({ children }: ShellProps) {
  const [expanded, setExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [playerOpen, setPlayerOpen] = useState(false)

  return (
    <div className="min-h-screen dark bg-background text-foreground">
      <TopNav onMenuClick={() => setMobileOpen(true)} />
      <Sidebar
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <main
        className={`pt-6 pb-40 md:pb-28 px-4 sm:px-6 lg:px-8 transition-[padding] duration-300 ease-in-out ${
          expanded ? 'md:pl-60' : 'md:pl-[72px]'
        }`}
      >
        {children}
        <div className="max-w-6xl mx-auto mt-14">
          <Footer />
        </div>
      </main>

      <NowPlayingBar onOpenPlayer={() => setPlayerOpen(true)} />
      <MobilePlayer open={playerOpen} onOpenChange={setPlayerOpen} />
    </div>
  )
}
