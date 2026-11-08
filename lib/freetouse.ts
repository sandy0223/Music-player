/**
 * Free To Use API client (https://api.freetouse.com/v3/openapi.json).
 * Royalty-free catalogue, no API key. The browser cannot call the API
 * directly (its CORS allowlist only includes freetouse.com), so every
 * request goes through our server-side proxy at /api/ftu — verified
 * against the live OpenAPI spec, no guessed endpoints or fields.
 *
 * Audio and artwork live on eu.data.freetouse.com which sends
 * `Access-Control-Allow-Origin: *`, so <audio> and <img> load them
 * directly without the proxy.
 */

type Params = Record<string, string | number | undefined | null>

/** Documented error shape: `{ ok: false, error: string }`. */
interface FtuError {
  ok: false
  error: string
}

async function request<T = unknown>(path: string, params: Params = {}): Promise<T> {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const qs = search.toString()
  const res = await fetch(`/api/ftu/${path}${qs ? `?${qs}` : ''}`)

  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    /* non-JSON body — handled below */
  }

  if (!res.ok || (body as FtuError | null)?.ok === false) {
    const message =
      body && typeof body === 'object' && 'error' in body && typeof (body as FtuError).error === 'string'
        ? (body as FtuError).error
        : `Request failed (HTTP ${res.status})`
    throw new Error(message)
  }
  return body as T
}

/* ------------------------------------------------------------------ */
/* Small in-memory cache so navigating back doesn't refetch everything */
/* (immediate-use only — nothing is persisted).                        */
/* ------------------------------------------------------------------ */

const CACHE_TTL = 60_000 // 1 min
const cache = new Map<string, { at: number; value: unknown }>()

async function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit.value as T
  const value = await loader()
  cache.set(key, { at: Date.now(), value })
  return value
}

/* ------------------------------------------------------------------ */
/* Types (same shapes the UI already consumes)                         */
/* ------------------------------------------------------------------ */

export interface Track {
  id: string
  title: string
  artist: string
  artistId: string
  artwork: string
  url: string
  duration: number
  genre?: string
  mood?: string
  plays?: number
  favorites?: number
  description?: string
  permalink?: string
  releaseDate?: string
  isStreamable: boolean
}

export interface Playlist {
  id: string
  title: string
  desc: string
  cover: string
  owner: string
  trackCount?: number
}

export interface Artist {
  id: string
  name: string
  handle: string
  artwork: string
  followers?: number
  trackCount?: number
  bio?: string
}

/* ------------------------------------------------------------------ */
/* Raw spec shapes                                                     */
/* ------------------------------------------------------------------ */

interface RawThumb {
  sm?: string
  md?: string
  lg?: string
  xl?: string
}

/** `[sequence, { id, name }]` tuples, ascending by sequence. */
type SeqTuple<T> = [number, T]

interface RawTrack {
  id: string
  title: string
  artists: SeqTuple<{ id: string; name: string }>[]
  genre?: string | null
  duration?: number
  release_date?: string
  plays?: number
  likes?: number
  staff_order?: number
  is_premium?: boolean
  thumbnails?: RawThumb
  files?: { mp3?: string }
  categories?: SeqTuple<{ id: string; name: string }>[]
  tags?: SeqTuple<string>[]
}

interface RawArtist {
  id: string
  name: string
  description?: string | null
  views?: number
  thumbnails?: RawThumb
}

interface RawCategory {
  id: string
  type: string
  type_id: string
  name: string
  description?: string | null
  thumbnails?: RawThumb
}

interface Paged<T> {
  ok: true
  data: T[]
  pagination: { limit: number | null; offset: number; count: number }
}

interface Single<T> {
  ok: true
  data: T | null
}

/* ------------------------------------------------------------------ */
/* Mapping                                                             */
/* ------------------------------------------------------------------ */

function firstOf<T>(list?: SeqTuple<T>[]): T | undefined {
  return list && list.length > 0 ? list[0][1] : undefined
}

export function mapTrack(raw: RawTrack): Track {
  const artist = firstOf(raw.artists)
  const categoryNames = (raw.categories ?? []).map(([, c]) => c.name)
  return {
    id: raw.id,
    title: raw.title || 'Unknown track',
    artist: artist?.name || 'Unknown artist',
    artistId: artist?.id || '',
    artwork: raw.thumbnails?.md || raw.thumbnails?.sm || '',
    url: raw.files?.mp3 || '',
    duration: Math.round(raw.duration ?? 0),
    genre: raw.genre ?? undefined,
    // List responses only carry the first 2 categories; mood is derived
    // from any of them that matches a known Mood-type category name.
    mood: categoryNames.find((name) => KNOWN_MOODS.has(name)),
    plays: raw.plays,
    favorites: raw.likes,
    releaseDate: raw.release_date,
    // Premium tracks still expose a playable mp3 (verified live).
    isStreamable: Boolean(raw.files?.mp3),
  }
}

