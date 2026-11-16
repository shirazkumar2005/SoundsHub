import { useEffect, useState } from 'react';
import { Download, Loader2, Pause, Play } from 'lucide-react';
import type { SoundItem } from '../data/soundsCatalog';
import { getSoundWaveform } from '../audio/soundEngine';

interface SoundRowProps {
  sound: SoundItem;
  isPlaying: boolean;
  progress: number;
  onTogglePlay: (sound: SoundItem, startRatio?: number) => void;
  onDownload: (sound: SoundItem) => Promise<void>;
}

const DEFAULT_PEAKS = Array.from({ length: 36 }, (_, i) =>
  0.25 + 0.55 * Math.abs(Math.sin(i * 0.45))
);

export function SoundRow({
  sound,
  isPlaying,
  progress,
  onTogglePlay,
  onDownload,
}: SoundRowProps) {
  const [peaks, setPeaks] = useState<number[]>(DEFAULT_PEAKS);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let active = true;
    void getSoundWaveform(sound, 36).then((computed) => {
      if (active) setPeaks(computed);
    });
    return () => {
      active = false;
    };
  }, [sound]);

  const handleDownloadClick = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await Promise.all([
        onDownload(sound),
        new Promise((resolve) => setTimeout(resolve, 350)),
      ]);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <article
      className={`group rounded-xl border bg-white p-4 transition-colors duration-150 ${
        isPlaying
          ? 'border-blue-600/60 ring-1 ring-blue-600/15'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Play Preview Button + Sound Title & Unboxed Metadata */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onTogglePlay(sound)}
            aria-label={isPlaying ? `Pause ${sound.title}` : `Play preview of ${sound.title}`}
            className={`cursor-pointer flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
              isPlaying
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-100 text-slate-800 hover:bg-blue-600 hover:text-white'
            }`}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4 fill-current translate-x-0.5" aria-hidden="true" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <h3 className="text-base font-semibold text-slate-900 leading-snug">
                {sound.title}
              </h3>
              {sound.isNew && (
                <span className="text-xs font-medium text-blue-600">New</span>
              )}
            </div>

            {/* Zero-pill unboxed metadata: file format, length, size, and category */}
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 font-mono">
              <span>{sound.format}</span>
              <span aria-hidden="true">·</span>
              <span>{sound.durationLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{sound.fileSizeLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-sans font-medium text-slate-700">{sound.category}</span>
            </div>
          </div>
        </div>

        {/* Right: Interactive Waveform + Direct Download Button */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-1 sm:pt-0">
          {/* Interactive Waveform Scrubber */}
          <div
            role="group"
            aria-label={`Waveform preview for ${sound.title}`}
            className="flex h-9 items-center gap-[2.5px] px-1 cursor-pointer select-none"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(0.95, (e.clientX - rect.left) / rect.width));
              onTogglePlay(sound, ratio);
            }}
            title="Click anywhere on waveform to preview from that point"
          >
            {peaks.map((height, idx) => {
              const barRatio = idx / peaks.length;
              const isPassed = isPlaying && barRatio <= progress;
              return (
                <span
                  key={idx}
                  className={`w-[3px] rounded-full transition-colors duration-100 ${
                    isPassed
                      ? 'bg-blue-600'
                      : isPlaying
                        ? 'bg-blue-200'
                        : 'bg-slate-200 group-hover:bg-slate-300'
                  }`}
                  style={{ height: `${Math.round(height * 28)}px` }}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => void handleDownloadClick()}
            disabled={isDownloading}
            aria-label={`Download ${sound.title} as ${sound.format}`}
            className={`inline-flex h-10 min-w-[136px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
              isDownloading
                ? 'cursor-wait bg-blue-600 text-white'
                : 'cursor-pointer bg-slate-900 text-white hover:bg-blue-600'
            }`}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
