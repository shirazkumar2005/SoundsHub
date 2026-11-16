export type SoundCategory = 'Memes' | 'Background Music' | 'SFX';

export type SynthPreset =
  | 'vine_boom'
  | 'sad_trombone'
  | 'airhorn'
  | 'record_scratch'
  | 'dramatic_chord'
  | 'fail_buzzer'
  | 'lofi_rhodes'
  | 'vlog_groove'
  | 'doc_tension'
  | 'tech_ambient'
  | 'acoustic_pluck'
  | 'late_night_chill'
  | 'whoosh'
  | 'cash_register'
  | 'ui_pop'
  | 'notify_chime'
  | 'glitch_zap'
  | 'cinematic_hit';

export interface SoundItem {
  id: string;
  title: string;
  category: SoundCategory;
  description: string;
  durationSec: number;
  durationLabel: string;
  format: string;
  fileSizeLabel: string;
  downloads: number;
  synthPreset?: SynthPreset;
  pitchMultiplier?: number;
  audioUrl?: string;
  fileName?: string;
  isNew?: boolean;
}

export interface SponsorAdItem {
  id: string;
  placement: 'leaderboard' | 'infeed' | 'sidebar';
  sponsorName: string;
  headline: string;
  description: string;
  ctaLabel: string;
  targetUrl: string;
  imageUrl: string;
  imageAlt: string;
}

export const INITIAL_SOUNDS: SoundItem[] = [
  // ======================== MEMES ========================
  {
    id: 'meme-vine-boom',
    title: 'Vine Boom Sub Drop',
    category: 'Memes',
    description: 'Deep, punchy sub-bass thud for sudden zoom-ins, punchlines, and reaction edits.',
    durationSec: 1.6,
    durationLabel: '0:02',
    format: 'WAV',
    fileSizeLabel: '275 KB',
    downloads: 48290,
    synthPreset: 'vine_boom',
  },
  {
    id: 'meme-sad-trombone',
    title: 'Sad Trombone Wah',
    category: 'Memes',
    description: 'Classic four-note descending wah-wah-wah-waaaah stinger for comedic fails.',
    durationSec: 2.5,
    durationLabel: '0:03',
    format: 'WAV',
    fileSizeLabel: '430 KB',
    downloads: 34120,
    synthPreset: 'sad_trombone',
  },
  {
    id: 'meme-airhorn',
    title: 'Triple Airhorn Blast',
    category: 'Memes',
    description: 'High-energy triple stadium horn burst for hype moments and montage highlights.',
    durationSec: 1.7,
    durationLabel: '0:02',
    format: 'WAV',
    fileSizeLabel: '293 KB',
    downloads: 29840,
    synthPreset: 'airhorn',
  },
  {
    id: 'meme-record-scratch',
    title: 'Record Scratch Freeze',
    category: 'Memes',
    description: 'Sudden vinyl brake pitch-drop for freeze-frame "yep, that is me" narrative cuts.',
    durationSec: 1.0,
    durationLabel: '0:01',
    format: 'WAV',
    fileSizeLabel: '172 KB',
    downloads: 26710,
    synthPreset: 'record_scratch',
  },
  {
    id: 'meme-dramatic-chord',
    title: 'Dramatic Plot Twist Sting',
    category: 'Memes',
    description: 'Suspenseful minor brass swell for exaggerated reveals and sudden plot twists.',
    durationSec: 2.2,
    durationLabel: '0:02',
    format: 'WAV',
    fileSizeLabel: '379 KB',
    downloads: 22450,
    synthPreset: 'dramatic_chord',
  },
  {
    id: 'meme-fail-buzzer',
    title: 'Game Show Wrong Buzzer',
    category: 'Memes',
    description: 'Blunt dual-tone buzzer for incorrect guesses, quiz parodies, and blooper reels.',
    durationSec: 1.1,
    durationLabel: '0:01',
    format: 'WAV',
    fileSizeLabel: '189 KB',
    downloads: 19380,
    synthPreset: 'fail_buzzer',
  },

  // ======================== BACKGROUND MUSIC ========================
  {
    id: 'bgm-lofi-rhodes',
    title: 'Lo-Fi Coffee Rhodes Loop',
    category: 'Background Music',
    description: 'Warm electric piano chords with soft tape texture, ideal behind talking-head commentary.',
    durationSec: 8.0,
    durationLabel: '0:08',
    format: 'WAV',
    fileSizeLabel: '1.38 MB',
    downloads: 31560,
    synthPreset: 'lofi_rhodes',
  },
  {
    id: 'bgm-vlog-groove',
    title: 'Upbeat Vlog Synth Groove',
    category: 'Background Music',
    description: 'Bright plucky synth arpeggio and clean four-on-the-floor pulse for travel & lifestyle vlogs.',
    durationSec: 8.0,
    durationLabel: '0:08',
    format: 'WAV',
    fileSizeLabel: '1.38 MB',
    downloads: 28910,
    synthPreset: 'vlog_groove',
  },
  {
    id: 'bgm-doc-tension',
    title: 'Documentary Pulse Bed',
    category: 'Background Music',
    description: 'Restrained low-end synth pulse with airy harmonics for storytelling and video essays.',
    durationSec: 8.0,
    durationLabel: '0:08',
    format: 'WAV',
    fileSizeLabel: '1.38 MB',
    downloads: 24190,
    synthPreset: 'doc_tension',
  },
  {
    id: 'bgm-tech-ambient',
    title: 'Tech Review Glass Pad',
    category: 'Background Music',
    description: 'Clean minimal ambient pad engineered to sit smoothly under product B-roll and voiceovers.',
    durationSec: 8.0,
    durationLabel: '0:08',
    format: 'WAV',
    fileSizeLabel: '1.38 MB',
    downloads: 21740,
    synthPreset: 'tech_ambient',
  },
  {
    id: 'bgm-acoustic-pluck',
    title: 'Morning Acoustic Pluck',
    category: 'Background Music',
    description: 'Gentle melodic pluck progression for tutorials, day-in-the-life reels, and intros.',
    durationSec: 8.0,
    durationLabel: '0:08',
    format: 'WAV',
    fileSizeLabel: '1.38 MB',
    downloads: 18650,
    synthPreset: 'acoustic_pluck',
  },
  {
    id: 'bgm-late-night-chill',
    title: 'Late Night Chill Sub',
    category: 'Background Music',
    description: 'Mellow warm chord bed with gentle sub bass for podcasts, gaming recaps, and streams.',
    durationSec: 8.0,
    durationLabel: '0:08',
    format: 'WAV',
    fileSizeLabel: '1.38 MB',
    downloads: 16420,
    synthPreset: 'late_night_chill',
  },

  // ======================== SFX ========================
  {
    id: 'sfx-whoosh',
    title: 'Smooth Whoosh Transition',
    category: 'SFX',
    description: 'Crisp air-sweep whoosh for B-roll whip pans, title cards, and scene transitions.',
    durationSec: 0.9,
    durationLabel: '0:01',
    format: 'WAV',
    fileSizeLabel: '155 KB',
    downloads: 41200,
    synthPreset: 'whoosh',
  },
  {
    id: 'sfx-cash-register',
    title: 'Cash Register Cha-Ching',
    category: 'SFX',
    description: 'Sharp mechanical latch and bright metallic bell ring for finance and sales callouts.',
    durationSec: 1.2,
    durationLabel: '0:01',
    format: 'WAV',
    fileSizeLabel: '206 KB',
    downloads: 35890,
    synthPreset: 'cash_register',
  },
  {
    id: 'sfx-ui-pop',
    title: 'Clean UI Pop Click',
    category: 'SFX',
    description: 'Tight resonant bubble pop for on-screen captions, emojis, and subscribe animations.',
    durationSec: 0.3,
    durationLabel: '0:01',
    format: 'WAV',
    fileSizeLabel: '52 KB',
    downloads: 39410,
    synthPreset: 'ui_pop',
  },
  {
    id: 'sfx-notify-chime',
    title: 'Two-Tone Alert Chime',
    category: 'SFX',
    description: 'Clean studio chime for tip callouts, chapter markers, and screen notifications.',
    durationSec: 1.3,
    durationLabel: '0:01',
    format: 'WAV',
    fileSizeLabel: '224 KB',
    downloads: 27330,
    synthPreset: 'notify_chime',
  },
  {
    id: 'sfx-glitch-zap',
    title: 'Digital Glitch Stutter',
    category: 'SFX',
    description: 'Fast stepped FM data burst for jump cuts, tech transitions, and HUD overlays.',
    durationSec: 0.7,
    durationLabel: '0:01',
    format: 'WAV',
    fileSizeLabel: '121 KB',
    downloads: 23680,
    synthPreset: 'glitch_zap',
  },
  {
    id: 'sfx-cinematic-hit',
    title: 'Cinematic Trailer Impact',
    category: 'SFX',
    description: 'Heavy low-end impact boom with clean reverb decay for title reveals and cold opens.',
    durationSec: 2.1,
    durationLabel: '0:02',
    format: 'WAV',
    fileSizeLabel: '362 KB',
    downloads: 30940,
    synthPreset: 'cinematic_hit',
  },
];

