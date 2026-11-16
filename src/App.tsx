import { useMemo, useState } from 'react';
import { Download, Loader2, Pause, Search, Volume2, X } from 'lucide-react';
import {
  INITIAL_SOUNDS,
  SPONSOR_ADS,
  type SoundCategory,
  type SoundItem,
} from './data/soundsCatalog';
import {
  downloadSoundWav,
  playSoundPreview,
  stopCurrentPlayback,
} from './audio/soundEngine';
import { TopBar, type CategoryFilter } from './components/TopBar';
import {
  InFeedNativeAd,
  LeaderboardBannerAd,
  SidebarSponsorCard,
} from './components/BannerAd';
import { SoundRow } from './components/SoundRow';
import { SubmitSoundModal } from './components/SubmitSoundModal';

type SortMode = 'popular' | 'shortest' | 'az';

const SECTION_DESCRIPTIONS: Record<SoundCategory, string> = {
  Memes: 'Punchy reaction stingers, vine booms, airhorns, and comedic timing clips.',
  'Background Music': 'Clean, royalty-free instrumental beds for vlogs, commentary, and B-roll.',
  SFX: 'Crisp whooshes, UI clicks, chimes, and cinematic impacts for crisp edits.',
};

export default function App() {
  const [sounds, setSounds] = useState<SoundItem[]>(INITIAL_SOUNDS);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortMode>('popular');

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  const [showTopBanner, setShowTopBanner] = useState(true);
  const [showAllAds, setShowAllAds] = useState(true);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isBarDownloading, setIsBarDownloading] = useState(false);

  const categoryCounts = useMemo(() => {
    return {
      All: sounds.length,
      Memes: sounds.filter((s) => s.category === 'Memes').length,
      'Background Music': sounds.filter((s) => s.category === 'Background Music').length,
      SFX: sounds.filter((s) => s.category === 'SFX').length,
    };
  }, [sounds]);

  const filteredSounds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = sounds.filter((item) => {
      const matchesCat = activeCategory === 'All' || item.category === activeCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'shortest') return a.durationSec - b.durationSec;
      if (sortBy === 'az') return a.title.localeCompare(b.title);
      return b.downloads - a.downloads;
    });
  }, [sounds, activeCategory, searchQuery, sortBy]);

  const activePlayingSound = useMemo(
    () => sounds.find((s) => s.id === playingId) ?? null,
    [sounds, playingId]
  );

  const handleTogglePlay = async (sound: SoundItem, startRatio?: number) => {
    if (playingId === sound.id && startRatio === undefined) {
      stopCurrentPlayback();
      setPlayingId(null);
      setPlaybackProgress(0);
      return;
    }

    setPlayingId(sound.id);
    setPlaybackProgress(startRatio ?? 0);

    await playSoundPreview(
      sound,
      startRatio ?? 0,
      (ratio) => setPlaybackProgress(ratio),
      () => {
        setPlayingId(null);
        setPlaybackProgress(0);
      }
    );
  };

  const handleDownload = async (sound: SoundItem) => {
    await downloadSoundWav(sound);
    setSounds((prev) =>
      prev.map((item) =>
        item.id === sound.id ? { ...item, downloads: item.downloads + 1 } : item
      )
    );
  };

  const handleAddSound = (newSound: SoundItem) => {
    setSounds((prev) => [newSound, ...prev]);
    setActiveCategory(newSound.category);
    setSearchQuery('');
  };

  const resetAllFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setSortBy('popular');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onOpenSubmitModal={() => setIsSubmitOpen(true)}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Top Non-Irritating Leaderboard Banner Ad */}
        {showAllAds && showTopBanner && (
          <div className="mb-7">
            <LeaderboardBannerAd
              ad={SPONSOR_ADS.leaderboard}
              onDismiss={() => setShowTopBanner(false)}
            />
          </div>
        )}

        {/* Hero / Intro Section */}
        <section className="mb-7">
          <div className="max-w-3xl">
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              SoundsHub
            </h1>
            <p className="mt-2 text-base text-slate-600 sm:text-lg leading-relaxed">
              Sounds Hub For Content Creators — Find and Download Various Sounds for Your Videos.
            </p>
          </div>

          {/* Search & Quick Section Cards */}
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-xl">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <label htmlFor="sound-search" className="sr-only">
                Search sounds
              </label>
              <input
                id="sound-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memes, background music, whoosh, boom..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="cursor-pointer absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono shrink-0">
              <span>{sounds.length} clips ready</span>
              <span aria-hidden="true">·</span>
              <span className="font-sans">Instant WAV preview &amp; download</span>
            </div>
          </div>

          {/* 3 Core Sections Selector Strip */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(['Memes', 'Background Music', 'SFX'] as SoundCategory[]).map((section) => {
              const isSelected = activeCategory === section;
              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => setActiveCategory(isSelected ? 'All' : section)}
                  className={`cursor-pointer rounded-xl border p-4 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className={`font-display text-base font-bold ${
                        isSelected ? 'text-blue-700' : 'text-slate-900'
                      }`}
                    >
                      {section}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {categoryCounts[section]} sounds
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {SECTION_DESCRIPTIONS[section]}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Catalog Toolbar */}
        <section id="sounds-catalog" aria-label="Sound Library" className="scroll-mt-20">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label="Filter sound categories"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 overflow-x-auto max-w-full"
            >
              {(['All', 'Memes', 'Background Music', 'SFX'] as CategoryFilter[]).map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveCategory(cat)}
                    className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat === 'All' ? 'All Sounds' : cat}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-500">
                {filteredSounds.length} {filteredSounds.length === 1 ? 'sound' : 'sounds'}
              </span>
              <label htmlFor="sort-select" className="sr-only">
                Sort sounds
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortMode)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="popular">Most Popular</option>
                <option value="shortest">Shortest First</option>
                <option value="az">Name A–Z</option>
              </select>
            </div>
          </div>

          {/* Main Grid: Sound List + Quiet Sidebar Ad */}
          <div
            className={`grid grid-cols-1 gap-6 lg:items-start ${
              showAllAds ? 'lg:grid-cols-[minmax(0,1fr)_300px]' : ''
            }`}
          >
            <div className="flex flex-col gap-3">
              {filteredSounds.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
                  <Volume2 className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
                  <h2 className="mt-3 font-display text-base font-bold text-slate-900">
                    No matching sounds found
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Try a different keyword or switch back to all sound sections.
                  </p>
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="cursor-pointer mt-4 inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-blue-600"
                  >
                    Show All Sounds
                  </button>
                </div>
              ) : (
                filteredSounds.map((sound, index) => (
                  <div key={sound.id} className="flex flex-col gap-3">
                    <SoundRow
                      sound={sound}
                      isPlaying={playingId === sound.id}
                      progress={playingId === sound.id ? playbackProgress : 0}
                      onTogglePlay={(item, ratio) => void handleTogglePlay(item, ratio)}
                      onDownload={handleDownload}
                    />

                    {/* Non-irritating In-Feed Native Ad placed cleanly after the 4th sound */}
                    {showAllAds && index === 3 && filteredSounds.length > 4 && (
                      <InFeedNativeAd ad={SPONSOR_ADS.infeed} />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Quiet Right Column: Non-intrusive Sponsor */}
            {showAllAds && (
              <div className="flex flex-col gap-4 lg:sticky lg:top-20">
                <SidebarSponsorCard
                  ad={SPONSOR_ADS.sidebar}
                  onHideAllAds={() => setShowAllAds(false)}
                />
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Slim Bottom Preview Bar (only shown while playing audio, <60px height) */}
      {activePlayingSound && (
        <div
          role="region"
          aria-label="Active audio preview"
          className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-sm"
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => void handleTogglePlay(activePlayingSound)}
                aria-label={`Stop ${activePlayingSound.title}`}
                className="cursor-pointer flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
              >
                <Pause className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {activePlayingSound.title}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  {activePlayingSound.category} · {activePlayingSound.durationLabel}
                </p>
              </div>
            </div>

            <div className="hidden sm:block flex-1 max-w-xs">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-blue-600 transition-transform duration-75 origin-left"
                  style={{ transform: `scaleX(${Math.max(0.02, playbackProgress)})` }}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={isBarDownloading}
              onClick={async () => {
                if (isBarDownloading) return;
                setIsBarDownloading(true);
                try {
                  await Promise.all([
                    handleDownload(activePlayingSound),
                    new Promise((resolve) => setTimeout(resolve, 350)),
                  ]);
                } finally {
                  setIsBarDownloading(false);
                }
              }}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 ${
                isBarDownloading
                  ? 'cursor-wait bg-blue-600'
                  : 'cursor-pointer bg-slate-900 hover:bg-blue-600'
              }`}
            >
              {isBarDownloading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Download {activePlayingSound.format}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 text-xs text-slate-500 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-bold text-slate-800">SoundsHub</span>
            <span aria-hidden="true">·</span>
            <span>Sounds Hub For Content Creators</span>
          </div>
          <span>Royalty-free audio for content creators</span>
        </div>
      </footer>

      <SubmitSoundModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onAddSound={handleAddSound}
      />
    </div>
  );
}