function mapArtist(raw: RawArtist): Artist {
  return {
    id: raw.id,
    name: raw.name || 'Unknown artist',
    handle: '',
    artwork: raw.thumbnails?.md || raw.thumbnails?.sm || '',
    // The API exposes page views, not follower counts — surfaced as the
    // popularity number in the UI.
    followers: raw.views,
    bio: raw.description ?? undefined,
  }
}

function mapCategory(raw: RawCategory): Playlist {
  return {
    id: raw.id,
    title: raw.name || 'Untitled collection',
    desc: raw.description || '',
    cover: raw.thumbnails?.md || raw.thumbnails?.sm || '',
    owner: 'Free To Use',
  }
}

/* ------------------------------------------------------------------ */
/* Categories (genres / moods) — one cached lookup for the whole app   */
/* ------------------------------------------------------------------ */

interface CategoryIndex {
  byName: Map<string, RawCategory>
  all: RawCategory[]
  moodNames: Set<string>
}

let categoryIndex: Promise<CategoryIndex> | null = null

function loadCategories(): Promise<CategoryIndex> {
  if (!categoryIndex) {
    categoryIndex = cached('categories:all', async () => {
      const json = await request<Paged<RawCategory>>('/music/categories/all', { limit: 100 })
      const all = json.data ?? []
      const byName = new Map<string, RawCategory>()
      for (const cat of all) byName.set(cat.name.toLowerCase(), cat)
      const moodNames = new Set(all.filter((c) => c.type === 'Mood').map((c) => c.name))
      return { byName, all, moodNames }
    }).then((idx) => {
      // Allow a retry after a failed load.
      if (idx.all.length === 0) categoryIndex = null
      return idx
    })
  }
  return categoryIndex
}

/** Mood-type category names, filled in once categories are loaded. */
const KNOWN_MOODS = new Set<string>()
void loadCategories().then((idx) => {
  for (const name of idx.moodNames) KNOWN_MOODS.add(name)
})

async function categoryIdByName(name: string): Promise<string | null> {
  const idx = await loadCategories()
  return idx.byName.get(name.toLowerCase())?.id ?? null
}

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

export type ChartOrder =
  | 'release_date'
  | 'views'
  | 'plays'
  | 'downloads'
  | 'staff_order'
  | 'random'

export interface TrendingOptions {
  limit?: number
  offset?: number
  genre?: string
  mood?: string
  order?: ChartOrder
}

/** Most-played tracks (the Global chart), optionally filtered. */
export async function getTrending(opts: TrendingOptions = {}): Promise<Track[]> {
  const { limit = 24, offset, genre, mood, order = 'plays' } = opts
  const key = `trending:${limit}:${offset ?? ''}:${genre ?? ''}:${mood ?? ''}:${order}`
  return cached(key, async () => {
    // genre / mood resolve through the category index (spec has no
    // combined filter — categories are the filter mechanism).
    if (genre || mood) {
      const name = genre ?? mood!
      const id = await categoryIdByName(name)
      if (id) {
        const json = await request<Paged<RawTrack>>(`/music/categories/${id}/tracks`, {
          limit,
          offset,
          order,
        })
        return (json.data ?? []).map(mapTrack)
      }
      // No matching category — fall through to the unfiltered chart.
    }
    const json = await request<Paged<RawTrack>>('/music/tracks/all', { limit, offset, order })
    return (json.data ?? []).map(mapTrack)
  })
}

/**
 * A different slice of the chart ordered by views instead of plays —
 * used for the "Viral" tab and Discover's fresh picks.
 */
export async function getViral(limit = 24, offset = 12): Promise<Track[]> {
  return getTrending({ limit, offset, order: 'views' })
}

/** Tracks ordered by release date — the "New Releases" chart. */
export async function getLatest(limit = 24, offset = 0): Promise<Track[]> {
  return getTrending({ limit, offset, order: 'release_date' })
}

/** Full-text track search (matches titles, tags, categories, artists). */
export async function searchTracks(query: string, limit = 30): Promise<Track[]> {
  if (!query.trim()) return []
  return cached(`search:${query}:${limit}`, async () => {
    const json = await request<Paged<RawTrack>>('/music/tracks/search', { query, limit })
    return (json.data ?? []).map(mapTrack)
  })
}

/**
 * Collection search — the API has no playlist resource, so curated
 * categories (Genre / Mood / Video) back the playlist UI. All 67 are
 * fetched once and filtered here (client-side over a tiny list).
 */
export async function searchPlaylists(query: string, limit = 12): Promise<Playlist[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const idx = await loadCategories()
  return idx.all
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q),
    )
    .slice(0, limit)
    .map(mapCategory)
}

/** Artist search — the API has no artist search route; 59 artists exist
 *  in total, so the full list is fetched once and filtered here. */
