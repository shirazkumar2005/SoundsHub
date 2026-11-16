import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { FileAudio, Play, Square, Upload, X } from 'lucide-react';
import type { SoundCategory, SoundItem } from '../data/soundsCatalog';
import { playSoundPreview, stopCurrentPlayback } from '../audio/soundEngine';

interface SubmitSoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSound: (newSound: SoundItem) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDurationLabel(seconds: number): string {
  const rounded = Math.max(1, Math.round(seconds));
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function readAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      const dur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 2.0;
      resolve(dur);
    };
    audio.onerror = () => resolve(2.0);
    audio.src = url;
  });
}

export function SubmitSoundModal({ isOpen, onClose, onAddSound }: SubmitSoundModalProps) {
  const [title, setTitle] = useState('');
  const [soundType, setSoundType] = useState<SoundCategory>('SFX');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [durationSec, setDurationSec] = useState<number>(2);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const resetForm = (revokeUrl = true) => {
    stopCurrentPlayback();
    setIsPreviewing(false);
    if (revokeUrl && audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setTitle('');
    setSoundType('SFX');
    setDescription('');
    setSelectedFile(null);
    setAudioUrl('');
    setDurationSec(2);
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm(true);
    onClose();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(file.name)) {
      setErrorMsg('Please select a valid audio file (MP3, WAV, OGG, M4A, AAC, or FLAC).');
      return;
    }

    stopCurrentPlayback();
    setIsPreviewing(false);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    const nextUrl = URL.createObjectURL(file);
    const detectedDuration = await readAudioDuration(nextUrl);

    setSelectedFile(file);
    setAudioUrl(nextUrl);
    setDurationSec(detectedDuration);
    setErrorMsg('');

    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
      setTitle(cleanName);
    }
  };

  const handleTestAudio = async () => {
    if (!selectedFile || !audioUrl) {
      setErrorMsg('Please upload an audio file first to preview it.');
      return;
    }

    if (isPreviewing) {
      stopCurrentPlayback();
      setIsPreviewing(false);
      return;
    }

    setIsPreviewing(true);
    const ext = selectedFile.name.split('.').pop()?.toUpperCase() || 'AUDIO';
    const tempSound: SoundItem = {
      id: `preview-${Date.now()}`,
      title: title || selectedFile.name,
      category: soundType,
      description: '',
      durationSec,
      durationLabel: formatDurationLabel(durationSec),
      format: ext,
      fileSizeLabel: formatFileSize(selectedFile.size),
      downloads: 0,
      audioUrl,
      fileName: selectedFile.name,
    };

    try {
      await playSoundPreview(
        tempSound,
        0,
        () => {},
        () => setIsPreviewing(false)
      );
    } catch {
      setIsPreviewing(false);
      setErrorMsg('Could not decode this audio file in your browser. Try MP3, WAV, or OGG.');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (trimmedTitle.length < 2) {
      setErrorMsg('Please enter a sound name (at least 2 characters).');
      return;
    }

    if (!selectedFile || !audioUrl) {
      setErrorMsg('Please select an audio file to upload.');
      return;
    }

    stopCurrentPlayback();
    setIsPreviewing(false);

    const ext = selectedFile.name.split('.').pop()?.toUpperCase() || 'AUDIO';
    const newSound: SoundItem = {
      id: `custom-${Date.now()}`,
      title: trimmedTitle,
      category: soundType,
      description:
        trimmedDesc ||
        `Uploaded ${soundType.toLowerCase()} clip (${selectedFile.name}) ready for video timelines.`,
      durationSec,
      durationLabel: formatDurationLabel(durationSec),
      format: ext,
      fileSizeLabel: formatFileSize(selectedFile.size),
      downloads: 0,
      audioUrl,
      fileName: selectedFile.name,
      isNew: true,
    };

    onAddSound(newSound);
    resetForm(false); // Keep object URL alive for playback & download in catalog
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-sound-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 id="submit-sound-title" className="font-display text-lg font-bold text-slate-900">
              Submit a Sound to SoundsHub
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Upload your own audio clip to share and preview in the library.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label htmlFor="sound-title" className="block text-xs font-semibold text-slate-700">
              Sound Name
            </label>
            <input
              id="sound-title"
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. Fast Slide Whoosh"
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div>
            <label htmlFor="sound-type" className="block text-xs font-semibold text-slate-700">
              Sound Type
            </label>
            <select
              id="sound-type"
              value={soundType}
              onChange={(e) => setSoundType(e.target.value as SoundCategory)}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="Memes">Memes</option>
              <option value="Background Music">Background Music</option>
              <option value="SFX">SFX</option>
            </select>
          </div>

          <div>
            <label htmlFor="sound-file-upload" className="block text-xs font-semibold text-slate-700">
              Upload Sound File
            </label>
            <input
              ref={fileInputRef}
              id="sound-file-upload"
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
              onChange={(e) => void handleFileChange(e)}
              className="sr-only"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`mt-1.5 flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed px-4 py-3.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                selectedFile
                  ? 'border-blue-600 bg-blue-50/50'
                  : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    selectedFile ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  {selectedFile ? (
                    <FileAudio className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Upload className="h-4 w-4" aria-hidden="true" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {selectedFile ? selectedFile.name : 'Choose an audio file'}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedFile
                      ? `${formatDurationLabel(durationSec)} · ${formatFileSize(selectedFile.size)}`
                      : 'MP3, WAV, OGG, M4A, or FLAC'}
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                {selectedFile ? 'Replace' : 'Browse'}
              </span>
            </button>
          </div>

          <div>
            <label htmlFor="sound-desc" className="block text-xs font-semibold text-slate-700">
              Short Description (Optional)
            </label>
            <input
              id="sound-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Clean transition swoosh for fast YouTube shorts cuts."
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-red-600" role="alert">
              {errorMsg}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => void handleTestAudio()}
              disabled={!selectedFile}
              className="cursor-pointer inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {isPreviewing ? (
                <>
                  <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <span>Stop Preview</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <span>Test Preview</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="cursor-pointer h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cursor-pointer h-10 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Add to Library
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
