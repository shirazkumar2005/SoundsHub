import { useState } from 'react';
import { ExternalLink, Volume2, X } from 'lucide-react';
import type { SponsorAdItem } from '../data/soundsCatalog';

interface BannerAdProps {
  ad: SponsorAdItem;
  onDismiss?: () => void;
}

function SponsorMediaThumb({
  imageUrl,
  imageAlt,
  aspectClass,
}: {
  imageUrl: string;
  imageAlt: string;
  aspectClass: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`${aspectClass} flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 border border-slate-200`}
      >
        <Volume2 className="h-5 w-5" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={imageAlt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${aspectClass} rounded-lg object-cover border border-slate-200/80 bg-slate-100`}
    />
  );
}

export function LeaderboardBannerAd({ ad, onDismiss }: BannerAdProps) {
  return (
    <aside
      aria-label="Sponsored banner"
      className="relative rounded-xl border border-slate-200 bg-white p-3.5 sm:px-5 sm:py-3.5 transition-colors duration-150 hover:border-slate-300"
    >
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="hidden sm:block shrink-0">
            <SponsorMediaThumb
              imageUrl={ad.imageUrl}
              imageAlt={ad.imageAlt}
              aspectClass="h-16 w-28"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Sponsored</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-700">{ad.sponsorName}</span>
            </div>
            <p className="mt-0.5 text-sm font-semibold text-slate-900 truncate sm:whitespace-normal">
              {ad.headline}
            </p>
            <p className="mt-0.5 text-xs text-slate-600 line-clamp-1">
              {ad.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <a
            href={ad.targetUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3.5 text-xs font-semibold text-slate-800 whitespace-nowrap transition-colors duration-150 hover:bg-slate-100 hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span>{ad.ctaLabel}</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
          </a>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Hide banner ad"
              title="Hide this ad"
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export function InFeedNativeAd({ ad }: BannerAdProps) {
  return (
    <aside
      aria-label="Sponsored placement"
      className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition-colors duration-150 hover:border-slate-300"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="shrink-0">
            <SponsorMediaThumb
              imageUrl={ad.imageUrl}
              imageAlt={ad.imageAlt}
              aspectClass="h-16 w-24"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Sponsored</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-700">{ad.sponsorName}</span>
            </div>
            <h3 className="mt-0.5 text-sm font-semibold text-slate-900">
              {ad.headline}
            </h3>
            <p className="mt-0.5 text-xs text-slate-600 line-clamp-2 max-w-xl">
              {ad.description}
            </p>
          </div>
        </div>

        <a
          href={ad.targetUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-800 whitespace-nowrap transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span>{ad.ctaLabel}</span>
          <ExternalLink className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
}

export function SidebarSponsorCard({
  ad,
  onHideAllAds,
}: {
  ad: SponsorAdItem;
  onHideAllAds: () => void;
}) {
  return (
    <aside
      aria-label="Sidebar Sponsor"
      className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-3.5"
    >
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Sponsored · {ad.sponsorName}</span>
        <button
          type="button"
          onClick={onHideAllAds}
          className="cursor-pointer text-slate-400 hover:text-slate-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          Hide ads
        </button>
      </div>

      <SponsorMediaThumb
        imageUrl={ad.imageUrl}
        imageAlt={ad.imageAlt}
        aspectClass="w-full aspect-[4/3]"
      />

      <div>
        <h3 className="text-sm font-semibold text-slate-900 leading-snug">
          {ad.headline}
        </h3>
        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
          {ad.description}
        </p>
      </div>

      <a
        href={ad.targetUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap transition-colors duration-150 hover:bg-slate-100 hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <span>{ad.ctaLabel}</span>
        <ExternalLink className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
      </a>

      <p className="text-[11px] text-slate-500 leading-snug border-t border-slate-100 pt-2.5">
        Clean creator sponsorships keep SoundsHub free with zero popups or download delays.
      </p>
    </aside>
  );
}
