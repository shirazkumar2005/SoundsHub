import type { SoundCategory } from '../data/soundsCatalog';

export type CategoryFilter = 'All' | SoundCategory;

interface TopBarProps {
  activeCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  onOpenSubmitModal: () => void;
}

const NAV_ITEMS: { label: string; value: CategoryFilter }[] = [
  { label: 'All Sounds', value: 'All' },
  { label: 'Memes', value: 'Memes' },
  { label: 'Background Music', value: 'Background Music' },
  { label: 'SFX', value: 'SFX' },
];

export function TopBar({ activeCategory, onSelectCategory, onOpenSubmitModal }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        {/* Zone 1: Single-line Wordmark */}
        <button
          type="button"
          onClick={() => {
            onSelectCategory('All');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display cursor-pointer text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          SoundsHub
        </button>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav aria-label="Sound Sections" className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive = activeCategory === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  onSelectCategory(item.value);
                  const target = document.getElementById('sounds-catalog');
                  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`cursor-pointer text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1 py-0.5 ${
                  isActive
                    ? 'text-blue-600 underline decoration-blue-600 decoration-2 underline-offset-8'
                    : 'text-slate-600 hover:text-slate-900 hover:underline hover:decoration-slate-300 hover:underline-offset-8'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenSubmitModal}
            className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Submit Sound
          </button>
        </div>
      </div>
    </header>
  );
}