export async function searchArtists(query: string, limit = 12): Promise<Artist[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return cached('artists:all', async () => {
    const json = await request<Paged<RawArtist>>('/music/artists/all', { limit: 0 })
    return json.data ?? []
  }).then((all) =>
    all.filter((a) => a.name.toLowerCase().includes(q)).slice(0, limit).map(mapArtist),
  )
}

/** Most-viewed artists — powers "Artists to Follow" suggestions. */
export async function getTopArtists(limit = 6): Promise<Artist[]> {
  return cached(`artists:top:${limit}`, async () => {
    const json = await request<Paged<RawArtist>>('/music/artists/all', {
      limit,
      order: 'views',
      sort: 'desc',
    })
    return (json.data ?? []).map(mapArtist)
  })
}

/** Single track by id (spec: data may be null). */
export async function getTrack(id: string): Promise<Track | null> {
  const json = await request<Single<RawTrack>>(`/music/tracks/${id}`)
  return json.data ? mapTrack(json.data) : null
}

/** Curated collections for the carousel — categories by popularity. */
export async function getTrendingPlaylists(limit = 12): Promise<Playlist[]> {
  return cached(`collections:${limit}`, async () => {
    const json = await request<Paged<RawCategory>>('/music/categories/all', {
      limit,
      order: 'views',
      sort: 'desc',
    })
    return (json.data ?? []).map(mapCategory)
  })
}

/** Tracks inside a curated collection (category). */
export async function getPlaylistTracks(id: string): Promise<Track[]> {
  return cached(`collection:${id}`, async () => {
    const json = await request<Paged<RawTrack>>(`/music/categories/${id}/tracks`, {
      limit: 50,
      order: 'plays',
    })
    return (json.data ?? []).map(mapTrack)
  })
}

/** Single artist by id (spec: data may be null). */
export async function getArtist(id: string): Promise<Artist | null> {
  const json = await request<Single<RawArtist>>(`/music/artists/${id}`)
  return json.data ? mapArtist(json.data) : null
}

/** All tracks by an artist. */
export async function getArtistTracks(id: string, limit = 50): Promise<Track[]> {
  return cached(`artist:${id}:${limit}`, async () => {
    const json = await request<Paged<RawTrack>>(`/music/artists/${id}/tracks`, {
      limit,
      order: 'plays',
      sort: 'desc',
    })
    return (json.data ?? []).map(mapTrack)
  })
}

/* ------------------------------------------------------------------ */
/* Genre helpers                                                       */
/* ------------------------------------------------------------------ */

/**
 * UI genre name -> Free To Use category name. Genres without an exact
 * category (Indie) fall back to full-text search, then to the chart.
 */
export const GENRE_QUERY: Record<string, string> = {
  Chill: 'Chill',
  Workout: 'Workout',
  Focus: 'Ambient',
  Jazz: 'Jazz',
  Dance: 'Dance',
  'Lo-Fi': 'Lofi',
  Sleep: 'Calm',
  Electronic: 'Electronic',
  HipHop: 'Hip Hop',
  Rock: 'Rock',
  Pop: 'Upbeat',
  Soul: 'Funky',
  // Unmapped on purpose: Indie -> search fallback.
}

/** All genres offered on the Genres / Radio screens. */
export const ALL_GENRES = [
  'Chill',
  'Workout',
  'Indie',
  'Focus',
  'Jazz',
  'Dance',
  'Lo-Fi',
  'Sleep',
  'Electronic',
  'HipHop',
  'Rock',
  'Pop',
  'Soul',
]

/** Tracks for a genre — category first, search next, chart last. */
export async function getGenreTracks(genre: string, limit = 30): Promise<Track[]> {
  const categoryName = GENRE_QUERY[genre] || genre
  const id = await categoryIdByName(categoryName)
  if (id) {
    const tracks = await cached(`genre:${id}:${limit}`, async () => {
      const json = await request<Paged<RawTrack>>(`/music/categories/${id}/tracks`, {
        limit,
        order: 'plays',
        sort: 'desc',
      })
      return (json.data ?? []).map(mapTrack)
    })
    if (tracks.length > 0) return tracks
  }
  // No category (e.g. Indie) — try a full-text search for the term.
  const viaSearch = await searchTracks(genre, limit)
  if (viaSearch.length > 0) return viaSearch
  return getTrending({ limit })
}

/** Tracks matching a mood category — used by Radio stations. */
export async function getMoodTracks(mood: string, limit = 30, offset = 0): Promise<Track[]> {
  const id = await categoryIdByName(mood)
  if (id) {
    const json = await request<Paged<RawTrack>>(`/music/categories/${id}/tracks`, {
      limit,
      offset,
      order: 'plays',
      sort: 'desc',
    })
    const tracks = (json.data ?? []).map(mapTrack)
    if (tracks.length > 0) return tracks
  }
  return getTrending({ limit, offset })
}