export const SPONSOR_ADS: Record<'leaderboard' | 'infeed' | 'sidebar', SponsorAdItem> = {
  leaderboard: {
    id: 'ad-leaderboard-mic',
    placement: 'leaderboard',
    sponsorName: 'RodeCast Studio Gear',
    headline: 'Broadcast-Grade USB & XLR Microphones for Video Creators',
    description: 'Capture crisp voiceovers at home without room echo. Creator bundle includes shock mount and pop filter.',
    ctaLabel: 'View Gear',
    targetUrl: 'https://rode.com',
    imageUrl: '/src/assets/images/sponsor_studio_mic_1794831475634.jpg',
    imageAlt: 'Matte black studio condenser microphone mounted on a desk boom arm',
  },
  infeed: {
    id: 'ad-infeed-suite',
    placement: 'infeed',
    sponsorName: 'CutFlow Post-Production',
    headline: 'Auto-Sync Sound Effects & Normalize Dialogue Loudness in One Click',
    description: 'Lightweight audio mastering plugin compatible with Premiere Pro, DaVinci Resolve, and Final Cut.',
    ctaLabel: 'Try Free Trial',
    targetUrl: 'https://www.blackmagicdesign.com/products/davinciresolve',
    imageUrl: '/src/assets/images/sponsor_editing_suite_1794831476697.jpg',
    imageAlt: 'Overhead view of studio monitoring headphones and laptop on a gray desk',
  },
  sidebar: {
    id: 'ad-sidebar-interface',
    placement: 'sidebar',
    sponsorName: 'SonicPro Hardware',
    headline: 'Compact 24-Bit Audio Interface for Desk Setups',
    description: 'Ultra-low-noise preamps with direct zero-latency headphone monitoring for YouTubers and podcasters.',
    ctaLabel: 'See Specs',
    targetUrl: 'https://focusrite.com',
    imageUrl: '/src/assets/images/sponsor_audio_interface_1794831475911.jpg',
    imageAlt: 'Silver USB audio interface with rotary gain knobs on dark slate surface',
  },
};
